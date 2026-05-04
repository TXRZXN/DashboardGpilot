import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TradeHistoryService } from '../trade-history-service';
import { apiClient } from '@/shared/api/client';
import { SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('TradeHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('My History', () => {
    it('getMySyncedHistory_CallsApiClientWithCorrectEndpoint', async () => {
      const mockResult = { success: true, data: [], error: null };
      vi.mocked(apiClient).mockResolvedValue(mockResult);

      const result = await TradeHistoryService.getMySyncedHistory();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.TRADES,
        undefined,
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Referral History', () => {
    it('getReferralHistory_CallsApiClientWithSubGateway', async () => {
      const mockResult = { success: true, data: [], error: null };
      vi.mocked(apiClient).mockResolvedValue(mockResult);

      const result = await TradeHistoryService.getReferralHistory();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.TRADES_REFERRALS,
        undefined,
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Sync Operations', () => {
    it('syncMyTrades_CallsApiClientWithPost', async () => {
      const mockResult = { success: true, data: 5, error: null };
      vi.mocked(apiClient).mockResolvedValue(mockResult);

      const result = await TradeHistoryService.syncMyTrades();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.TRADES_SYNC_ME,
        expect.objectContaining({ method: 'POST' }),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });

    it('syncReferralTrades_CallsApiClientWithPost', async () => {
      const mockResult = { success: true, data: { successCount: 10 }, error: null };
      vi.mocked(apiClient).mockResolvedValue(mockResult);

      const result = await TradeHistoryService.syncReferralTrades();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.TRADES_SYNC_REFERRALS,
        expect.objectContaining({ method: 'POST' }),
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });
  });
});
