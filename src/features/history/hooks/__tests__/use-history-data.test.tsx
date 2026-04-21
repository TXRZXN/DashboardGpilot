import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useHistoryData } from "../use-history-data";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { HealthService } from "@/shared/services/health-service";
import { createWrapper } from "@/shared/utils/__tests__/test-utils";
import { useApiHealth } from "@/shared/providers/api-health-provider";

// Mock services
vi.mock("@/shared/services/analytics-service", () => ({
  AnalyticsService: {
    getGroupedTrades: vi.fn(),
  },
}));

vi.mock("@/shared/services/health-service", () => ({
  HealthService: {
    checkHealth: vi.fn(),
  },
}));

vi.mock("@/shared/providers/api-health-provider", () => ({
  useApiHealth: vi.fn(() => ({ isHealthy: true })),
}));

describe("useHistoryData Hook (TanStack Query)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockHistoryResponse = {
    paginated: {
      list: [{ ticket: 1, symbol: "EURUSD", netProfit: 100 }],
      total: 1,
    },
    totalVolume: 1,
    grossProfit: 100,
    grossLoss: 0,
    netProfit: 100,
    fee: 0,
    totalTrades: 1,
  } as any;

  it("useHistoryData_SuccessfulFetch_StoresDataInQuery", async () => {
    vi.mocked(AnalyticsService.getGroupedTrades).mockResolvedValue({
      success: true,
      data: mockHistoryResponse,
      meta: { total: 1, page: 1, limit: 10 },
      error: null
    });
    vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: true,
      data: { status: "ok" },
      error: null
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.deals).toHaveLength(1);
    expect(result.current.deals[0].symbol).toBe("EURUSD");
    expect(result.current.totals.netPL).toBe(100);
    expect(result.current.totalCount).toBe(1);
  });

  it("useHistoryData_HandleSort_ResetsPageAndTriggersRefetch", async () => {
    vi.mocked(AnalyticsService.getGroupedTrades).mockResolvedValue({
      success: true,
      data: mockHistoryResponse,
      error: null
    });
    vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: true,
      data: { status: "ok" },
      error: null
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleSort("symbol");
    });

    expect(result.current.sortField).toBe("symbol");
    expect(result.current.page).toBe(0);
  });

  it("useHistoryData_PaginationChange_UpdatesState", async () => {
    vi.mocked(AnalyticsService.getGroupedTrades).mockResolvedValue({
      success: true,
      data: mockHistoryResponse,
      error: null
    });
    vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: true,
      data: { status: "ok" },
      error: null
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.page).toBe(2);
  });
});
