import { useState, useEffect, useCallback, useMemo } from "react";
import { useTradeData } from "@/shared/providers/trade-data-provider";
import { AccountService } from "@/shared/services/account-service";
import { HealthService } from "@/shared/services/health-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { AccountSummary } from "@/shared/types/api";

export function useAccountData() {
  const { account, loading: globalLoading, error: globalError, refreshData: globalRefresh } = useTradeData();
  const { isHealthy } = useApiHealth();

  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, healthRes] = await Promise.all([
        AccountService.getAccountSummary(),
        HealthService.checkHealth(),
      ]);

      if (healthRes.success && healthRes.data?.status === "ok") {
        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        } else if (summaryRes.error) {
          setError(summaryRes.error.message);
        }
      } else {
        setError(healthRes.error || "System health check failed. Cannot load account data.");
        setSummary(null);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account?.currency || "USD",
    }).format(value);
  };

  // Simple Obfuscation: Encode ID with prefix to prevent plain text modification
  const encodeReferral = (id: string | number) => {
    try {
      // Add GP- prefix before encoding to Base64 and strip padding for cleaner URL
      return btoa(`GP-${id}`).replace(/=/g, "");
    } catch {
      return id.toString();
    }
  };

  const [baseUrl, setBaseUrl] = useState("https://gpilotsystem.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const referralUrl = `${baseUrl}/register?ref=${
    summary?.login ? encodeReferral(summary.login) : "mock_ref_1234"
  }`;

  return {
    loading: loading || globalLoading,
    error: error ?? globalError,
    account,
    summary, // Provide full summary if needed
    realBalance: summary?.balance ?? 0,
    grossTradeProfit: summary?.grossTradeProfit ?? 0,
    totalDeposits: summary?.totalDeposits ?? 0,
    totalWithdrawals: summary?.totalWithdrawals ?? 0,
    totalProfitSharing: summary?.totalProfitSharing ?? 0,
    netProfit: summary?.netProfit ?? 0,
    formatCurrency,
    referralUrl,
    refreshData: async () => {
      await Promise.all([globalRefresh(), fetchData()]);
    },
  };
}
