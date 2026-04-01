import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { ServiceResponse, PerformanceStats, DashboardSummary, TradeRequest, GroupedTradesResponse } from '@/shared/types/api';

const logger = createLogger('AnalyticsService');

/**
 * Service สำหรับ Analytics page
 * - getPerformance: ดึง performance metrics ทั้งหมดจาก Backend
 * - getGroupedTrades: ดึง trade history ที่ grouped by position แล้ว
 * - getDashboardSummary: ดึง dashboard summary (timeline profits + symbol stats)
 */
export const AnalyticsService = {
  /**
   * ดึง Performance Statistics ทั้งหมดจาก Backend
   */
  getPerformance: async (params?: TradeRequest): Promise<ServiceResponse<PerformanceStats>> => {
    try {
      logger.info('Fetching performance stats', { params });
      return await apiClient<ServiceResponse<PerformanceStats>>(
        ENDPOINTS.ANALYTICS_PERFORMANCE,
        undefined,
        params as any,
      );
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาดในการดึง performance stats';
      logger.error('Failed to fetch performance stats', e instanceof Error ? e : String(e));
      return { success: false, data: null, error: { code: 'FETCH_ERROR', message: errorMsg } };
    }
  },

  /**
   * ดึง Trade History ที่ grouped by position (round-turn)
   */
  getGroupedTrades: async (params?: TradeRequest): Promise<ServiceResponse<GroupedTradesResponse>> => {
    try {
      logger.info('Fetching grouped trades', { params });
      return await apiClient<ServiceResponse<GroupedTradesResponse>>(
        ENDPOINTS.TRADES_GROUPED,
        undefined,
        params as any,
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
