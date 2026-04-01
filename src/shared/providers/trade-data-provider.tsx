"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AccountService } from "@/shared/services/account-service";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { useApiHealth } from "./api-health-provider";
import type { AccountInfo, Deal } from "@/shared/types/api";

interface TradeDataContextType {
  account: AccountInfo | null;
  deals: readonly Deal[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  refreshData: (params?: any) => Promise<void>;
}

const TradeDataContext = createContext<TradeDataContextType | undefined>(undefined);

export function TradeDataProvider({ children }: { children: React.ReactNode }) {
  const { isHealthy, isChecking: isHealthChecking } = useApiHealth();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [deals, setDeals] = useState<readonly Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchData = useCallback(async (params?: any) => {
    // ป้องกันการกวาดข้อมูลซ้ำซ้อนถ้า Health ยังไม่ผ่าน
    if (!isHealthy) return;

    try {
      setLoading(true);
      setError(null);

      // ยิง API แบบขนาน (Parallel Fetching)
      const [accRes, historyRes] = await Promise.all([
        AccountService.getAccountInfo(),
        TradeHistoryService.getHistory(params)
      ]);

      if (accRes.success && accRes.data) {
        setAccount(accRes.data);
      } else if (accRes.error) {
        setError(accRes.error.message || "Failed to fetch account info");
      }

      if (historyRes.success && historyRes.data) {
        setDeals(historyRes.data);
      } else if (historyRes.error) {
        setError(historyRes.error.message || "Failed to fetch trade history");
      }

      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during global fetch");
    } finally {
      setLoading(false);
    }
  }, [isHealthy]);

  // Initial load เมื่อ Health Check ผ่าน และยังไม่เคยเรียกข้อมูลเลย
  useEffect(() => {
    if (isHealthy && !isInitialized && !loading) {
      fetchData();
    }
  }, [isHealthy, isInitialized, loading, fetchData]);

  // หากสถานะ Healthy เปลี่ยนเป็น False ให้ Reset State หรือแสดงผลตามความเหมาะสม
  useEffect(() => {
    if (!isHealthy) {
      setIsInitialized(false);
    }
  }, [isHealthy]);

  const value = useMemo(() => ({
    account,
    deals,
    loading: loading || isHealthChecking,
    error,
    isInitialized,
    refreshData: fetchData
  }), [account, deals, loading, isHealthChecking, error, isInitialized, fetchData]);

  return (
    <TradeDataContext.Provider value={value}>
      {children}
    </TradeDataContext.Provider>
  );
}

export function useTradeData() {
  const context = useContext(TradeDataContext);
  if (context === undefined) {
    throw new Error("useTradeData must be used within a TradeDataProvider");
  }
  return context;
}
