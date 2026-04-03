"use client";

import React, { createContext, useContext, useMemo } from "react";
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

// TradeDataProvider is now just a dummy provider since features handle their own fetching.
// It is kept to prevent context errors for any existing components during transition.
interface TradeDataProviderProps {
  readonly children: React.ReactNode;
}

export function TradeDataProvider({ children }: TradeDataProviderProps) {
  const value = useMemo(() => ({
    account: null,
    deals: [],
    loading: false,
    error: null,
    isInitialized: true,
    refreshData: async () => { },
  }), []);

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
