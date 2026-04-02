import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../auth-service';
import { apiClient } from '@/shared/api/client';
import { CryptoUtils } from '@/shared/utils/crypto';
import { SUB_ENDPOINTS } from '@/shared/api/endpoint';

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
      const mockResult = { user_id: 123 };
      vi.mocked(apiClient).mockResolvedValue(mockResult);

      const data = {
        email: 'test@example.com',
        password: 'web-password',
        invited_by_ref_id: 'REF123',
        mt5_id: 12345,
        mt5_password_plain: 'mt5-pass-123',
      };

      const result = await AuthService.register(data);

      expect(CryptoUtils.encrypt).toHaveBeenCalledWith('mt5-pass-123', MOCK_ENCRYPTION_KEY);
      expect(apiClient).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });

    it('register_MissingKey_ReturnsConfigError', async () => {
      delete process.env.NEXT_PUBLIC_MT5_ENCRYPTION_KEY;
      const data = {
        email: 'test@example.com',
        password: 'web-password',
        invited_by_ref_id: 'REF123',
        mt5_id: 12345,
        mt5_password_plain: 'mt5-pass-123',
      };

      const result = await AuthService.register(data);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONFIG_ERROR');
    });
  });

  describe('login', () => {
    it('login_WithValidCredentials_ReturnsTokens', async () => {
      const mockLoginResponse = { access_token: 'abc', token_type: 'bearer' };
      vi.mocked(apiClient).mockResolvedValue(mockLoginResponse);

      const result = await AuthService.login({ username: 'user', password: 'pass' });

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.AUTH_LOGIN,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLoginResponse);
    });
  });

  describe('updateMT5Password', () => {
    it('updateMT5Password_Successful_CallsApiWithEncryptedPassword', async () => {
      vi.mocked(apiClient).mockResolvedValue({});

      const result = await AuthService.updateMT5Password('new-pass');

      expect(CryptoUtils.encrypt).toHaveBeenCalledWith('new-pass', MOCK_ENCRYPTION_KEY);
      expect(result.success).toBe(true);
    });
  });
});
