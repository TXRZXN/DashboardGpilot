import { apiClient } from '@/shared/api/client';
import { SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { 
  ServiceResponse, 
  SyncedTrade, 
  ReferralSyncSummary,
  TradeRequest 
} from '@/shared/types/api';

const logger = createLogger('TradeHistoryService');

/**
 * Service สำหรับจัดการประวัติการเทรด (Deals) จาก Backend-Sub
 * ครอบคลุมการดึงข้อมูลที่ Sync แล้ว และการสั่ง Sync Manual
 */
export const TradeHistoryService = {
  /**
   * ดึงประวัติการเทรดของตัวเองที่ Sync แล้วจาก Backend-Sub
   */
  getMySyncedHistory: async (params?: TradeRequest): Promise<ServiceResponse<SyncedTrade[]>> => {
    try {
      logger.info('Fetching my synced trades from Backend-Sub', { params });
      
      const response = await apiClient<ServiceResponse<SyncedTrade[]>>(
        SUB_ENDPOINTS.TRADES,
        undefined,
        params as any,
        API_GATEWAY_SUB
      );

      return response;
    } catch (e) {
      logger.error('Failed to fetch my synced history', e instanceof Error ? e : String(e));
      return {
        success: false,
        data: null,
        error: { code: 'FETCH_ERROR', message: 'ไม่สามารถดึงข้อมูลประวัติการเทรดได้' }
      };
    }
  },

  /**
   * ดึงประวัติการเทรดของเพื่อน (Referral) ที่ Sync แล้วจาก Backend-Sub
   */
  getReferralHistory: async (params?: TradeRequest): Promise<ServiceResponse<SyncedTrade[]>> => {
    try {
      logger.info('Fetching referral synced trades from Backend-Sub', { params });
      
      const response = await apiClient<ServiceResponse<SyncedTrade[]>>(
        SUB_ENDPOINTS.TRADES_REFERRALS,
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
   * สั่ง Sync ข้อมูลการเทรดของตัวเอง (Manual)
   */
  syncMyTrades: async (): Promise<ServiceResponse<number>> => {
    try {
      logger.info('Requesting manual sync for own trades');
      const response = await apiClient<ServiceResponse<number>>(
        SUB_ENDPOINTS.TRADES_SYNC_ME,
        { method: 'POST' },
        undefined,
        API_GATEWAY_SUB
      );
      return response;
    } catch (e) {
      logger.error('Manual sync failed', e instanceof Error ? e : String(e));
      return {
        success: false,
        data: null,
        error: { code: 'SYNC_ERROR', message: 'การซิงค์ข้อมูลล้มเหลว' }
      };
    }
  },

  /**
   * สั่ง Sync ข้อมูลการเทรดของ Referral ทั้งหมด (Manual)
   */
  syncReferralTrades: async (): Promise<ServiceResponse<ReferralSyncSummary>> => {
    try {
      logger.info('Requesting manual sync for all referral trades');
      const response = await apiClient<ServiceResponse<ReferralSyncSummary>>(
        SUB_ENDPOINTS.TRADES_SYNC_REFERRALS,
        { method: 'POST' },
        undefined,
        API_GATEWAY_SUB
      );
      return response;
    } catch (e) {
      logger.error('Referral sync failed', e instanceof Error ? e : String(e));
      return {
        success: false,
        data: null,
        error: { code: 'SYNC_ERROR', message: 'การซิงค์ข้อมูล Referral ล้มเหลว' }
      };
    }
  }
};
