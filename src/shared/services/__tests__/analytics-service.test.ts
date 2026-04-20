import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../analytics-service';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS, SERVICE_BASE_GPILOT } from '@/shared/api/endpoint';
import { MOCK_PRODUCT_DETAIL } from '../../mock/dashboard-mock';

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

      // Expecting 4 arguments now: (endpoint, options, params, serviceBase)
      expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.TRADES_GROUPED, undefined, undefined, undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('getGroupedTrades_WithServiceBase_PassesBaseToClient', async () => {
      const mockData = { list: [] } as any;
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData, error: null });
      const serviceBase = SERVICE_BASE_GPILOT;

      await AnalyticsService.getGroupedTrades(undefined, serviceBase);

      expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.TRADES_GROUPED, undefined, undefined, serviceBase);
    });
  });

  describe('getProductDetail', () => {
    it('getProductDetail_WithGpilot_CallsApiClient', async () => {
      const mockData = { timeline: [] } as any;
      vi.mocked(apiClient).mockResolvedValue({ success: true, data: mockData, error: null });

      const result = await AnalyticsService.getProductDetail(undefined, SERVICE_BASE_GPILOT);

      expect(apiClient).toHaveBeenCalledWith(ENDPOINTS.PRODUCT_DETAIL, undefined, undefined, SERVICE_BASE_GPILOT);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('getProductDetail_WithNonGpilot_ReturnsMockDataWithoutApiCall', async () => {
      const nonGpilotBase = '/api/gateway/safegrow';
      
      const result = await AnalyticsService.getProductDetail(undefined, nonGpilotBase);

      // Should not call apiClient for non-gpilot services (mock mode)
      expect(apiClient).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(MOCK_PRODUCT_DETAIL);
    });
  });
});
