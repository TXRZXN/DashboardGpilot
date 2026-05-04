import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountService } from '../account-service';
import { apiClient } from '@/shared/api/client';
import { SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('getProfile_Successful_CallsApiClientWithCorrectEndpoint', async () => {
      const mockProfiles = [
        { mt5Id: 123, name: 'Test', server: 'Server', currency: 'USD', balance: 1000, leverage: 100, updatedAt: '2024-01-01' }
      ];
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockProfiles, error: null });

      const result = await AccountService.getProfile();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.ACCOUNT_PROFILE,
        undefined,
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfiles);
    });
  });

  describe('getFinance', () => {
    it('getFinance_Successful_CallsApiClientWithCorrectEndpoint', async () => {
      const mockFinance = {
        user_id: 'user-1',
        grossTradeProfit: 100,
        totalDeposits: 500,
        totalWithdrawals: 50,
        totalProfitSharing: 10,
        netProfit: 40,
        totalTrades: 5,
        equityCurve: [],
        updated_at: '2024-01-01'
      };
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockFinance, error: null });

      const result = await AccountService.getFinance();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.ACCOUNT_FINANCE,
        undefined,
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFinance);
    });
  });

  describe('syncAccount', () => {
    it('syncAccount_Successful_CallsApiClientWithPost', async () => {
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: { message: 'Sync started' }, error: null });

      const result = await AccountService.syncAccount();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.ACCOUNT_SYNC,
        expect.objectContaining({ method: 'POST' }),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });
  });
});
