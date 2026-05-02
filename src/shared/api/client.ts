import { ApiError } from './api-error';
import { API_GATEWAY_MAIN, API_GATEWAY_SUB, SUB_ENDPOINTS } from './endpoint';
import { logger } from '@/shared/utils/logger';

// Module-level variable to synchronize token refresh calls
let refreshPromise: Promise<boolean> | null = null;

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
  endpoint: string,
  skipInternalHeaders?: boolean
): Promise<{ success: boolean; data?: T; retryable?: boolean; errorStatus?: number; error?: any }> => {
  try {
    logger.info(`Fetching: ${url}`, { traceId, attempt, method: options.method || 'GET' });

    // ดึง Token จาก Storage (แยกตามระบบหลัก vs ROR)
    const tokenKey = skipInternalHeaders ? 'ror_auth_token' : 'auth_token';
    const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;

    const response = await fetch(url, {
      ...options,
      headers: {
        // ข้าม Header อัตโนมัติทั้งหมดถ้าเป็นบริการภายนอก (เช่น ROR)
        ...(skipInternalHeaders ? {} : { 
          'Content-Type': 'application/json',
          'X-Trace-ID': traceId,
        }),
        ...(!skipInternalHeaders && token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      // 401 Unauthorized is handled specially for token refresh
      if (response.status === 401) {
        return { success: false, retryable: false, errorStatus: 401 };
      }

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
  endpoint: string,
  skipInternalHeaders?: boolean,
  skipAuthRefresh?: boolean
): Promise<T> => {
  let attempt = 0;
  let lastError: any;

  while (attempt < RETRY_CONFIG.maxAttempts) {
    attempt++;
    const result = await executeSingleFetch<T>(url, options, traceId, attempt, endpoint, skipInternalHeaders);
    
    if (result.success) {
      return result.data as T;
    }

    // Handle 401 Unauthorized (Token Expired)
    if (result.errorStatus === 401 && !skipAuthRefresh && !skipInternalHeaders) {
      logger.warn('Unauthorized (401) detected. Attempting token refresh...', { traceId, endpoint });

      try {
        // Concurrency Lock: If multiple requests fail at the same time, only one refresh call is made
        if (!refreshPromise) {
          // Dynamic import to avoid circular dependency
          const { AuthService } = await import('@/shared/services/auth-service');
          refreshPromise = AuthService.refreshToken().then(res => {
             refreshPromise = null; // Reset for future use
             return res.success;
          });
        }

        const isRefreshed = await refreshPromise;
        if (isRefreshed) {
           logger.info('Token refreshed. Retrying original request...', { traceId });
           // Retry exactly once with the new token
           return performFetchWithRetry<T>(url, options, traceId, endpoint, skipInternalHeaders, true);
        } else {
           throw new ApiError('Session expired. Please login again.', 401);
        }
      } catch (err) {
        logger.error('Failed to refresh token during request', err instanceof Error ? err : String(err), { traceId });
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }

    if (result.retryable) {
      lastError = result.errorStatus || result.error;
      const delay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
      logger.warn(`Retryable error occurring. Retrying in ${delay}ms...`, { traceId, attempt });
      await sleep(delay);
      continue;
    }
    
    // Non-retryable error
    lastError = result.errorStatus || result.error || 'Unknown Error';
    break;
  }

  if (lastError instanceof ApiError) {
    logger.error(`API Error: ${endpoint}`, lastError, { traceId });
    throw lastError;
  }

  const finalError = lastError instanceof Error ? lastError : new Error(String(lastError));
  logger.error(`Network Error: ${endpoint}`, finalError, { traceId });
  throw new ApiError(finalError.message, typeof lastError === 'number' ? lastError : 500);
};

/**
 * apiClient (Client-side)
 * ใช้สำหรับการดึงข้อมูลจาก Backend พร้อมรองรับ Trace ID, Retry และ Logging
 */
export const apiClient = async <T>(
  endpoint: string,
  options?: RequestInit,
  params?: Record<string, string | number | boolean | null | undefined>,
  serviceBase?: string,
  skipAuthRefresh?: boolean
): Promise<T> => {
  const traceId = generateTraceId();
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // เลือกใช้อันที่ส่งมาหรือใช้ค่าพื้นฐาน
  const base = serviceBase || API_GATEWAY_MAIN;
  const isSubService = base.includes('/api/gateway/sub');
  const isRorService = base.includes('/api/gateway/ror');


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
   * - ถ้าเป็น Sub Service: /api/v1/{endpoint}
   * - ถ้าเป็น Main Service: /api/v1/{accountId}/{endpoint}
   */
  let apiPath = '';
  if (isSubService) {
    apiPath = `/api/v1${safeEndpoint}`;
  } else if (isRorService) {
    // ROR Service เป็น External/Dedicated - ไม่ต้องเติม /api/v1/{accountId}
    apiPath = safeEndpoint;
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

  console.log(`[API Client] Calling: ${url} (Service: ${accountId})`);

  // ถ้าเป็น ROR Service ให้ข้าม Header ภายในโดยอัตโนมัติ เพื่อไม่ให้ API ภายนอกพัง
  const skipInternalHeaders = isRorService;

  return performFetchWithRetry<T>(url, options || {}, traceId, endpoint, skipInternalHeaders, skipAuthRefresh);
};
