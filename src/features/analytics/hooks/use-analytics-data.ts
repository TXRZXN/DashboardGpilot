"use client";

import { useMemo } from 'react';
import { useTradeData } from '@/shared/providers/trade-data-provider';
import { 
  calculateEquityCurve, 
  calculateSharpeRatio, 
  calculateMaxDrawdown,
  calculateWinRate,
  calculateRiskRewardDetails,
  calculateProfitFactorDetails,
  calculatePLDistribution,
  calculateAssetExposure,
  getGroupedTrades,
  getNetProfit,
  calculateRecoveryFactor,
  calculateHealthScore
} from '../utils/performance-utils';

export function useAnalyticsData() {
  const { account, deals, loading, error } = useTradeData();

  const stats = useMemo(() => {
    if (deals.length === 0) return null;

    const tradeDeals = getGroupedTrades(deals).filter(d => !!d.symbol);
    const equityCurve = calculateEquityCurve(deals);
    const sharpeRatio = calculateSharpeRatio(deals);
    const maxDrawdownData = calculateMaxDrawdown(equityCurve);
    const winRate = calculateWinRate(deals);
    const rrDetails = calculateRiskRewardDetails(deals);
    const pfDetails = calculateProfitFactorDetails(deals);
    const plDistribution = calculatePLDistribution(deals);
    const assetExposure = calculateAssetExposure(deals);
    const recoveryFactor = calculateRecoveryFactor(deals, maxDrawdownData.amount);
    const healthScore = calculateHealthScore(winRate, pfDetails.profitFactor, maxDrawdownData.percentage);

    const wins = tradeDeals.filter(d => getNetProfit(d) > 0).length;

    return {
      equityCurve: equityCurve.map(p => ({
        ...p,
        date: new Date(p.time).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        balance: p.equity
      })),
      sharpeRatio,
      maxDrawdown: maxDrawdownData.percentage,
      recoveryFactor,
      healthScore,
      winRate,
      riskRewardRatio: rrDetails.ratio,
      avgWin: rrDetails.avgWin,
      avgLoss: rrDetails.avgLoss,
      profitFactor: pfDetails.profitFactor,
      grossProfit: pfDetails.grossProfit,
      grossLoss: pfDetails.grossLoss,
      plDistribution,
      assetExposure,
      totalTrades: tradeDeals.length,
      wins
    };
  }, [deals]);

  return {
    loading,
    error,
    account,
    deals,
    stats
  };
}
