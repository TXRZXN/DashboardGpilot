import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../analytics-service';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoint';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGroupedTrades', () => {

    it('getGroupedTrades_Successful_ReturnsData', async () => {
      const mockData = { list: [] } as any;
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData, error: null });

      const result = await AnalyticsService.getGroupedTrades();

      expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.TRADES_GROUPED, undefined, undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getDashboardSummary', () => {
    it('getDashboardSummary_Successful_ReturnsData', async () => {
      const mockData = { timeline: [] } as any;
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData, error: null });

      const result = await AnalyticsService.getDashboardSummary();

      expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.DASHBOARD_SUMMARY, undefined, undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });
});
