import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { HealthResponse } from '@/shared/types/api';

const logger = createLogger('HealthService');

/**
 * Service สำหรับตรวจสอบความพร้อมของ API และ MT5
 */
export const HealthService = {
  /**
   * ตรวจสอบสถานะเชื่อมต่อ
   */
  checkHealth: async (serviceBase?: string): Promise<HealthResponse> => {
    try {
      logger.debug('Checking API health', { serviceBase });
      const response = await apiClient<HealthResponse>(ENDPOINTS.HEALTH, undefined, undefined, serviceBase);
      
      if (response.success) {
        logger.debug('API health check passed', { status: response.data.status, serviceBase });
      } else {
        logger.warn('API health check returned unsuccessful status', { error: response.error, serviceBase });
      }
      
      return response;
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'Cannot connect to API Server';
      logger.error('API health check failed', { error: e instanceof Error ? e : String(e), serviceBase });
      
      return {
        success: false,
        data: { status: 'down' },
        error: errorMsg,
      };
    }
  },
};
