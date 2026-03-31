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
  checkHealth: async (): Promise<HealthResponse> => {
    try {
      logger.debug('Checking API health');
      const response = await apiClient<HealthResponse>(ENDPOINTS.HEALTH);
      
      if (response.success) {
        logger.debug('API health check passed', { status: response.data.status });
      } else {
        logger.warn('API health check returned unsuccessful status', { error: response.error });
      }
      
      return response;
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'Cannot connect to API Server';
      logger.error('API health check failed', e instanceof Error ? e : String(e));
      
      return {
        success: false,
        data: { status: 'down' },
        error: errorMsg,
      };
    }
  },
};
