import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TradeHistoryService } from '../trade-history-service';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS, SUB_ENDPOINTS, API_GATEWAY_SUB } from '@/shared/api/endpoint';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('TradeHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getHistory_WithValidArgs_CallsApiClientWithCorrectArgs', async () => {
    const mockData = [] as any[];
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData, error: null });

    const result = await TradeHistoryService.getHistory();

    // Updated to match the current implementation: apiClient(endpoint, options, params, serviceBase)
    expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.TRADES, undefined, undefined, undefined);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  it('getHistory_WithParams_PassesParamsToApiClient', async () => {
    const mockData = [] as any[];
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData, error: null });
    const params = { from_date: '2024-01-01' };

    const result = await TradeHistoryService.getHistory(params);

    expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.TRADES, undefined, params, undefined);
    expect(result.success).toBe(true);
  });

  it('getHistory_OnNetworkError_ReturnsUnsuccessfulResponse', async () => {
    vi.mocked(apiClient).mockRejectedValue(new Error('Network Error'));

    const result = await TradeHistoryService.getHistory();

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: 'FETCH_ERROR',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการทำรายการ',
    });
  });

  describe('Referral History', () => {
    it('getReferralHistory_CallsApiClientWithSubGateway', async () => {
      const mockResult = { success: true, data: { items: [] }, error: null };
      vi.mocked(apiClient).mockResolvedValue(mockResult);

      const result = await TradeHistoryService.getReferralHistory();

      expect(apiClient).toHaveBeenCalledWith(
        SUB_ENDPOINTS.TRADES,
        undefined,
        undefined,
        API_GATEWAY_SUB
      );
      expect(result.success).toBe(true);
    });

    it('syncReferralTrades_CallsApiClientWithPostAndSubGateway', async () => {
      const mockResult = { success: true, data: { status: 'syncing' }, error: null };
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
