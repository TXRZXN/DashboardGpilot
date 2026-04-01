import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { ServiceResponse, TradeRequest, Deal } from '@/shared/types/api';

const logger = createLogger('TradeHistoryService');

/**
 * Service สำหรับจัดการประวัติการเทรด (Deals)
 */
export const TradeHistoryService = {
  /**
   * ดึงประวัติการเทรดแบบเรียลไทม์จาก Backend
   */
  getHistory: async (params?: TradeRequest): Promise<ServiceResponse<Deal[]>> => {
    try {
      logger.info('Fetching trade history', { params });
      
      const response = await apiClient<ServiceResponse<Deal[]>>(
        ENDPOINTS.TRADES, 
        undefined, 
        params as any
      );
      
      return response;
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError 
        ? e.message 
        : 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการทำรายการ';
      
      logger.error('Failed to fetch trade history', e instanceof Error ? e : String(e));
      
      return {
        success: false,
        data: null,
        error: { code: 'FETCH_ERROR', message: errorMsg },
      };
    }
  },
};
