"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import { useTradeData } from "@/shared/providers/trade-data-provider";
import type { PerformanceStats, GroupedDeal } from "@/shared/types/api";

// Types สำหรับ visualization transforms (UI-only, อยู่ Frontend ได้)
interface PLData {
  range: string;
  count: number;
}

interface AssetData {
  symbol: string;
  exposure: number;
  profit: number;
  direction: string;
}

// ---------------------------------------------------------------------------
// Pure UI helpers (visualization transforms — ไม่ใช่ Business Logic)
// ---------------------------------------------------------------------------

function computePLDistribution(grouped: GroupedDeal[]): PLData[] {
  if (grouped.length === 0) return [];
  const ranges = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500];
  const bins: Record<string, number> = { "<-500": 0, ">500": 0 };
  for (let i = 0; i < ranges.length - 1; i++) {
    bins[`${ranges[i]} to ${ranges[i + 1]}`] = 0;
  }
  for (const deal of grouped) {
    const p = deal.profit;
    if (p < -500) bins["<-500"]++;
    else if (p >= 500) bins[">500"]++;
    else {
      for (let i = 0; i < ranges.length - 1; i++) {
        if (p >= ranges[i] && p < ranges[i + 1]) {
          bins[`${ranges[i]} to ${ranges[i + 1]}`]++;
          break;
        }
      }
    }
  }
  return Object.entries(bins).map(([range, count]) => ({ range, count }));
}

function computeAssetExposure(grouped: GroupedDeal[]): AssetData[] {
  const totalVolume = grouped.reduce((s, d) => s + d.volume, 0);
  const stats: Record<string, { volume: number; profit: number; wins: number; trades: number }> = {};
  for (const deal of grouped) {
    const sym = deal.symbol || "Unknown";
    if (!stats[sym]) stats[sym] = { volume: 0, profit: 0, wins: 0, trades: 0 };
    stats[sym].volume += deal.volume;
    stats[sym].profit += deal.profit;
    stats[sym].trades += 1;
    if (deal.profit > 0) stats[sym].wins += 1;
  }
  return Object.entries(stats)
    .map(([symbol, data]) => ({
      symbol,
      exposure: totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0,
      profit: data.profit,
      direction: data.profit >= 0 ? "long" : "short",
    }))
    .sort((a, b) => b.exposure - a.exposure);
}

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
