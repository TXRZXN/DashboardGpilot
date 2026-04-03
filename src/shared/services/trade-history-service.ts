import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS, SUB_ENDPOINTS } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { ServiceResponse, TradeRequest, Deal } from '@/shared/types/api';

const logger = createLogger('TradeHistoryService');

/**
 * Service สำหรับจัดการประวัติการเทรด (Deals)
 * ครอบคลุมทั้ง Backend-Main (Real-time) และ Backend-Sub (Synced Referral)
 */
export const TradeHistoryService = {
  /**
   * ดึงประวัติการเทรดแบบเรียลไทม์จาก Backend-Main
   */
  getHistory: async (params?: TradeRequest): Promise<ServiceResponse<Deal[]>> => {
    try {
      logger.info('Fetching trade history', { params });
      
      // Filter only supported params for /trades (Backend-Main)
      const filteredParams: Record<string, any> = {};
      
      if (params) {
        if (params.from_date) filteredParams.from_date = params.from_date;
        if (params.to_date) filteredParams.to_date = params.to_date;
        if (params.symbol) filteredParams.symbol = params.symbol;
        if (params.type) filteredParams.type = params.type;
        if (params.entry) filteredParams.entry = params.entry;
        if (params.comment) filteredParams.comment = params.comment;
      }

      // Only pass if there's filtering criteria
      const finalParams = Object.keys(filteredParams).length > 0 ? filteredParams : undefined;

      const response = await apiClient<ServiceResponse<any>>(
        ENDPOINTS.TRADES, 
        undefined, 
        finalParams
      );
      
      let normalizedDeals: Deal[] = [];
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          normalizedDeals = response.data;
        } else if (typeof response.data === 'object' && Array.isArray(response.data.data)) {
          normalizedDeals = response.data.data;
        }
      }

      return {
        ...response,
        data: normalizedDeals,
      };
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError 
        ? e.message 
        : 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการทำรายการ';
      
      logger.error('Failed to fetch trade history', e instanceof Error ? e : String(e));
      
      return {
        success: false,
        data: [],
        error: { code: 'FETCH_ERROR', message: errorMsg },
      };
    }
  },

  /**
   * ดึงประวัติการเทรดของเพื่อน (Referral) ที่ Sync แล้วจาก Backend-Sub
   */
  getReferralHistory: async (): Promise<ServiceResponse<any[]>> => {
    try {
      logger.info('Fetching referral synced trades');
      const response = await apiClient<ServiceResponse<any>>(SUB_ENDPOINTS.TRADES);
      return response;
    } catch (e) {
      logger.error('Failed to fetch referral history', e instanceof Error ? e : String(e));
      return {
        success: false,
        data: null,
        error: { code: 'FETCH_ERROR', message: 'ไม่สามารถดึงข้อมูล Referral ได้' }
      };
    }
  },

  /**
   * สั่ง Sync ข้อมูลการเทรด Referral ใหม่ (Manual)
   */
  syncReferralTrades: async (): Promise<ServiceResponse<{ successCount: number; failedUsers: any[] }>> => {
    try {
      logger.info('Manually triggering referral sync');
      const response = await apiClient<ServiceResponse<any>>(SUB_ENDPOINTS.TRADES_SYNC_REFERRALS, {
        method: 'POST'
      });
      return response;
    } catch (e) {
      logger.error('Failed to sync referrals', e instanceof Error ? e : String(e));
      return {
        success: false,
        data: null,
        error: { code: 'SYNC_ERROR', message: 'ไม่สามารถเชื่อมต่อระบบซิงค์ได้' }
      };
    }
  }
};
