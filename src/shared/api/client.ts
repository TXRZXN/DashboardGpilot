import { ApiError } from './api-error';
import { API_GATEWAY_MAIN } from './endpoint';
import { logger } from '@/shared/utils/logger';

// Configuration for Retry Strategy (Global Rule #3)
const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  retryableStatuses: [429, 502, 503, 504],
};

/**
 * generateTraceId
 * สร้าง Trace ID แบบสุ่มสำหรับ Distributed Tracing
 */
const generateTraceId = () => Math.random().toString(36).substring(2, 15);

/**
 * sleep
 * Helper สำหรับการรอคอยระหว่าง Retry
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * executeSingleFetch
 * ทำการดึงข้อมูลหนึ่งครั้ง พร้อมจัดการ response และ retryable logic
 */
const executeSingleFetch = async <T>(
  url: string,
  options: RequestInit,
  traceId: string,
  attempt: number,
  endpoint: string
): Promise<{ success: boolean; data?: T; retryable?: boolean; errorStatus?: number; error?: any }> => {
  try {
    logger.info(`Fetching: ${url}`, { traceId, attempt, method: options.method || 'GET' });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': traceId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || errorData.detail || response.statusText;

      const isRetryable = RETRY_CONFIG.retryableStatuses.includes(response.status) && attempt < RETRY_CONFIG.maxAttempts;
      
      if (isRetryable) {
        return { success: false, retryable: true, errorStatus: response.status };
      }

      throw new ApiError(
        typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        response.status,
        errorData
      );
    }

    const data = await response.json();
    logger.debug(`Fetch Success: ${endpoint}`, { traceId });
    return { success: true, data: data as T };
  } catch (error) {
    if (!(error instanceof ApiError) && attempt < RETRY_CONFIG.maxAttempts) {
      return { success: false, retryable: true, error };
    }
    throw error;
  }
};

/**
 * performFetchWithRetry
 * ทำการดึงข้อมูลพร้อมระบบ Retry และ Logging
 */
const performFetchWithRetry = async <T>(
  url: string,
  options: RequestInit,
  traceId: string,
  endpoint: string
): Promise<T> => {
  let attempt = 0;
  let lastError: any;

  while (attempt < RETRY_CONFIG.maxAttempts) {
    attempt++;
    const result = await executeSingleFetch<T>(url, options, traceId, attempt, endpoint);
    
    if (result.success) {
      return result.data as T;
    }

    if (result.retryable) {
      lastError = result.errorStatus || result.error;
      const delay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
      logger.warn(`Retryable error occurring. Retrying in ${delay}ms...`, { traceId, attempt });
      await sleep(delay);
      continue;
    }
    
    break;
  }

  if (lastError instanceof ApiError) {
    logger.error(`API Error: ${endpoint}`, lastError, { traceId });
    throw lastError;
  }
  const finalError = lastError instanceof Error ? lastError : new Error(String(lastError));
  logger.error(`Network Error: ${endpoint}`, finalError, { traceId });
  throw new ApiError(finalError.message, 500);
};

/**
 * apiClient (Client-side)
 * ใช้สำหรับการดึงข้อมูลจาก Backend พร้อมรองรับ Trace ID, Retry และ Logging
 */
export const apiClient = async <T>(
  endpoint: string,
  options?: RequestInit,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<T> => {
  const traceId = generateTraceId();
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const finalEndpoint = safeEndpoint.startsWith('/api/gateway')
    ? safeEndpoint
    : `${API_GATEWAY_MAIN}${safeEndpoint}`;

  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const url = `${finalEndpoint}${queryString}`;

  return performFetchWithRetry<T>(url, options || {}, traceId, endpoint);
};
