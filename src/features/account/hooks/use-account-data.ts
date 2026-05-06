import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AccountService } from "@/shared/services/account-service";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { API_GATEWAY_SUB } from "@/shared/api/endpoint";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { 
  AccountProfile, 
  AccountFinance, 
  GroupedTradesResponse,
  TradeRequest
} from "@/shared/types/api";
import type { AccountInitialData } from "../AccountPage";

export function useAccountData(tableParams?: TradeRequest, initialData?: AccountInitialData) {
  const { isHealthy } = useApiHealth();

  const [profiles, setProfiles] = useState<AccountProfile[]>(() => {
    if (!initialData?.profile) return [];
    return Array.isArray(initialData.profile) ? initialData.profile : [initialData.profile];
  });
  const [finances, setFinances] = useState<AccountFinance[]>(() => {
    if (!initialData?.finance) return [];
    return Array.isArray(initialData.finance) ? initialData.finance : [initialData.finance];
  });
  const [allTradesData, setAllTradesData] = useState<GroupedTradesResponse[]>(() => {
    if (!initialData?.tradesData) return [];
    return Array.isArray(initialData.tradesData) ? initialData.tradesData : [initialData.tradesData];
  });
  
  const [activePortIndex, setActivePortIndex] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If initialData is provided, mark as fetched
  const isInitialFetched = useRef(!!initialData && Object.keys(initialData).length > 0);

  // 1. Fetch Profile & Finance (Initial or Refresh)
  const fetchAccountInfo = useCallback(async () => {
    if (!isHealthy) return;
    
    setLoading(true);
    try {
      const [profileRes, financeRes] = await Promise.all([
        AccountService.getProfile(),
        AccountService.getFinance(),
      ]);

      if (profileRes.success && profileRes.data) {
        const profileList = Array.isArray(profileRes.data) ? profileRes.data : [profileRes.data];
        setProfiles(profileList);
      }
      if (financeRes.success && financeRes.data) {
        const financeList = Array.isArray(financeRes.data) ? financeRes.data : [financeRes.data];
        setFinances(financeList);
      }
      
      if (!profileRes.success || !financeRes.success) {
        setError(profileRes.error?.message || financeRes.error?.message || "Failed to fetch account info");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching account info.");
    } finally {
      setLoading(false);
      isInitialFetched.current = true;
    }
  }, [isHealthy]);

  // 2. Fetch Trades (Independent)
  const fetchTrades = useCallback(async () => {
    if (!isHealthy) return;

    setTableLoading(true);
    try {
      const tradesRes = await AnalyticsService.getGroupedTrades({
        page: tableParams?.page || 1,
        limit: tableParams?.limit || 10,
        type: tableParams?.type || null,
        date_from: tableParams?.date_from || null,
        end_date: tableParams?.end_date || null,
      }, API_GATEWAY_SUB);

      if (tradesRes.success && tradesRes.data) {
        // Sub-API returns List of objects, each for one port
        const dataList = Array.isArray(tradesRes.data) ? tradesRes.data : [tradesRes.data];
        setAllTradesData(dataList);
      } else if (!tradesRes.success) {
        setError(tradesRes.error?.message || "Failed to fetch trades");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching trades.");
    } finally {
      setTableLoading(false);
    }
  }, [isHealthy, tableParams]);

  // Initial load
  useEffect(() => {
    if (!isInitialFetched.current && isHealthy) {
      fetchAccountInfo();
    }
  }, [isHealthy, fetchAccountInfo]);

  // Table update load
  useEffect(() => {
    if (isHealthy) {
      fetchTrades();
    }
  }, [isHealthy, fetchTrades]);

  const profile = profiles[activePortIndex] || null;
  const finance = finances[activePortIndex] || null;
  const tradesData = allTradesData[activePortIndex] || null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: profile?.currency || "USD",
    }).format(value);
  };

  const summary = useMemo(() => {
    if (!profile) return null;
    return {
      name: profile.name,
      login: profile.mt5Id,
      server: profile.server,
      leverage: profile.leverage,
      currency: profile.currency,
      balance: profile.balance,
      ...finance
    };
  }, [profile, finance]);

  return {
    loading,
    tableLoading,
    error,
    summary,
    profile,
    finance,
    profiles, // Expose for tabs
    activePortIndex,
    setActivePortIndex,
    trades: tradesData?.paginated?.list || [],
    totalTrades: tradesData?.totalTrades || 0,
    tradesTotals: {
      volume: tradesData?.totalVolume || 0,
      grossProfit: tradesData?.grossProfit || 0,
      grossLoss: tradesData?.grossLoss || 0,
      netPL: tradesData?.totalPL ?? (tradesData as any)?.["totalP/L"] ?? tradesData?.netProfit ?? 0,
      commission: 0,
      swap: 0,
      fee: tradesData?.fee || 0,
      totalTrades: tradesData?.totalTrades || 0
    },
    realBalance: (finance as any)?.totalBalance ?? profile?.balance ?? 0,
    grossTradeProfit: finance?.grossTradeProfit ?? 0,
    totalDeposits: finance?.totalDeposits ?? 0,
    totalWithdrawals: finance?.totalWithdrawals ?? 0,
    totalProfitSharing: finance?.totalProfitSharing ?? 0,
    netProfit: finance?.netProfit ?? 0,
    equityCurve: finance?.equityCurve || [],
    formatCurrency,
    refreshData: async () => {
      setLoading(true);
      try {
        // 1. First trigger manual sync
        await AccountService.syncAccount();
        
        // 2. Then fetch updated data in parallel
        await Promise.all([fetchAccountInfo(), fetchTrades()]);
      } catch (err) {
        setError("Failed to sync and refresh data.");
      } finally {
        setLoading(false);
      }
    },
  };
}


