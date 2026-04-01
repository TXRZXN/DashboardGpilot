"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import { useTradeData } from "@/shared/providers/trade-data-provider";
import { getMostRecentMonday, toFullISOString } from "@/shared/utils/date-utils";
import type { DashboardSummary } from "@/shared/types/api";

/**
 * useDashboardData
 * ดึง Dashboard Summary จาก Backend โดยตรง
 * Backend คำนวณ: today/week/month profit (server-side timezone), symbol stats, equity curve
 */
export function useDashboardData() {
  const { account, deals, loading: globalLoading, error: globalError, refreshData } = useTradeData();
  const { isHealthy } = useApiHealth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      const monday = getMostRecentMonday();
      const response = await AnalyticsService.getDashboardSummary({ 
        from_date: toFullISOString(monday) 
      });

      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        setError(response.error?.message ?? "Failed to fetch dashboard summary");
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

  // Format equity curve สำหรับ chart (เฉพาะ UI formatting อยู่ที่ Frontend ได้)
  const equityData = useMemo(() => {
    if (!summary) return [];
    return summary.equityCurve.map((point) => ({
      date: new Date(point.time).toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
      time: point.time,
      equity: point.equity,
      balance: point.equity,
    }));
  }, [summary]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account?.currency ?? "USD",
    }).format(value);

  return {
    loading: loading || globalLoading,
    error: error ?? globalError,
    account,
    deals,
    equityData,
    symbolStats: summary?.symbolStats ?? [],
    volumeStats: {
      currentVolume: summary?.totalVolume ?? 0,
      targetVolume: Math.max(10, Math.round((account?.balance ?? 10000) / 100)),
      tradeCount: summary?.totalTrades ?? 0,
    },
    profitToday: summary?.profitToday ?? 0,
    profitWeek: summary?.profitWeek ?? 0,
    profitMonth: summary?.profitMonth ?? 0,
    formatCurrency,
    refreshData: async () => {
      await Promise.all([refreshData(), fetchSummary()]);
    },
  };
}
