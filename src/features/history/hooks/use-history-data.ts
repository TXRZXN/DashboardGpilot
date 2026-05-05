"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { GroupedDeal } from "@/shared/types/api";

export type SortField = "symbol" | "netProfit" | "volume" | "closeTime" | "type" | "time" | "balance";
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
 * ดึง Grouped Trades โดยใช้ TanStack Query เพื่อรองรับ Pagination, Sorting และ Filtering
 */
export function useHistoryData(serviceBase?: string) {
  const { isHealthy } = useApiHealth();

  // View States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("closeTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filtering States
  const [symbolFilter, setSymbolFilter] = useState("");
  const [debouncedSymbol, setDebouncedSymbol] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce Symbol Filter (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSymbol(symbolFilter);
      setPage(0); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [symbolFilter]);

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch: refreshData,
  } = useQuery({
    queryKey: [
      "history", 
      serviceBase, 
      page, 
      rowsPerPage, 
      debouncedSymbol, 
      typeFilter, 
      startDate, 
      endDate, 
      sortField, 
      sortDirection
    ],
    queryFn: async () => {
      const response = await AnalyticsService.getGroupedTrades({
        page: page + 1,
        limit: rowsPerPage,
        date_from: startDate || null,
        end_date: endDate || null,
        symbol: debouncedSymbol || null,
        type: typeFilter === "ALL" ? null : typeFilter,
        order_by: sortField,
        order_dir: sortDirection.toUpperCase() as "ASC" | "DESC"
      }, serviceBase);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch trade history");
      }

      return response.data;
    },
    enabled: true, // ปรับให้ดึงข้อมูลเสมอ ไม่รอสถานะ Health เพื่อแก้ปัญหาตอนเปลี่ยนหน้า
    staleTime: 60 * 1000,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  // Process data for UI
  const trades = data?.paginated?.list || [];
  const totalCount = data?.totalTrades ?? 0;
  
  const apiTotals: HistoryTotals = useMemo(() => {
    if (!data) return {
      volume: 0, grossProfit: 0, grossLoss: 0, netPL: 0,
      commission: 0, swap: 0, fee: 0, totalTrades: 0
    };

    return {
      volume: data.totalVolume,
      grossProfit: data.grossProfit,
      grossLoss: data.grossLoss,
      netPL: data.totalPL ?? (data as any)?.["totalP/L"] ?? data.netProfit ?? 0,
      commission: 0,
      swap: 0,
      fee: data.fee,
      totalTrades: data.totalTrades,
    };
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(0);
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
    page,
    rowsPerPage,
    totalCount,
    handlePageChange,
    handleRowsPerPageChange,
    sortField,
    sortDirection,
    handleSort,
    symbolFilter, setSymbolFilter,
    typeFilter, setTypeFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    refreshData,
  };
}
