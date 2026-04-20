"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { HealthService } from "@/shared/services/health-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { DashboardSummary } from "@/shared/types/api";

/**
 * useDashboardData
 * ดึงข้อมูลเบื้องต้นสำหรับสรุปบน Dashboard Card
 * - เรียก /api/v1/dashboard
 * - เรียก /api/v1/health
 * - **ไม่มี** การกระตุ้น Background Sync (ลด Load)
 */
export function useDashboardData(serviceBase?: string) {
  const { isHealthy } = useApiHealth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      const [dashResponse, healthResponse] = await Promise.all([
        AnalyticsService.getDashboardSummary(serviceBase),
        HealthService.checkHealth(serviceBase),
      ]);

      if (healthResponse.success && healthResponse.data?.status === "ok") {
        if (dashResponse.success && dashResponse.data) {
          setSummary(dashResponse.data);
        } else if (!dashResponse.success) {
          setError(
            dashResponse.error?.message ?? "Failed to fetch dashboard summary",
          );
        }
      } else {
        setError(
          healthResponse.error ||
            "System health check failed. Cannot load dashboard data.",
        );
        setSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [isHealthy, serviceBase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return {
    loading,
    error,
    summary,
    formatCurrency,
    refreshData: fetchData,
  };
}
