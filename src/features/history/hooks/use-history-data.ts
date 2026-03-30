"use client";

import { useState, useMemo } from "react";
import { getGroupedTrades, getNetProfit } from "@/features/analytics/utils/performance-utils";
import { useTradeData } from "@/shared/providers/trade-data-provider";

export type SortField = "symbol" | "profit" | "volume" | "time" | "type";
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
  const { deals, loading, error, refreshData } = useTradeData();
  
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

      const currentNetProfit = getNetProfit(deal);
      let matchesProfit = true;
      if (minProfit !== "" && currentNetProfit < Number.parseFloat(minProfit)) matchesProfit = false;
      if (maxProfit !== "" && currentNetProfit > Number.parseFloat(maxProfit)) matchesProfit = false;

      let matchesVolume = true;
      if (minVolume !== "" && deal.volume < Number.parseFloat(minVolume)) matchesVolume = false;
      if (maxVolume !== "" && deal.volume > Number.parseFloat(maxVolume)) matchesVolume = false;

      return matchesSearch && matchesType && matchesDate && matchesProfit && matchesVolume;
    });

    // 4. เรียงลำดับ (Sorting)
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

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
        const currentNetProfit = getNetProfit(deal);
        return {
          volume: acc.volume + deal.volume,
          grossProfit: acc.grossProfit + Math.max(0, currentNetProfit),
          grossLoss: acc.grossLoss + Math.min(0, currentNetProfit),
          netPL: acc.netPL + currentNetProfit,
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
    totalCount: deals.length,
    filteredCount: filteredDeals.length,
    refreshData
  };
}
