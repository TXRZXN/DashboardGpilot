import { useState, useEffect, useMemo, useCallback } from 'react';
import { AccountService } from '@/shared/services/account-service';
import { TradeHistoryService } from '@/shared/services/trade-history-service';
import type { AccountInfo, Deal } from '@/shared/types/api';
import { useApiHealth } from '@/shared/providers/api-health-provider';
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
  const { isHealthy, isChecking } = useApiHealth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [deals, setDeals] = useState<readonly Deal[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [accRes, historyRes] = await Promise.all([
        AccountService.getAccountInfo(),
        TradeHistoryService.getHistory()
      ]);

      const formatError = (err: any): string => {
        if (Array.isArray(err)) {
          return err.map(e => `${e.loc?.join('.') || 'error'}: ${e.msg || 'Unknown validation error'}`).join(', ');
        }
        return typeof err === 'string' ? err : 'Unknown error';
      };

      if (accRes.success && accRes.data) {
        setAccount(accRes.data);
      } else if (!accRes.success) {
        setError(formatError(accRes.error));
      }

      if (historyRes.success && historyRes.data) {
        setDeals(Array.isArray(historyRes.data.data) ? historyRes.data.data : []);
      } else if (!historyRes.success) {
        setError(formatError(historyRes.error));
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลวิเคราะห์');
      console.error(err);
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
    loading: isGlobalLoading,
    error,
    account,
    deals,
    stats
  };
}
