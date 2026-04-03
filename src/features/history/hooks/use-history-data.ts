"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { HealthService } from "@/shared/services/health-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { GroupedDeal } from "@/shared/types/api";

export type SortField = "symbol" | "netProfit" | "volume" | "closeTime" | "type";
export type SortDirection = "asc" | "desc";

export interface HistoryTotals {
  volume: number;
  grossProfit: number;
  grossLoss: number;
  netPL: number;
  commission: number;
  swap: number;
  fee: number;
  totalTrades: number;
}

/**
 * useHistoryData
 * ดึง Grouped Trades จาก Backend โดยใช้ Server-side Pagination, Sorting และ Filtering
 */
export function useHistoryData() {
  const { isHealthy } = useApiHealth();

  const [trades, setTrades] = useState<GroupedDeal[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination States (UI 0-indexed)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // UI States — Sorting
  const [sortField, setSortField] = useState<SortField>("closeTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // UI States — Filtering
  const [symbolFilter, setSymbolFilter] = useState("");
  const [debouncedSymbol, setDebouncedSymbol] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [apiTotals, setApiTotals] = useState<HistoryTotals>({
    volume: 0,
    grossProfit: 0,
    grossLoss: 0,
    netPL: 0,
    commission: 0,
    swap: 0,
    fee: 0,
    totalTrades: 0,
  });

  // Debounce Symbol Filter (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSymbol(symbolFilter);
      setPage(0); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [symbolFilter]);

  const fetchGroupedTrades = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      // Parallel Fetch 3: Grouped Trades + Sync + Health
      const [response, syncResponse, healthResponse] = await Promise.all([
        AnalyticsService.getGroupedTrades({
          page: page + 1, // API is 1-indexed
          limit: rowsPerPage,
          date_from: startDate || null,
          end_date: endDate || null,
          symbol: debouncedSymbol || null,
          type: typeFilter === "ALL" ? null : typeFilter,
          order_by: sortField,
          order_dir: sortDirection.toUpperCase() as "ASC" | "DESC"
        }),
        TradeHistoryService.getHistory(),
        HealthService.checkHealth()
      ]);

      if (healthResponse.success && healthResponse.data?.status === "ok") {
        if (response.success && response.data) {
          const { paginated, ...totals } = response.data;
          setTrades(paginated.list || []);
          setTotalCount(response.meta?.total ?? 0);
          
          setApiTotals({
            volume: totals.totalVolume,
            grossProfit: totals.grossProfit,
            grossLoss: totals.grossLoss,
            netPL: totals.netProfit,
            commission: 0,
            swap: 0,
            fee: totals.fee,
            totalTrades: totals.totalTrades,
          });
        } else {
          setError(response.error?.message ?? "Failed to fetch trade history");
        }
      } else {
        setError(healthResponse.error || "System health check failed. Cannot load history data.");
        setTrades([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [
    isHealthy, 
    page, 
    rowsPerPage, 
    debouncedSymbol, 
    typeFilter, 
    startDate, 
    endDate, 
    sortField, 
    sortDirection
  ]);

  useEffect(() => {
    fetchGroupedTrades();
  }, [fetchGroupedTrades]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(0); // Reset page on sort
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return {
    loading,
    error,
    deals: trades,
    totals: apiTotals,

    // Pagination
    page,
    rowsPerPage,
    totalCount,
    handlePageChange,
    handleRowsPerPageChange,

    // Sort
    sortField,
    sortDirection,
    handleSort,

    // Filter Controls
    symbolFilter, setSymbolFilter,
    typeFilter, setTypeFilter,
    startDate, setStartDate,
    endDate, setEndDate,

    refreshData: fetchGroupedTrades,
  };
}
