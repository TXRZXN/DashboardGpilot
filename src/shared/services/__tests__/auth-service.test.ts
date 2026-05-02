import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../auth-service';
import { apiClient } from '@/shared/api/client';
import { CryptoUtils } from '@/shared/utils/crypto';
import { SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';

// Mock values
const MOCK_ENCRYPTION_KEY = '00'.repeat(32);
const MOCK_ENCRYPTED_PASS = 'encrypted-pass-base64';

// Mock dependencies
vi.mock('@/shared/api/client', () => ({
  apiClient: vi.fn(),
}));

vi.mock('@/shared/utils/crypto', () => ({
  CryptoUtils: {
    encrypt: vi.fn(),
  },
}));

describe('AuthService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_MT5_ENCRYPTION_KEY: MOCK_ENCRYPTION_KEY };
    vi.mocked(CryptoUtils.encrypt).mockResolvedValue(MOCK_ENCRYPTED_PASS);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('register', () => {
    it('register_WithValidData_EncryptsPasswordAndCallsApi', async () => {
      const mockResult = { success: true, data: { user_id: 123 }, error: null };
      vi.mocked(apiClient).mockResolvedValue(mockResult);

      const data = {
        email: 'test@example.com',
        mt5Id: 12345,
        mt5_password_plain: 'mt5-pass-123',
      };

      const result = await AuthService.register(data);

      expect(CryptoUtils.encrypt).toHaveBeenCalledWith('mt5-pass-123', MOCK_ENCRYPTION_KEY);
      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.AUTH_REGISTER,
        expect.objectContaining({ 
          method: 'POST',
          body: expect.stringContaining('test@example.com')
        }),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult.data);
    });

    it('register_MissingKey_ReturnsConfigError', async () => {
      delete process.env.NEXT_PUBLIC_MT5_ENCRYPTION_KEY;
      const data = {
        email: 'test@example.com',
        mt5Id: 12345,
        mt5_password_plain: 'mt5-pass-123',
      };

      const result = await AuthService.register(data);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONFIG_ERROR');
    });
  });

  describe('login', () => {
    it('login_WithValidCredentials_ReturnsTokens', async () => {
      const mockLoginResponse = { 
        success: true, 
        data: { 
          accessToken: 'abc', 
          tokenType: 'bearer', 
          user: { id: '1', email: 'test@example.com', role: 'admin' } 
        }, 
        error: null 
      };
      vi.mocked(apiClient).mockResolvedValue(mockLoginResponse);

      const result = await AuthService.login({ email: 'test@example.com', password: 'pass' });

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.AUTH_LOGIN,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: MOCK_ENCRYPTED_PASS })
        }),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLoginResponse.data);
    });
  });

  describe('updateMT5Password', () => {
    it('updateMT5Password_Successful_CallsApiWithEncryptedPassword', async () => {
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: { message: 'ok' }, error: null });

      const result = await AuthService.updateMT5Password('new-pass');

      expect(CryptoUtils.encrypt).toHaveBeenCalledWith('new-pass', MOCK_ENCRYPTION_KEY);
      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.AUTH_UPDATE_MT5_PASSWORD,
        expect.anything(),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });
  });

  describe('updatePassword', () => {
    it('updatePassword_Successful_CallsApiWithEncryptedPassword', async () => {
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: { message: 'ok' }, error: null });

      const result = await AuthService.updatePassword('new-web-pass');

      expect(CryptoUtils.encrypt).toHaveBeenCalledWith('new-web-pass', MOCK_ENCRYPTION_KEY);
      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.AUTH_UPDATE_PASSWORD,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ new_password: MOCK_ENCRYPTED_PASS })
        }),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });
  });

  describe('refreshToken', () => {
    const mockLocalStorage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
      };
    })();

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      mockLocalStorage.clear();
      // Mock cookie
      document.cookie = "";
    });

    it('refreshToken_Successful_UpdatesLocalStorageAndCookies', async () => {
      mockLocalStorage.setItem('refresh_token', 'old-refresh');
      const mockRefreshResponse = {
        success: true,
        data: { accessToken: 'new-access', refreshToken: 'new-refresh', tokenType: 'bearer' },
        error: null
      };
      vi.mocked(apiClient).mockResolvedValue(mockRefreshResponse);

      const result = await AuthService.refreshToken();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.AUTH_REFRESH,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'old-refresh' })
        }),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
      expect(mockLocalStorage.getItem('auth_token')).toBe('new-access');
      expect(mockLocalStorage.getItem('refresh_token')).toBe('new-refresh');
      expect(document.cookie).toContain('auth_token=new-access');
    });

    it('refreshToken_Failed_ClearsTokensAndLogout', async () => {
      mockLocalStorage.setItem('refresh_token', 'bad-refresh');
      vi.mocked(apiClient).mockResolvedValue({ success: false, data: null, error: { code: 'EXPIRED', message: 'fail' } });

      const result = await AuthService.refreshToken();

      expect(result.success).toBe(false);
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
      expect(mockLocalStorage.getItem('refresh_token')).toBeNull();
    });
  });
});
