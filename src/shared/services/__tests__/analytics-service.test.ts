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

  describe('getPerformance', () => {
    it('getPerformance_Successful_ReturnsData', async () => {
      const mockData = { totalTrades: 100 } as any;
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData, error: null });

      const result = await AnalyticsService.getPerformance();

      expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.ANALYTICS_PERFORMANCE, undefined, undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('getPerformance_WithError_ReturnsError', async () => {
      vi.mocked(apiClient).mockRejectedValue(new Error('API fail'));
      const result = await AnalyticsService.getPerformance();
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FETCH_ERROR');
    });
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
