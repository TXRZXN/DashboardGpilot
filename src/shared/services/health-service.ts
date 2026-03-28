import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import type { HealthResponse, ServiceResponse } from '@/shared/types/api';

/**
 * Service สำหรับตรวจสอบความพร้อมของ API และ MT5
 */
export const HealthService = {
  /**
   * ตรวจสอบสถานะเขื่อมต่อ
   */
  checkHealth: async (): Promise<HealthResponse> => {
    try {
      const response = await apiClient<HealthResponse>(ENDPOINTS.HEALTH);
      return response;
    } catch (e: unknown) {
      return {
        success: false,
        data: { status: 'down' },
        error: e instanceof ApiError ? e.message : 'Cannot connect to API Server',
      };
    }
  },
};
