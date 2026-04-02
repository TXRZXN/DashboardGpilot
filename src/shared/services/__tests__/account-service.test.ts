import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountService } from '../account-service';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoint';
import type { AccountInfo } from '@/shared/types/api';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAccountInfo_SuccessfulFetch_ReturnsValidData', async () => {
    const mockAccount: AccountInfo = {
      login: 12345,
      name: 'Test User',
      server: 'Test Server',
      balance: 10000,
      equity: 10000,
      margin: 0,
      marginFree: 10000,
      marginLevel: 100,
      leverage: 100,
      currency: 'USD',
      profit: 0,
    };
    
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockAccount, error: null });

    const result = await AccountService.getAccountInfo();

    expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.ACCOUNT);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockAccount);
  });

  it('getAccountInfo_OnNetworkError_ReturnsUnsuccessfulResponse', async () => {
    vi.mocked(apiClient).mockRejectedValue(new Error('Network Error'));

    const result = await AccountService.getAccountInfo();

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: 'FETCH_ERROR',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี',
    });
  });
});
