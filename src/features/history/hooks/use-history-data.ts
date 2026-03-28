"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { getGroupedTrades, getNetProfit } from "@/features/analytics/utils/performance-utils";
import type { Deal } from "@/shared/types/api";
import { useApiHealth } from "@/shared/providers/api-health-provider";

export type SortField = "position" | "symbol" | "profit" | "volume" | "time" | "type";
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

export function useHistoryData() {
  const { isHealthy, isChecking } = useApiHealth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<readonly Deal[]>([]);
  
  // States สำหรับ Sorting
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // States สำหรับ Filtering
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minProfit, setMinProfit] = useState("");
  const [maxProfit, setMaxProfit] = useState("");
  const [minVolume, setMinVolume] = useState("");
  const [maxVolume, setMaxVolume] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TradeHistoryService.getHistory();
      if (response.success && response.data) {
        setDeals(Array.isArray(response.data.data) ? response.data.data : []);
        setError(null);
      } else {
        setError(typeof response.error === 'string' ? response.error : "Failed to fetch trade history");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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

  const filteredDeals = useMemo(() => {
    // 1. ใช้ระบบ Grouping ส่วนกลาง (position_id grouping)
    const groupedDeals = getGroupedTrades([...deals]);

    // 2. กรองรายการ BALANCE ออกสำหรับตาราง
    const tradeDealsOnly = groupedDeals.filter(d => d.type !== "BALANCE");

    // 3. กรองตามเงื่อนไข (Filter)
    let result = tradeDealsOnly.filter((deal) => {
      const matchesSearch = 
        deal.ticket.toString().includes(search) || 
        (deal.symbol?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesType = typeFilter === "ALL" || deal.type === typeFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const dealDate = deal.time.split('T')[0];
        if (startDate && dealDate < startDate) matchesDate = false;
        if (endDate && dealDate > endDate) matchesDate = false;
      }

      const netProfit = getNetProfit(deal);
      let matchesProfit = true;
      if (minProfit !== "" && netProfit < parseFloat(minProfit)) matchesProfit = false;
      if (maxProfit !== "" && netProfit > parseFloat(maxProfit)) matchesProfit = false;

      let matchesVolume = true;
      if (minVolume !== "" && deal.volume < parseFloat(minVolume)) matchesVolume = false;
      if (maxVolume !== "" && deal.volume > parseFloat(maxVolume)) matchesVolume = false;

      return matchesSearch && matchesType && matchesDate && matchesProfit && matchesVolume;
    });

    // 4. เรียงลำดับ (Sorting)
    result.sort((a, b) => {
      let aVal: any = a[sortField === "position" ? "position_id" : sortField];
      let bVal: any = b[sortField === "position" ? "position_id" : sortField];

      if (sortField === "profit") {
        aVal = getNetProfit(a);
        bVal = getNetProfit(b);
      }
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (typeof aVal === "string") {
        return (aVal || "").localeCompare((bVal as string) || "") * modifier;
      }
      return ((aVal as number || 0) - (bVal as number || 0)) * modifier;
    });

    return result;
  }, [deals, search, sortField, sortDirection, typeFilter, startDate, endDate, minProfit, maxProfit, minVolume, maxVolume]);

  const totals = useMemo<HistoryTotals>(() => {
    return filteredDeals.reduce(
      (acc, deal) => {
        const netProfit = getNetProfit(deal);
        return {
          volume: acc.volume + deal.volume,
          grossProfit: acc.grossProfit + (netProfit > 0 ? netProfit : 0),
          grossLoss: acc.grossLoss + (netProfit < 0 ? netProfit : 0),
          netPL: acc.netPL + netProfit,
          commission: acc.commission + (deal.commission || 0),
          swap: acc.swap + (deal.swap || 0),
          fee: acc.fee + (deal.fee || 0),
          totalTrades: acc.totalTrades + 1,
        };
      },
      { volume: 0, grossProfit: 0, grossLoss: 0, netPL: 0, commission: 0, swap: 0, fee: 0, totalTrades: 0 }
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
    loading: isGlobalLoading,
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
    totalCount: deals.length,
    filteredCount: filteredDeals.length,
  };
}
