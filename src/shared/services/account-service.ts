import { apiClient } from '@/shared/api/client';
import { SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { 
  ServiceResponse, 
  AccountProfile, 
  AccountFinance 
} from '@/shared/types/api';

const logger = createLogger('AccountService');

/**
 * Service สำหรับจัดการข้อมูลบัญชีและสถิติจาก Backend-Sub
 */
export const AccountService = {
  /**
   * ดึงข้อมูลสรุปรายพอร์ตทั้งหมดที่ผู้ใช้ถือครอง
   */
  getProfile: async (): Promise<ServiceResponse<AccountProfile[]>> => {
    try {
      logger.info('Fetching account profiles from Backend-Sub');
      
      const response = await apiClient<ServiceResponse<AccountProfile[]>>(
        SUB_ENDPOINTS.ACCOUNT_PROFILE,
        undefined,
        undefined,
        API_GATEWAY_SUB
      );

      return response;
    } catch (e) {
      logger.error('Failed to fetch account profile', e instanceof Error ? e : String(e));
      return {
        success: false,
        data: null,
        error: { code: 'FETCH_ERROR', message: 'ไม่สามารถดึงข้อมูลโปรไฟล์บัญชีได้' }
      };
    }
  },

  /**
   * ดึงข้อมูลการเงินและสถิติภาพรวม (Finance, Equity Curve)
   */
  getFinance: async (): Promise<ServiceResponse<AccountFinance>> => {
    try {
      logger.info('Fetching account finance from Backend-Sub');
      
      const response = await apiClient<ServiceResponse<AccountFinance>>(
        SUB_ENDPOINTS.ACCOUNT_FINANCE,
        undefined,
        undefined,
        API_GATEWAY_SUB
      );

      return response;
    } catch (e) {
      logger.error('Failed to fetch account finance', e instanceof Error ? e : String(e));
      return {
        success: false,
        data: null,
        error: { code: 'FETCH_ERROR', message: 'ไม่สามารถดึงข้อมูลสถิติการเงินได้' }
      };
    }
  },

  /**
   * สั่งซิงค์ข้อมูลการเทรดด้วยตัวเอง (Manual Sync)
   */
  syncAccount: async (): Promise<ServiceResponse<{ message: string }>> => {
    try {
      logger.info('Requesting manual account sync');
      
      const response = await apiClient<ServiceResponse<{ message: string }>>(
        SUB_ENDPOINTS.ACCOUNT_SYNC,
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
  }
};
