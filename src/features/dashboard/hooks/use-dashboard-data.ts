"use client";

import { useMemo } from "react";
import { calculateEquityCurve, getGroupedTrades } from "@/features/analytics/utils/performance-utils";
import { useTradeData } from "@/shared/providers/trade-data-provider";

export function useDashboardData() {
  const { account, deals, loading, error, refreshData } = useTradeData();

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

  const timelineStats = useMemo(() => {
    const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol); // กรองเฉพาะรายการเทรดจริง
    const now = new Date();
    
    // Today: วันจันทร์ที่ 30 มี.ค. 2026 (อ้างอิงจากเวลาปัจจุบัน)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Week: นับตามจันทร์ (จันทร์ที่ผ่านมาถึงจันทร์นี้)
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // ปรับให้เริ่มที่วันจันทร์
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    
    // Month: เริ่มต้นที่วันที่ 1 ของเดือนปัจจุบัน
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = {
      today: 0,
      week: 0,
      month: 0
    };

    tradeDeals.forEach((deal) => {
      const dealTime = new Date(deal.time);
      let profit = 0;
      if (deal.net_profit !== undefined && deal.net_profit !== null) {
        profit = deal.net_profit;
      } else {
        profit = (deal.profit || 0) + (deal.commission || 0) + (deal.swap || 0) + (deal.fee || 0);
      }

      if (dealTime >= today) stats.today += profit;
      if (dealTime >= startOfWeek) stats.week += profit;
      if (dealTime >= startOfMonth) stats.month += profit;
    });

    return stats;
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
    loading,
    error,
    account,
    deals: [...deals].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
    equityData,
    symbolStats,
    volumeStats,
    profitToday: timelineStats.today,
    profitWeek: timelineStats.week,
    profitMonth: timelineStats.month,
    formatCurrency,
    refreshData
  };
}
