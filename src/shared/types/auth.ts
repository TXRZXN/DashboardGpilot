/**
 * ข้อมูลสำหรับการลงทะเบียนผู้ใช้ใหม่
 */
export interface RegistrationRequest {
  email: string;
  mt5Id: number;
  mt5PasswordEncrypted: string;
}

/**
 * ผลลัพธ์จากการลงทะเบียน
 */
export interface RegistrationResponse {
  id: string;
  email: string;
  defaultPassword?: string;
  message: string;
}

/**
 * ข้อมูลสำหรับการเข้าสู่ระบบ
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * ผลลัพธ์จากการเข้าสู่ระบบ
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
    role: string;
    requirePasswordChange?: boolean;
    menu: {
      dashboard: string[];
      setting: {
        masterAdmin: boolean;
        Admin: boolean;
      } | null;
    };
  };
}

/**
 * สถานะของเซสชันผู้ใช้
 */
export interface UserSession {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: string;
    requirePasswordChange?: boolean;
    menu: {
      dashboard: string[];
      setting: {
        masterAdmin: boolean;
        Admin: boolean;
      } | null;
    };
  };
  isAuthenticated: boolean;
}
