import { apiClient } from '@/shared/api/client';
import { SUB_ENDPOINTS } from '@/shared/api/endpoint';
import { CryptoUtils } from '@/shared/utils/crypto';
import { createLogger } from '@/shared/utils/logger';
import { ApiError } from '@/shared/api/api-error';
import type { ServiceResponse } from '@/shared/types/api';
import type { 
  RegistrationRequest, 
  RegistrationResponse, 
  LoginRequest, 
  LoginResponse 
} from '@/shared/types/auth';

const logger = createLogger('AuthService');

/**
 * AuthService สำหรับจัดการสมาชิกผ่าน Backend-Sub
 * ปฏิบัติตาม Layer Separation และ Service Response Standard
 */
export const AuthService = {
  /**
   * ลงทะเบียนผู้ใช้ใหม่ (พร้อมเข้ารหัสรหัสผ่าน MT5)
   */
  register: async (
    data: Omit<RegistrationRequest, 'mt5_password_encrypted'> & { mt5_password_plain: string }
  ): Promise<ServiceResponse<RegistrationResponse>> => {
    try {
      logger.info('Registering new user', { email: data.email });

      // 1. ดึง Encryption Key จาก Environment
      const encryptionKey = process.env.NEXT_PUBLIC_MT5_ENCRYPTION_KEY || '';
      if (!encryptionKey) {
        logger.error('Encryption key not configured');
        return { success: false, data: null, error: 'ความล้มเหลวในการกำหนดค่าระบบเข้ารหัส' };
      }

      // 2. เข้ารหัสรหัสผ่าน MT5 ด้วย AES-256-GCM
      const encryptedPassword = await CryptoUtils.encrypt(data.mt5_password_plain, encryptionKey);

      // 3. เตรียมข้อมูลส่งให้ Backend-Sub
      const requestData: RegistrationRequest = {
        email: data.email,
        password: data.password,
        invited_by_ref_id: data.invited_by_ref_id,
        mt5_id: data.mt5_id,
        mt5_password_encrypted: encryptedPassword
      };

      // 4. ส่งข้อมูลผ่าน Gateway Proxy
      const result = await apiClient<RegistrationResponse>(SUB_ENDPOINTS.AUTH_REGISTER, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      logger.info('User registered successfully', { email: data.email });
      return {
        success: true,
        data: result,
        error: null
      };

    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      logger.error('Registration failed', error instanceof Error ? error : String(error));
      
      return {
        success: false,
        data: null,
        error: errorMsg
      };
    }
  },

  /**
   * เข้าสู่ระบบ (คืนค่า Token และข้อมูลผู้ใช้)
   */
  login: async (data: LoginRequest): Promise<ServiceResponse<LoginResponse>> => {
    try {
      logger.info('Attempting login', { username: data.username });

      // Backend-Sub ใช้ OAuth2 Password Request Form (Form Data)
      const formData = new URLSearchParams();
      formData.append('username', data.username);
      formData.set('password', data.password);

      const result = await apiClient<LoginResponse>(SUB_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      logger.info('Login successful', { username: data.username });
      return {
        success: true,
        data: result,
        error: null
      };

    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      logger.error('Login failed', error instanceof Error ? error : String(error));

      return {
        success: false,
        data: null,
        error: errorMsg
      };
    }
  }
};
