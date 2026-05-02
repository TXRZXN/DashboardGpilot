import { apiClient } from '@/shared/api/client';
import { SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';
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
   * 
   * @param data - ข้อมูลการลงทะเบียน (email, mt5Id, mt5_password_plain)
   * @returns ServiceResponse พร้อมข้อมูล RegistrationResponse
   * @throws CONFIG_ERROR หากไม่ได้ตั้งค่า Encryption Key
   */
  register: async (
    data: Omit<RegistrationRequest, 'mt5PasswordEncrypted'> & { mt5_password_plain: string }
  ): Promise<ServiceResponse<RegistrationResponse>> => {
    try {
      logger.info('Registering new user', { email: data.email });

      // 1. ดึง Encryption Key จาก Environment
      const encryptionKey = process.env.NEXT_PUBLIC_MT5_ENCRYPTION_KEY || '';
      if (!encryptionKey) {
        logger.error('Encryption key not configured');
        return { 
          success: false, 
          data: null, 
          error: { code: 'CONFIG_ERROR', message: 'ความล้มเหลวในการกำหนดค่าระบบเข้ารหัส' } 
        };
      }

      // 2. เข้ารหัสรหัสผ่าน MT5 ด้วย AES-256-GCM
      const encryptedPassword = await CryptoUtils.encrypt(data.mt5_password_plain, encryptionKey);

      // 3. เตรียมข้อมูลส่งให้ Backend-Sub
      const requestData: RegistrationRequest = {
        email: data.email,
        mt5Id: data.mt5Id,
        mt5PasswordEncrypted: encryptedPassword
      };

      // 4. ส่งข้อมูลผ่าน Gateway Proxy
      const response = await apiClient<ServiceResponse<RegistrationResponse>>(SUB_ENDPOINTS.AUTH_REGISTER, {
        method: 'POST',
        body: JSON.stringify(requestData),
      }, undefined, API_GATEWAY_SUB);
      
      // จัดการกับ ServiceResponse (ห่อตามมาตรฐาน)
      if (!response.success || !response.data) {
        return response;
      }

      logger.info('User registered successfully', { email: data.email });
      return response;

    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      logger.error('Registration failed', error instanceof Error ? error : String(error));
      
      return {
        success: false,
        data: null,
        error: { code: 'REGISTRATION_ERROR', message: errorMsg }
      };
    }
  },

  /**
   * เข้าสู่ระบบ (คืนค่า Token และข้อมูลผู้ใช้)
   * รองรับการเข้ารหัสรหัสผ่านก่อนส่งไปยัง Backend เพื่อความปลอดภัย
   * 
   * @param data - ข้อมูลการเข้าสู่ระบบ (email, password)
   * @returns ServiceResponse พร้อม Access Token และข้อมูลผู้ใช้
   */
  login: async (data: LoginRequest): Promise<ServiceResponse<LoginResponse>> => {
    try {
      logger.info('Attempting login', { email: data.email });

      // Phase 4: Encrypt password before sending to backend
      let passwordToSend = data.password;
      const encryptionKey = process.env.NEXT_PUBLIC_MT5_ENCRYPTION_KEY || '';
      
      if (encryptionKey) {
        try {
          passwordToSend = await CryptoUtils.encrypt(data.password, encryptionKey);
        } catch (err) {
          logger.warn('Frontend encryption failed, falling back to plain text', { error: err });
        }
      }

      // Backend-Sub ใช้ JSON สำหรับ login
      const requestBody: LoginRequest = {
        email: data.email,
        password: passwordToSend
      };

      const response = await apiClient<ServiceResponse<LoginResponse>>(SUB_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, undefined, API_GATEWAY_SUB);

      if (!response.success || !response.data) {
        return response;
      }

      const result = response.data;
      logger.info('Login successful', { email: data.email });
      
      // เก็บ Token ใน Cookies/LocalStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refresh_token', result.refreshToken);
        }
        document.cookie = `auth_token=${result.accessToken}; path=/; max-age=86400; SameSite=Strict`;
      }

      return response;

    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      logger.error('Login failed', error instanceof Error ? error : String(error));

      return {
        success: false,
        data: null,
        error: { code: 'LOGIN_ERROR', message: errorMsg }
      };
    }
  },

  /**
   * เปลี่ยนรหัสผ่านสำหรับเข้าเว็บไซต์ (Web Password)
   * ใช้ในกรณีบังคับเปลี่ยนรหัสผ่านครั้งแรก หรือผู้ใช้เปลี่ยนเอง
   * 
   * @param newPassword - รหัสผ่านใหม่ที่ต้องการตั้ง
   * @returns ServiceResponse แจ้งผลการดำเนินการ
   */
  updatePassword: async (newPassword: string): Promise<ServiceResponse<void>> => {
    try {
      logger.info('Updating web password');
      
      // Phase 4: Encrypt password before sending
      let passwordToSend = newPassword;
      const encryptionKey = process.env.NEXT_PUBLIC_MT5_ENCRYPTION_KEY || '';
      
      if (encryptionKey) {
        try {
          passwordToSend = await CryptoUtils.encrypt(newPassword, encryptionKey);
        } catch (err) {
          logger.warn('Failed to encrypt web password, sending plain text', { error: err });
        }
      }

      const response = await apiClient<ServiceResponse<{ message: string }>>(SUB_ENDPOINTS.AUTH_UPDATE_PASSWORD, {
        method: 'PATCH',
        body: JSON.stringify({ new_password: passwordToSend }),
      }, undefined, API_GATEWAY_SUB);

      if (!response.success) return { success: false, data: undefined, error: response.error };
      
      return { success: true, data: undefined, error: null };
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
      logger.error('Update password failed', error instanceof Error ? error : String(error));
      return { 
        success: false, 
        data: null, 
        error: { code: 'UPDATE_PASSWORD_ERROR', message: errorMsg } 
      };
    }
  },

  /**
   * เปลี่ยนรหัสผ่าน MT5 (พร้อมเข้ารหัสก่อนส่ง)
   * 
   * @param newPlainPassword - รหัสผ่าน MT5 แบบ plain text
   * @returns ServiceResponse แจ้งผลการดำเนินการ
   */
  updateMT5Password: async (newPlainPassword: string): Promise<ServiceResponse<void>> => {
    try {
      logger.info('Updating MT5 password');
      const encryptionKey = process.env.NEXT_PUBLIC_MT5_ENCRYPTION_KEY || '';
      if (!encryptionKey) {
          return { 
            success: false, 
            data: null, 
            error: { code: 'CONFIG_ERROR', message: 'ระบบเข้ารหัสไม่ได้กำหนดค่า' } 
          };
      }

      const encryptedPassword = await CryptoUtils.encrypt(newPlainPassword, encryptionKey);
      const response = await apiClient<ServiceResponse<{ message: string }>>(SUB_ENDPOINTS.AUTH_UPDATE_MT5_PASSWORD, {
        method: 'PATCH',
        body: JSON.stringify({ encrypted_password: encryptedPassword }),
      }, undefined, API_GATEWAY_SUB);

      if (!response.success) return { success: false, data: undefined, error: response.error };

      return { success: true, data: undefined, error: null };
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'ไม่สามารถเปลี่ยนรหัสผ่าน MT5 ได้';
      logger.error('Update MT5 password failed', error instanceof Error ? error : String(error));
      return { 
        success: false, 
        data: null, 
        error: { code: 'UPDATE_MT5_PASSWORD_ERROR', message: errorMsg } 
      };
    }
  },

  /**
   * ขอ Access Token ใหม่โดยใช้ Refresh Token
   * ปฏิบัติตามมาตรฐาน Reactive Token Refresh
   * 
   * @returns ServiceResponse พร้อม Access Token ตัวใหม่
   */
  refreshToken: async (): Promise<ServiceResponse<LoginResponse>> => {
    try {
      if (typeof window === 'undefined') {
        return { success: false, data: null, error: { code: 'CLIENT_ONLY', message: 'Refresh token must be run on client side' } };
      }

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        logger.warn('No refresh token found');
        return { success: false, data: null, error: { code: 'MISSING_REFRESH_TOKEN', message: 'ไม่พบ Refresh Token' } };
      }

      logger.info('Refreshing access token');
      
      // เรียก API โดยตรงเพื่อเลี่ยง Infinite Loop ใน apiClient
      const response = await apiClient<ServiceResponse<LoginResponse>>(SUB_ENDPOINTS.AUTH_REFRESH, {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refreshToken }),
      }, undefined, API_GATEWAY_SUB);

      if (!response.success || !response.data) {
        // ถ้า Refresh ไม่ผ่าน ให้ล้าง Token และ Logout
        logger.error('Token refresh failed', response.error?.message || 'Session expired', { error: response.error });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return response;
      }

      const result = response.data;
      localStorage.setItem('auth_token', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refresh_token', result.refreshToken);
      }
      document.cookie = `auth_token=${result.accessToken}; path=/; max-age=86400; SameSite=Strict`;

      logger.info('Token refreshed successfully');
      return response;

    } catch (error) {
      logger.error('Token refresh exception', error instanceof Error ? error : String(error));
      return {
        success: false,
        data: null,
        error: { code: 'REFRESH_TOKEN_EXCEPTION', message: 'เกิดข้อผิดพลาดในการต่ออายุเซสชัน' }
      };
    }
  }
};
