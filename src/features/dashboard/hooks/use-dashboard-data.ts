"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { HealthService } from "@/shared/services/health-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { DashboardSummary } from "@/shared/types/api";

/**
 * useDashboardData
 * ดึง Dashboard Summary และ Health Check ขนานกัน
 * หมายเหตุ: getHistory() ถูกเรียกเพื่อกระตุ้น Background Sync ใน Backend เท่านั้น ไม่ได้นำข้อมูลมาแสดงผล
 */
export function useDashboardData() {
  const { isHealthy } = useApiHealth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      const [dashResponse, healthResponse] = await Promise.all([
        AnalyticsService.getDashboardSummary(),
        HealthService.checkHealth(),
        // ยิงทิ้งเพื่อ updated db เฉยๆ (Background Sync)
        TradeHistoryService.getHistory().catch(() => null),
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
  }, [isHealthy]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Format equity curve สำหรับ chart
  const equityData = useMemo(() => {
    if (!summary) return [];
    return summary.equityCurve.map((point) => ({
      date: new Date(point.time).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      }),
      time: point.time,
      equity: point.equity,
      balance: point.equity,
    }));
  }, [summary]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return {
    loading,
    error,
    account: { balance: summary?.balance ?? 0 },
    equityData,
    symbolStats: summary?.symbolStats?.list ?? [],
    recent: summary?.recent ?? [],
    volumeStats: {
      tradeCount: summary?.symbolStats?.totaltrades ?? 0,
    },
    profitToday: summary?.profitToday ?? 0,
    profitWeek: summary?.profitWeek ?? 0,
    profitMonth: summary?.profitMonth ?? 0,
    formatCurrency,
    refreshData: fetchSummary,
  };
}
