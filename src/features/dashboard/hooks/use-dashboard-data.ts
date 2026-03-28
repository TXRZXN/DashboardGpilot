"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import { AccountService } from "@/shared/services/account-service";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { calculateEquityCurve, getGroupedTrades } from "@/features/analytics/utils/performance-utils";
import type { AccountInfo, Deal } from "@/shared/types/api";

export function useDashboardData() {
  const { isHealthy, isChecking } = useApiHealth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [deals, setDeals] = useState<readonly Deal[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [accRes, historyRes] = await Promise.all([
        AccountService.getAccountInfo(),
        TradeHistoryService.getHistory()
      ]);

      if (accRes.success && accRes.data) {
        setAccount(accRes.data);
      } else if (!accRes.success) {
        setError(accRes.error as string);
      }

      if (historyRes.success && historyRes.data) {
        setDeals(Array.isArray(historyRes.data.data) ? historyRes.data.data : []);
      } else if (!historyRes.success) {
        // setError(historyRes.error as string); // Optional: Handle history errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Initial Fetch
  useEffect(() => {
    if (isHealthy) {
      fetchData();
    }
  }, [isHealthy, fetchData]);

  // 2. Auto-retry if empty (ทุกๆ 5 วินาที)
  useEffect(() => {
    if (!isHealthy || deals.length > 0) return;

    const timer = setInterval(() => {
      if (!loading) {
        fetchData();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isHealthy, deals.length, loading, fetchData]);

  // หาก API ไม่พร้อม หรือกำลังเช็ค ให้เข้าสู่สถานะ Skeleton (loading=true)
  const isGlobalLoading = !isHealthy || loading || isChecking;

  const equityData = useMemo(() => 
    calculateEquityCurve(deals).map(point => ({
      date: new Date(point.time).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      time: point.time, // ส่ง ISO String ไปด้วย
      equity: point.equity,
      balance: point.equity
    })), [deals]);

  const symbolStats = useMemo(() => {
    const stats: Record<string, { trades: number; wins: number; profit: number }> = {};
    const groupedTrades = getGroupedTrades(deals).filter(d => d.symbol);

    groupedTrades.forEach((trade) => {
      const symbol = trade.symbol || "Unknown";
      if (!stats[symbol]) {
        stats[symbol] = { trades: 0, wins: 0, profit: 0 };
      }

      stats[symbol].trades += 1;
      stats[symbol].profit += trade.profit;
      if (trade.profit > 0) {
        stats[symbol].wins += 1;
      }
    });

    return Object.entries(stats)
      .map(([symbol, data]) => ({
        symbol,
        trades: data.trades,
        profit: data.profit,
        winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [deals]);

  const volumeStats = useMemo(() => {
    const groupedTrades = getGroupedTrades(deals).filter(d => d.symbol);
    const totalVolume = groupedTrades.reduce((sum, t) => sum + t.volume, 0);
    const totalTrades = groupedTrades.length;
    // ปริมาณเป้าหมายสมมติ: 1 lot ต่อ $1000 ของ Balance
    const targetVolume = Math.max(10, Math.round((account?.balance || 10000) / 100));

    return {
      currentVolume: totalVolume,
      targetVolume: targetVolume,
      tradeCount: totalTrades
    };
  }, [deals, account]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account?.currency || "USD",
    }).format(value);
  };

  return {
    loading: isGlobalLoading,
    error,
    account,
    deals: [...deals].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
    equityData,
    symbolStats,
    volumeStats,
    formatCurrency,
  };
}
