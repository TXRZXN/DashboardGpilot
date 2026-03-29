"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { isProfitSharing, calculateEquityCurve, getGroupedTrades } from "@/features/analytics/utils/performance-utils";
import type { Deal } from "@/shared/types/api";
import { useApiHealth } from "@/shared/providers/api-health-provider";

export interface Transaction {
  id: number;
  date: string;
  type: string;
  amount: number;
  balance: number;
  status: string;
  method: string;
}

export function useCashflowData() {
  const { isHealthy, isChecking } = useApiHealth();
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<readonly Deal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TradeHistoryService.getHistory();
      if (response.success && response.data) {
        setDeals(Array.isArray(response.data.data) ? response.data.data : []);
      } else if (!response.success) {
        setError(typeof response.error === 'string' ? response.error : 'Failed to fetch cashflow data');
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

  const isGlobalLoading = !isHealthy || loading || isChecking;

  const transactions = useMemo<Transaction[]>(() => {
    return deals
      .filter((d) => d.type === "BALANCE")
      .map((d, index) => {
        const isPF = d.comment.startsWith("-PF");
        return {
          id: d.ticket || index,
          date: d.time.split("T")[0],
          type: isPF ? "ProfitSharing" : (d.profit >= 0 ? "Deposit" : "Withdrawal"),
          amount: d.profit,
          balance: 0,
          status: "Completed",
          method: d.comment || "MT5 Internal",
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [deals]);

  const currentBalance = useMemo(() => 
    deals.reduce((sum: number, d: Deal) => sum + (d.profit + (d.commission || 0) + (d.swap || 0)), 0), 
  [deals]);

  const balanceData = useMemo(() => 
    calculateEquityCurve(deals).map((point: any) => ({
      date: new Date(point.time).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      time: point.time, // ISO
      balance: point.equity
    })), [deals]);

  const volumeStats = useMemo(() => {
    const groupedTrades = getGroupedTrades(deals).filter((d: Deal) => !!d.symbol);
    const totalVolume = groupedTrades.reduce((sum: number, t: Deal) => sum + t.volume, 0);
    const totalTrades = groupedTrades.length;
    const targetVolume = Math.max(10, Math.round((currentBalance || 10000) / 100));

    return {
      currentVolume: totalVolume,
      targetVolume: targetVolume,
      tradeCount: totalTrades
    };
  }, [deals, currentBalance]);

  const cashflowStats = useMemo(() => {
    const balanceDeals = deals.filter(d => d.type === "BALANCE");
    const deposits = balanceDeals.filter(d => d.profit > 0).reduce((sum, d) => sum + d.profit, 0);
    const withdrawals = balanceDeals.filter(d => d.profit < 0).reduce((sum, d) => sum + Math.abs(d.profit), 0);
    
    return {
      deposits,
      withdrawals,
      netFlow: deposits - withdrawals
    };
  }, [deals]);

  return {
    loading: isGlobalLoading,
    error,
    transactions,
    balanceData,
    volumeStats,
    cashflowStats,
    currentBalance,
    balanceChange: 0, 
    balanceChangePercent: 0,
  };
}
