import { useState, useEffect, useCallback, useMemo } from "react";
import { useTradeData } from "@/shared/providers/trade-data-provider";
import { CashflowService } from "@/shared/services/cashflow-service";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import { mapAccountData } from "../utils/account-calculations";
import type { CashflowSummary, DashboardSummary } from "@/shared/types/api";

export function useAccountData() {
  const { account, loading: globalLoading, error: globalError, refreshData: globalRefresh } = useTradeData();
  const { isHealthy } = useApiHealth();

  const [cashflow, setCashflow] = useState<CashflowSummary | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      const [cashRes, dashRes] = await Promise.all([
        CashflowService.getCashflowSummary(),
        AnalyticsService.getDashboardSummary(),
      ]);

      if (cashRes.success && cashRes.data) {
        setCashflow(cashRes.data);
      } else if (cashRes.error) {
        setError(cashRes.error.message);
      }

      if (dashRes.success && dashRes.data) {
        setDashboard(dashRes.data);
      } else if (dashRes.error) {
        setError(dashRes.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [isHealthy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ใช้ Utility ในการ Map ข้อมูล (Separation of Concerns)
  const stats = useMemo(() => mapAccountData(cashflow, dashboard), [cashflow, dashboard]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account?.currency || "USD",
    }).format(value);
  };

  const referralUrl = `https://gpilot.com/register?ref=${account?.login || "mock_ref_1234"}`;

  return {
    loading: loading || globalLoading,
    error: error ?? globalError,
    account,
    realBalance: stats.balance,
    profitToday: stats.profitToday,
    profitWeek: stats.profitWeek,
    profitMonth: stats.profitMonth,
    grossTradeProfit: stats.profitMonth, // ชั่วคราว ใช้ก้อนเดียวกันหรือปรับตามความเหมาะสม
    totalDeposits: stats.deposits,
    totalWithdrawals: stats.withdrawals,
    totalProfitSharing: stats.profitSharing,
    netProfit: stats.netProfit,
    formatCurrency,
    referralUrl,
    refreshData: async () => {
      await Promise.all([globalRefresh(), fetchData()]);
    },
  };
}
