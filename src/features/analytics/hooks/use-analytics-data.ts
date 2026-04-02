"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import { useTradeData } from "@/shared/providers/trade-data-provider";
import type { PerformanceStats, GroupedDeal } from "@/shared/types/api";

import { 
  computePLDistribution, 
  computeAssetExposure 
} from "../utils/analytics-transforms";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAnalyticsData
 * - ดึง PerformanceStats จาก Backend (Win Rate, Sharpe, MaxDD, PF, R/R, Health Score, Equity Curve)
 * - ดึง GroupedDeal[] จาก Backend เพื่อคำนวณ visualization transforms ที่ Frontend
 *   (PL Distribution, Asset Exposure) ซึ่งเป็น UI-only transforms ไม่ใช่ Business Logic
 */
export function useAnalyticsData() {
  const { account } = useTradeData();
  const { isHealthy } = useApiHealth();

  const [perfStats, setPerfStats] = useState<PerformanceStats | null>(null);
  const [groupedTrades, setGroupedTrades] = useState<GroupedDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      const [perfRes, groupedRes] = await Promise.all([
        AnalyticsService.getPerformance(),
        AnalyticsService.getGroupedTrades(),
      ]);

      if (perfRes.success && perfRes.data) {
        setPerfStats(perfRes.data);
      } else if (perfRes.error) {
        setError(perfRes.error.message);
      }
 
      if (groupedRes.success && groupedRes.data) {
        setGroupedTrades(groupedRes.data.list);
      } else if (groupedRes.error) {
        setError(groupedRes.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [isHealthy]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Visualization transforms (UI-only — อยู่ Frontend ตามที่กำหนด)
  const plDistribution = useMemo(() => computePLDistribution(groupedTrades), [groupedTrades]);
  const assetExposure = useMemo(() => computeAssetExposure(groupedTrades), [groupedTrades]);

  // Build stats ที่รวม perfStats จาก Backend + visualization จาก Frontend
  const stats = useMemo(() => {
    if (!perfStats) return null;
    return {
      ...perfStats,
      // Aliases เพื่อ backward compat กับ AnalyticsPage
      maxDrawdown: perfStats.maxDrawdownPct,
      plDistribution,
      assetExposure,
    };
  }, [perfStats, plDistribution, assetExposure]);

  return {
    loading,
    error,
    account,
    stats,
    refreshStats: fetchAll,
  };
}
