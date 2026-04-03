import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { ServiceResponse, CashflowSummary, TradeRequest } from '@/shared/types/api';

const logger = createLogger('CashflowService');

/**
 * Service สำหรับ Cashflow page
 */
export const CashflowService = {
  /**
   * ดึง Cashflow Summary จาก Backend
   * รวม: transactions[], balanceData[], deposits, withdrawals, netFlow
   */
  getCashflowSummary: async (params?: TradeRequest): Promise<ServiceResponse<CashflowSummary>> => {
    try {
      logger.info('Fetching cashflow summary', { params });
      return await apiClient<ServiceResponse<CashflowSummary>>(
        ENDPOINTS.CASHFLOW_SUMMARY,
        undefined,
        params as any,
      );
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาดในการดึง cashflow summary';
      logger.error('Failed to fetch cashflow summary', e instanceof Error ? e : String(e));
      return { success: false, data: null, error: { code: 'FETCH_ERROR', message: errorMsg } };
    }
  },
};
