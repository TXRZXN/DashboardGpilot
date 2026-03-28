import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/api-error';
import { ENDPOINTS } from '@/shared/api/endpoint';
import type { AccountInfo, ServiceResponse } from '@/shared/types/api';

/**
 * Service สำหรับจัดการข้อมูลบัญชี MT5
 */
export const AccountService = {
  /**
   * ดึงข้อมูลบัญชีล่าสุด
   */
  getAccountInfo: async (): Promise<ServiceResponse<AccountInfo>> => {
    try {
      // apiClient คืนค่าเป็น ServiceResponse<AccountInfo> โดยตรงจาก backend.json()
      const response = await apiClient<ServiceResponse<AccountInfo>>(ENDPOINTS.ACCOUNT);
      return response;
    } catch (e: unknown) {
      const errorData =
        e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี';
      return {
        success: false,
        data: null,
        error: errorData,
      };
    }
  },
};
