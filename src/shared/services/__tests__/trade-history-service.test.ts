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

  describe('Referral History', () => {
    it('getReferralHistory_CallsApiClientWithSubGateway', async () => {
      const mockResult = { success: true, data: { items: [] }, error: null };
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
});
