import { ApiError } from './api-error';
import { API_GATEWAY_MAIN } from './endpoint';
import { logger } from '@/shared/utils/logger';

// API Key injection (Global Rule #Security)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || process.env.NEXT_PUBLIC_INTERNAL_API_KEY || 'Tarzan';

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

    // ดึง Token จาก Storage (Global Rule #Security)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': traceId,
        'X-API-Key': INTERNAL_API_KEY,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
  params?: Record<string, string | number | boolean | null | undefined>,
  serviceBase?: string
): Promise<T> => {
  const traceId = generateTraceId();
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // เลือกใช้อันที่ส่งมาหรือใช้ค่าพื้นฐาน
  const base = serviceBase || API_GATEWAY_MAIN;
  const isSubService = base.includes('/api/gateway/sub');

  // ดึง accountId จาก base (เช่น /api/gateway/gpilot -> gpilot)
  const getAccountId = (b: string) => {
    if (b.includes('/api/gateway/')) {
      const parts = b.split('/api/gateway/');
      return parts[1] || 'gpilot';
    }
    return 'gpilot';
  };

  const accountId = getAccountId(base);

  /**
   * สร้าง Final Path
   * - ถ้าเป็น Sub Service: /api/gateway/sub/api/v1/{endpoint}
   * - ถ้าเป็น Main Service: /api/gateway/gpilot/api/v1/{accountId}/{endpoint}
   */
  let apiPath = '';
  if (isSubService) {
    apiPath = `/api/v1${safeEndpoint}`;
  } else {
    // สำหรับ Main Backend: /api/v1/{accountId}/{endpoint}
    apiPath = `/api/v1/${accountId}${safeEndpoint}`;
  }

  const urlBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const finalEndpoint = `${urlBase}${apiPath}`;

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
