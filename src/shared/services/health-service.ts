import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS, SUB_ENDPOINTS } from '@/shared/api/endpoint';
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
  checkHealth: async (serviceBase?: string): Promise<HealthResponse & { service?: string }> => {
    try {
      const isSub = serviceBase?.includes('/sub');
      const endpoint = isSub ? SUB_ENDPOINTS.HEALTH : ENDPOINTS.HEALTH; // Sub-Backend uses /health or /api/v1/health
      
      logger.debug('Checking API health', { serviceBase, endpoint });
      const response = await apiClient<HealthResponse>(endpoint, undefined, undefined, serviceBase);
      
      return {
        ...response,
        service: isSub ? 'sub' : 'main'
      };
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'Cannot connect to API Server';
      logger.error('API health check failed', { error: e instanceof Error ? e : String(e), serviceBase });
      
      return {
        success: false,
        data: { status: 'down' },
        error: errorMsg,
        service: serviceBase?.includes('/sub') ? 'sub' : 'main'
      };
    }
  },
};
