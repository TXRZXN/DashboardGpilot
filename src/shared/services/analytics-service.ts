import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { ServiceResponse, DashboardSummary, TradeRequest, GroupedTradesResponse } from '@/shared/types/api';

const logger = createLogger('AnalyticsService');

/**
 * Service สำหรับ Analytics page
 * - getPerformance: ดึง performance metrics ทั้งหมดจาก Backend
 * - getGroupedTrades: ดึง trade history ที่ grouped by position แล้ว
 * - getDashboardSummary: ดึง dashboard summary (timeline profits + symbol stats)
 */
export const AnalyticsService = {
  /**
   * ดึง Trade History ที่ grouped by position (round-turn)
   */

  getGroupedTrades: async (params?: TradeRequest): Promise<ServiceResponse<GroupedTradesResponse>> => {
    try {
      logger.info('Fetching grouped trades', { params });

      // Map parameters to Backend-Main aliases (v3)
      const mappedParams: Record<string, any> = { ...params };
      
      if (params?.from_date) mappedParams.date_from = params.from_date;
      if (params?.to_date) mappedParams.end_date = params.to_date;
      if (params?.pageNumber) mappedParams.page = params.pageNumber;
      if (params?.pageSize) mappedParams.limit = params.pageSize;

      // Only pass params if not empty to match expected apiClient behavior in tests
      const finalParams = Object.keys(mappedParams).length > 0 ? mappedParams : undefined;

      return await apiClient<ServiceResponse<GroupedTradesResponse>>(
        ENDPOINTS.TRADES_GROUPED,
        undefined,
        finalParams,
      );
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาดในการดึง grouped trades';
      logger.error('Failed to fetch grouped trades', e instanceof Error ? e : String(e));
      return { success: false, data: null, error: { code: 'FETCH_ERROR', message: errorMsg } };
    }
  },

  /**
   * ดึง Dashboard Summary
   */
  getDashboardSummary: async (params?: TradeRequest): Promise<ServiceResponse<DashboardSummary>> => {
    try {
      logger.info('Fetching dashboard summary', { params });
      return await apiClient<ServiceResponse<DashboardSummary>>(
        ENDPOINTS.DASHBOARD_SUMMARY,
        undefined,
        params as any,
      );
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาดในการดึง dashboard summary';
      logger.error('Failed to fetch dashboard summary', e instanceof Error ? e : String(e));
      return { success: false, data: null, error: { code: 'FETCH_ERROR', message: errorMsg } };
    }
  },
};
