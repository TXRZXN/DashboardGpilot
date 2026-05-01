import { apiClient } from '@/shared/api/client';
import { ROR_ENDPOINTS, SERVICE_BASE_ROR } from '@/shared/api/endpoint';
import { createLogger } from '@/shared/utils/logger';
import { ApiError } from '@/shared/api/api-error';
import type { ServiceResponse } from '@/shared/types/api';
import type { LoginResponse } from '@/shared/types/auth';

const logger = createLogger('RorService');

export interface WizardResponse {
    code: number;
    data: any;
    done: boolean;
    uuid: string;
    workflow: string;
}

export interface Ror2faRequest {
    code: string;
    uuid: string;
}

export interface RorAuthResponse {
    code: number;
    data: {
        accessToken: {
            token: string;
            createdAt: string;
            expiresAt: string;
        } | null;
        refreshToken: {
            token: string;
            createdAt: string;
            expiresAt: string;
        } | null;
        tfaProviders: any[];
    } | null;
    done: boolean;
    uuid: string;
    workflow: string;
}

/**
 * RorService สำหรับจัดการข้อมูล Record of Ragnarok โดยเฉพาะ
 * ใช้ API_URL_STKPRO (Strikepro/B2Broker)
 */
export const RorService = {
  /**
   * ดึง Wizard UUID สำหรับใช้ในการ Login
   */
  getWizard: async (): Promise<ServiceResponse<WizardResponse>> => {
    try {
      logger.info('Fetching ROR Wizard UUID');
      const result = await apiClient<WizardResponse>(ROR_ENDPOINTS.WIZARD, {
        method: 'GET',
      }, undefined, SERVICE_BASE_ROR);

      return { success: true, data: result, error: null };
    } catch (error) {
      logger.error('Failed to fetch Wizard UUID', error instanceof Error ? error : String(error));
      return {
        success: false,
        data: null,
        error: { code: 'WIZARD_ERROR', message: 'ไม่สามารถดึงรหัสเซสชันได้' }
      };
    }
  },

  /**
   * เข้าสู่ระบบสำหรับหน้า ROR (B2Broker Login Flow)
   */
  login: async (data: { email: string; password: string; uuid: string; device_fingerprint: string }): Promise<ServiceResponse<RorAuthResponse>> => {
    try {
      logger.info('Attempting ROR B2Broker login', { email: data.email });

      const result = await apiClient<RorAuthResponse>(ROR_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          uuid: data.uuid,
          device_fingerprint: data.device_fingerprint
        }),
      }, undefined, SERVICE_BASE_ROR);

      logger.info('ROR login successful', { email: data.email, workflow: result.workflow });
      return {
        success: true,
        data: result,
        error: null
      };

    } catch (error) {
      let errorMsg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      
      if (error instanceof ApiError) {
        const details = error.details;
        // พยายามดึง message จาก error.details.details[0].issue หรือ error.message
        if (details?.error?.details?.[0]?.issue) {
          errorMsg = details.error.details[0].issue;
        } else if (details?.error?.message) {
          errorMsg = details.error.message;
        } else {
          errorMsg = error.message;
        }
      }

      logger.error('ROR login failed', error instanceof Error ? error : String(error));

      return {
        success: false,
        data: null,
        error: { code: 'ROR_LOGIN_ERROR', message: errorMsg }
      };
    }
  },

  /**
   * ยืนยันรหัส 2FA Google สำหรับ ROR
   */
  verify2faGoogle: async (data: { code: string; uuid: string }): Promise<ServiceResponse<RorAuthResponse>> => {
    try {
      logger.info('Verifying ROR 2FA Google code', { uuid: data.uuid });

      const result = await apiClient<RorAuthResponse>(ROR_ENDPOINTS.AUTH_2FA_GOOGLE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code: data.code,
          uuid: data.uuid
        }),
      }, undefined, SERVICE_BASE_ROR);

      return { success: true, data: result, error: null };
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'รหัส 2FA Google ไม่ถูกต้อง';
      logger.error('ROR 2FA Google verification failed', error instanceof Error ? error : String(error));

      return {
        success: false,
        data: null,
        error: { code: 'ROR_2FA_ERROR', message: errorMsg }
      };
    }
  },

  /**
   * ยืนยันรหัส 2FA SMS สำหรับ ROR
   */
  verify2faSms: async (data: { code: string; uuid: string }): Promise<ServiceResponse<RorAuthResponse>> => {
    try {
      logger.info('Verifying ROR 2FA SMS code', { uuid: data.uuid });

      const result = await apiClient<RorAuthResponse>(ROR_ENDPOINTS.AUTH_2FA_SMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code: data.code,
          uuid: data.uuid
        }),
      }, undefined, SERVICE_BASE_ROR);

      return { success: true, data: result, error: null };
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'รหัส 2FA SMS ไม่ถูกต้อง';
      logger.error('ROR 2FA SMS verification failed', error instanceof Error ? error : String(error));

      return {
        success: false,
        data: null,
        error: { code: 'ROR_2FA_SMS_ERROR', message: errorMsg }
      };
    }
  },


  /**
   * ดึงรายการบัญชีเทรดจาก Strikepro (External API)
   * GET https://api.strikeprofx.com/api/v2/my/accounts?limit=1000
   */
  getAccounts: async (): Promise<ServiceResponse<RorAccountsResponse>> => {
    try {
      logger.info('Fetching ROR accounts from Strikepro');
      
      const token = localStorage.getItem('ror_auth_token');
      
      const result = await apiClient<RorAccountsResponse>(ROR_ENDPOINTS.ACCOUNTS, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept-language': 'th',
        }
      }, { limit: 1000 }, SERVICE_BASE_ROR);

      return { success: true, data: result, error: null };
    } catch (error) {
      logger.error('Failed to fetch ROR accounts', error instanceof Error ? error : String(error));
      return {
        success: false,
        data: null,
        error: { code: 'ROR_ACCOUNTS_ERROR', message: 'ไม่สามารถดึงข้อมูลบัญชีได้' }
      };
    }
  }
};

export interface RorAccountsResponse {
    total: number;
    data: RorAccount[];
}

export interface RorAccount {
    accountId: number;
    accountNumber: string;
    archive: boolean;
    caption: string;
    currency: {
        alphabeticCode: string;
        name: string;
        numericCode: number;
        minorUnit: number;
        hasDestinationTagOrMemo: boolean;
    };
    favourite: boolean;
    group: {
        id: number;
        name: string;
        priority: number;
        type: string;
    };
    platform: {
        id: number;
        name: string;
        caption: string;
        type: string;
        isDemo: boolean;
        terminalUrl: string;
    };
    priority: number;
    statement: {
        availableBalance: string;
        currentBalance: string;
        credit: string;
        equity: string;
        freeMargin: string;
        hold: string;
        margin: string;
        marginLevel: string;
        pnl: string;
        updateTime: string;
    };
    type: string;
    createTime: string;
    permissions: string[];
    productId: number;
    rights: number;
    leverage: number;
    productCurrency: any; // Simplified for now
}
