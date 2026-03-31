import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import type { AccountInfo, ServiceResponse } from '@/shared/types/api';

const logger = createLogger('AccountService');

/**
 * Service สำหรับจัดการข้อมูลบัญชี MT5
 */
export const AccountService = {
  /**
   * ดึงข้อมูลบัญชีล่าสุด
   */
  getAccountInfo: async (): Promise<ServiceResponse<AccountInfo>> => {
    try {
      logger.info('Fetching account info');
      
      // apiClient คืนค่าส่วนที่ Backend ส่งมา (ซึ่งควรเป็น ServiceResponse ตามมาตรฐาน API Contract)
      const response = await apiClient<ServiceResponse<AccountInfo>>(ENDPOINTS.ACCOUNT);
      
      
      return response;
    } catch (e: unknown) {
      const errorMsg = e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี';
      logger.error('Failed to fetch account info', e instanceof Error ? e : String(e));
      
      return {
        success: false,
        data: null,
        error: errorMsg,
      };
    }
  },
};
