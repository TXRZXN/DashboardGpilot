import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import type { TradesHistoryResponse, ServiceResponse, TradeRequest } from '@/shared/types/api';

/**
 * Service สำหรับจัดการประวัติการเทรด (Deals)
 */
export const TradeHistoryService = {
  /**
   * ดึงประวัติการเทรดแบบเรียลไทม์จาก Backend
   */
  getHistory: async (params?: TradeRequest): Promise<ServiceResponse<TradesHistoryResponse>> => {
    try {
      // apiClient จะคืนค่า { success, data, error } ที่ส่งมาจาก Backend โดยตรง
      const response = await apiClient<ServiceResponse<TradesHistoryResponse>>(ENDPOINTS.TRADES, undefined, params as any);
      return response;
    } catch (e: unknown) {
      const errorData =
        e instanceof ApiError
          ? e.message
          : 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการทำรายการ';
      return {
        success: false,
        data: null,
        error: errorData,
      };
    }
  },
};
