"use client";

import { useMemo } from "react";
import { calculateEquityCurve, getGroupedTrades } from "@/features/analytics/utils/performance-utils";
import type { Deal } from "@/shared/types/api";
import { useTradeData } from "@/shared/providers/trade-data-provider";

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
  const { account, deals, loading, error, refreshData } = useTradeData();

  const currentBalance = useMemo(() => 
    deals.reduce((sum: number, d: Deal) => sum + (d.profit + (d.commission || 0) + (d.swap || 0)), 0), 
  [deals]);

  const transactions = useMemo<Transaction[]>(() => {
    return deals
      .filter((d) => d.type === "BALANCE")
      .map((d, index) => {
        const isPF = d.comment.startsWith("-PF");
        let type = "Withdrawal";
        if (isPF) {
          type = "ProfitSharing";
        } else if (d.profit >= 0) {
          type = "Deposit";
        }

        return {
          id: d.ticket || index,
          date: d.time.split("T")[0],
          type,
          amount: d.profit,
          balance: 0,
          status: "Completed",
          method: d.comment || "MT5 Internal",
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [deals]);

  const balanceData = useMemo(() => 
    calculateEquityCurve(deals).map((point: any) => ({
      date: new Date(point.time).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      time: point.time, 
      balance: point.equity ?? 0
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
    loading,
    error,
    account,
    deals,
    transactions,
    balanceData,
    volumeStats,
    cashflowStats,
    currentBalance,
    balanceChange: 0, 
    balanceChangePercent: 0,
    refreshData
  };
}
