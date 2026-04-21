import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "../use-dashboard-data";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { HealthService } from "@/shared/services/health-service";
import { createWrapper } from "@/shared/utils/__tests__/test-utils";
import { useApiHealth } from "@/shared/providers/api-health-provider";

// Mock services
vi.mock("@/shared/services/analytics-service", () => ({
  AnalyticsService: {
    getDashboardSummary: vi.fn(),
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

describe("useDashboardData Hook (TanStack Query)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useDashboardData_SuccessfulFetch_ReturnsSummary", async () => {
    const mockSummary = { totalProfit: 1000, tradeCount: 10 } as any;
    vi.mocked(AnalyticsService.getDashboardSummary).mockResolvedValue({
      success: true,
      data: mockSummary,
      error: null
    });
    vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: true,
      data: { status: "ok" },
      error: null
    });

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createWrapper(),
    });

    // Initial state
    expect(result.current.loading).toBe(true);

    // Wait for success
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toEqual(mockSummary);
    expect(result.current.error).toBeNull();
  });

  it("useDashboardData_HealthCheckFail_ReturnsError", async () => {
    vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: false,
      error: "Health service down",
      data: { status: "error" } as any
    });

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/Health service down/);
    expect(result.current.summary).toBeNull();
  });
});
