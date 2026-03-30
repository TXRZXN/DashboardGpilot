"use client";

import { useMemo } from "react";
import { getNetProfit, isProfitSharing } from "@/features/analytics/utils/performance-utils";
import { useTradeData } from "@/shared/providers/trade-data-provider";

export function useAccountData() {
  const { account, deals, loading, error, refreshData } = useTradeData();

  const financialStats = useMemo(() => {
    const tradeDeals = deals.filter(d => d.symbol && d.symbol !== "" && d.type !== "BALANCE" && !isProfitSharing(d));
    const balanceDeals = deals.filter(d => d.type === 'BALANCE' || isProfitSharing(d));
    
    // 1. ฝากทั้งหมด (Deposit)
    const totalDeposits = balanceDeals
      .filter(d => d.type === 'BALANCE' && (d.profit || 0) > 0)
      .reduce((sum, d) => sum + (d.profit || 0), 0);

    // 2. ถอนทั้งหมด (Withdrawal - ไม่รวม PF)
    const totalWithdrawals = balanceDeals
      .filter(d => d.type === 'BALANCE' && (d.profit || 0) < 0 && !isProfitSharing(d))
      .reduce((sum, d) => sum + Math.abs(d.profit || 0), 0);
    
    // 3. Profit Sharing ทั้งหมด (PF)
    const totalProfitSharing = balanceDeals
      .filter(d => isProfitSharing(d))
      .reduce((sum, d) => sum + Math.abs(d.profit || 0), 0);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Week: วันจันทร์ล่าสุด
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() + diffToMonday);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      today: 0,
      week: 0,
      month: 0,
      grossTradeTotal: 0,
      deposits: totalDeposits,
      withdrawals: totalWithdrawals,
      profitSharing: totalProfitSharing,
      netGain: 0
    };

    tradeDeals.forEach(deal => {
      const dealTime = new Date(deal.time);
      const profit = getNetProfit(deal);

      if (dealTime >= todayStart) stats.today += profit;
      if (dealTime >= weekStart) stats.week += profit;
      if (dealTime >= monthStart) stats.month += profit;
      stats.grossTradeTotal += profit;
    });

    // กำไรสุทธิหลังหักส่วนแบ่ง (Gross Trade Profit - Profit Sharing)
    stats.netGain = stats.grossTradeTotal - totalProfitSharing;

    return stats;
  }, [deals]);

  const realBalance = useMemo(() => {
    // ยอดคงเหลือจริง (Deposit - Withdrawals - PF + Trade Profit)
    return deals.reduce((sum, d) => sum + (d.profit || 0) + (d.commission || 0) + (d.swap || 0) + (d.fee || 0), 0);
  }, [deals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account?.currency || "USD",
    }).format(value);
  };

  const referralUrl = `https://gpilot.com/register?ref=${account?.login || 'mock_ref_1234'}`;

  return {
    loading,
    error,
    account,
    realBalance,
    profitToday: financialStats.today,
    profitWeek: financialStats.week,
    profitMonth: financialStats.month,
    grossTradeProfit: financialStats.grossTradeTotal,
    totalDeposits: financialStats.deposits,
    totalWithdrawals: financialStats.withdrawals,
    totalProfitSharing: financialStats.profitSharing,
    netProfit: financialStats.netGain,
    formatCurrency,
    referralUrl,
    refreshData
  };
}
