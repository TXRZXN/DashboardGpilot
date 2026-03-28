import { ApiError } from './api-error';
import { API_BASE_URL } from './endpoint';

/**
 * apiClient (Client-side)
 * ใช้สำหรับการดึงข้อมูลจาก Backend โดยตรง
 */
export const apiClient = async <T>(
  endpoint: string, 
  options?: RequestInit,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<T> => {
  // สร้าง Query String จาก params
  const queryString = params 
    ? '?' + Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&')
    : '';

  const url = `${API_BASE_URL}${endpoint}${queryString}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || errorData.detail || response.statusText;
      
      // ดักจับรูปแบบ Error พิเศษ (422, 503)
      throw new ApiError(
        typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), 
        response.status,
        errorData
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Unknown Network Error', 500);
  }
};
