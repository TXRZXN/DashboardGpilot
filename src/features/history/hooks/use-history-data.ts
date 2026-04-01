"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnalyticsService } from "@/shared/services/analytics-service";
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
 * ดึง Grouped Trades จาก Backend แล้วทำ client-side sort/filter
 *
 * Business Rule ที่อยู่ Backend: การ Group IN/OUT เป็น 1 Position
 * Business Rule ที่อยู่ Frontend: Sorting, Text Search (instant UX)
 */
export function useHistoryData() {
  const { isHealthy } = useApiHealth();

  const [allTrades, setAllTrades] = useState<GroupedDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI States — Sorting
  const [sortField, setSortField] = useState<SortField>("closeTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // UI States — Filtering
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minProfit, setMinProfit] = useState("");
  const [maxProfit, setMaxProfit] = useState("");
  const [minVolume, setMinVolume] = useState("");
  const [maxVolume, setMaxVolume] = useState("");

  const fetchGroupedTrades = useCallback(async () => {
    if (!isHealthy) return;
    try {
      setLoading(true);
      setError(null);

      const response = await AnalyticsService.getGroupedTrades();

      if (response.success && response.data) {
        setAllTrades(response.data.list);
      } else {
        setError(response.error?.message ?? "Failed to fetch trade history");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [isHealthy]);

  useEffect(() => {
    fetchGroupedTrades();
  }, [fetchGroupedTrades]);

  // Client-side filtering (instant UX) + sorting
  const filteredDeals = useMemo(() => {
    let result = allTrades.filter((deal) => {
      const matchesSearch =
        deal.ticket.toString().includes(search) ||
        (deal.symbol?.toLowerCase() ?? "").includes(search.toLowerCase());

      const matchesType = typeFilter === "ALL" || deal.type === typeFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const dealDate = deal.closeTime.split("T")[0];
        if (startDate && dealDate < startDate) matchesDate = false;
        if (endDate && dealDate > endDate) matchesDate = false;
      }

      let matchesProfit = true;
      if (minProfit !== "" && deal.netProfit < Number.parseFloat(minProfit)) matchesProfit = false;
      if (maxProfit !== "" && deal.netProfit > Number.parseFloat(maxProfit)) matchesProfit = false;

      let matchesVolume = true;
      if (minVolume !== "" && deal.volume < Number.parseFloat(minVolume)) matchesVolume = false;
      if (maxVolume !== "" && deal.volume > Number.parseFloat(maxVolume)) matchesVolume = false;

      return matchesSearch && matchesType && matchesDate && matchesProfit && matchesVolume;
    });

    // Client-side sorting (UI State)
    result = [...result].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "netProfit":
          aVal = a.netProfit;
          bVal = b.netProfit;
          break;
        case "closeTime":
          aVal = a.closeTime;
          bVal = b.closeTime;
          break;
        case "symbol":
          aVal = a.symbol ?? "";
          bVal = b.symbol ?? "";
          break;
        case "volume":
          aVal = a.volume;
          bVal = b.volume;
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        default:
          aVal = a.closeTime;
          bVal = b.closeTime;
      }

      const modifier = sortDirection === "asc" ? 1 : -1;
      if (typeof aVal === "string") {
        return (aVal || "").localeCompare(bVal || "") * modifier;
      }
      return ((aVal as number || 0) - (bVal as number || 0)) * modifier;
    });

    return result;
  }, [allTrades, search, sortField, sortDirection, typeFilter, startDate, endDate, minProfit, maxProfit, minVolume, maxVolume]);

  const totals = useMemo<HistoryTotals>(() => {
    return filteredDeals.reduce(
      (acc, deal) => ({
        volume: acc.volume + deal.volume,
        grossProfit: acc.grossProfit + Math.max(0, deal.netProfit),
        grossLoss: acc.grossLoss + Math.min(0, deal.netProfit),
        netPL: acc.netPL + deal.netProfit,
        commission: acc.commission + (deal.commission || 0),
        swap: acc.swap + (deal.swap || 0),
        fee: acc.fee + (deal.fee || 0),
        totalTrades: acc.totalTrades + 1,
      }),
      { volume: 0, grossProfit: 0, grossLoss: 0, netPL: 0, commission: 0, swap: 0, fee: 0, totalTrades: 0 },
    );
  }, [filteredDeals]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return {
    loading,
    error,
    deals: filteredDeals,
    totals,

    // Sort
    sortField,
    sortDirection,
    handleSort,

    // Filter Controls
    search, setSearch,
    typeFilter, setTypeFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    minProfit, setMinProfit,
    maxProfit, setMaxProfit,
    minVolume, setMinVolume,
    maxVolume, setMaxVolume,

    // Stats
    totalCount: allTrades.length,
    filteredCount: filteredDeals.length,
    refreshData: fetchGroupedTrades,
  };
}
