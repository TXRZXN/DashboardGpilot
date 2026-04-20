import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS, SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { ServiceResponse, TradeRequest, Deal, ReferralSyncSummary, ReferralSyncRequest } from '@/shared/types/api';

const logger = createLogger('TradeHistoryService');

/**
 * Service สำหรับจัดการประวัติการเทรด (Deals)
 * ครอบคลุมทั้ง Backend-Main (Real-time) และ Backend-Sub (Synced Referral)
 */
export const TradeHistoryService = {
  /**
   * ดึงประวัติการเทรดแบบเรียลไทม์จาก Backend-Main
   */
  getHistory: async (params?: TradeRequest, serviceBase?: string): Promise<ServiceResponse<Deal[]>> => {
    try {
      logger.info('Fetching trade history', { params, serviceBase });
      
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
        finalParams,
        serviceBase
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
  getReferralHistory: async (params?: ReferralSyncRequest): Promise<ServiceResponse<ReferralSyncSummary>> => {
    try {
      logger.info('Fetching referral synced trades from Backend-Sub', { params });
      
      const response = await apiClient<ServiceResponse<ReferralSyncSummary>>(
        SUB_ENDPOINTS.TRADES,
        undefined,
        params as any,
        API_GATEWAY_SUB
      );

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
  syncReferralTrades: async (): Promise<ServiceResponse<ReferralSyncSummary>> => {
    try {
      logger.info('Manually triggering referral sync via Backend-Sub');
      
      const response = await apiClient<ServiceResponse<ReferralSyncSummary>>(
        SUB_ENDPOINTS.TRADES_SYNC_REFERRALS,
        { method: 'POST' },
        undefined,
        API_GATEWAY_SUB
      );

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

/**
 * Mock Data สำหรับ Referral Sync (ตามโครงสร้างใหม่)
 */
const MOCK_REFERRAL_DATA: ReferralSyncSummary = {
  totalThisWeek: 450.75,
  lastSync: new Date().toISOString(),
  trades: [
    {
      email: 'user.one@example.com',
      accountId: '2121978453',
      amount: 150.25,
      currency: 'USD',
      date: '2026-04-01T10:30:00Z',
      status: 'success'
    },
    {
      email: 'trader.pro@gmail.com',
      accountId: '2121989012',
      amount: 220.50,
      currency: 'USD',
      date: '2026-04-02T14:45:00Z',
      status: 'success'
    },
    {
      email: 'newbie.fx@hotmail.com',
      accountId: '2121995544',
      amount: 80.00,
      currency: 'USD',
      date: '2026-04-03T09:15:00Z',
      status: 'success'
    },
    {
      email: 'error.user@provider.com',
      accountId: '2121950000',
      amount: 0,
      currency: 'USD',
      date: '2026-04-04T08:00:00Z',
      status: 'failed',
      error: 'Invalid MT5 Login / Password'
    }
  ]
};
