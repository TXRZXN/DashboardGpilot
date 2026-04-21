"use client";

import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { HealthService } from "@/shared/services/health-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { DashboardSummary } from "@/shared/types/api";

/**
 * useDashboardData
 * ดึงข้อมูลสรุปบน Dashboard โดยใช้ TanStack Query เพื่อรองรับ Caching และ Revalidation
 */
export function useDashboardData(serviceBase?: string) {
  const { isHealthy } = useApiHealth();

  const {
    data: summary,
    isLoading: loading,
    error: queryError,
    refetch: refreshData,
  } = useQuery({
    queryKey: ["dashboard-summary", serviceBase],
    queryFn: async () => {
      const [dashResponse, healthResponse] = await Promise.all([
        AnalyticsService.getDashboardSummary(serviceBase),
        HealthService.checkHealth(serviceBase),
      ]);

      if (!healthResponse.success || healthResponse.data?.status !== "ok") {
        throw new Error(healthResponse.error || "System health check failed");
      }

      if (!dashResponse.success || !dashResponse.data) {
        throw new Error(dashResponse.error?.message ?? "Failed to fetch dashboard summary");
      }

      return dashResponse.data;
    },
    enabled: isHealthy,
    // SCALE OPTIMIZATION: 1 minute stale time for Dashboard
    staleTime: 60 * 1000,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return {
    loading,
    error,
    summary: summary || null,
    formatCurrency,
    refreshData,
  };
}
