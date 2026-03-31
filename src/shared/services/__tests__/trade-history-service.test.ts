import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TradeHistoryService } from '../trade-history-service';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoint';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('TradeHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getHistory_WithValidArgs_CallsApiClientWithCorrectArgs', async () => {
    const mockData = { total: 1, data: [] as any[] };
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData });

    const result = await TradeHistoryService.getHistory();

    // Updated to match the current implementation: apiClient(endpoint, options, params)
    expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.TRADES, undefined, undefined);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  it('getHistory_WithParams_PassesParamsToApiClient', async () => {
    const mockData = { total: 1, data: [] as any[] };
    vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData });
    const params = { from_date: '2024-01-01' };

    const result = await TradeHistoryService.getHistory(params);

    expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.TRADES, undefined, params);
    expect(result.success).toBe(true);
  });

  it('getHistory_OnNetworkError_ReturnsUnsuccessfulResponse', async () => {
    vi.mocked(apiClient).mockRejectedValue(new Error('Network Error'));

    const result = await TradeHistoryService.getHistory();

    expect(result.success).toBe(false);
    expect(result.error).toBe('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการทำรายการ');
  });
});
