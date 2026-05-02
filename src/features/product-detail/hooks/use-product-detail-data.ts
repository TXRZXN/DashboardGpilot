"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/shared/services/analytics-service";
import { useApiHealth } from "@/shared/providers/api-health-provider";
import type { ProductDetail } from "@/shared/types/api";

/**
 * useProductDetailData
 * ดึง Product Detail โดยใช้ TanStack Query เพื่อรองรับ Caching และ Revalidation
 */
export function useProductDetailData(serviceBase?: string) {
  const { isHealthy } = useApiHealth();

  const { 
    data: summary, 
    isLoading: loading, 
    error: queryError,
    refetch: refreshData,
  } = useQuery({
    queryKey: ["product-detail", serviceBase],
    queryFn: async () => {
      const response = await AnalyticsService.getProductDetail(undefined, serviceBase);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Failed to fetch product detail");
      }

      return response.data;
    },
    enabled: true, // ปรับให้ดึงข้อมูลเสมอ ไม่รอสถานะ Health เพื่อแก้ปัญหาตอนเปลี่ยนหน้า
    // SCALE OPTIMIZATION: Keep data fresh for 1 minute
    staleTime: 60 * 1000,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  // Format equity curve สำหรับ chart
  const equityData = useMemo(() => {
    if (!summary) return [];
    return summary.equityCurve.map((point) => ({
      date: new Date(point.time).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      }),
      time: point.time,
      equity: point.equity,
      balance: point.equity,
    }));
  }, [summary]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return {
    loading,
    error,
    account: { balance: summary?.balance ?? 0 },
    equityData,
    symbolStats: summary?.symbolStats?.list ?? [],
    recent: [], 
    volumeStats: {
      tradeCount: summary?.symbolStats?.totaltrades ?? 0,
    },
    performance: {
      winRate: summary?.winrate ?? 0,
      recoveryFactor: summary?.recoveryFactor ?? 0,
      maxDrawdown: summary?.maxdd ?? 0,
      profitFactor: summary?.profitFactor ?? 0,
      sharpeRatio: 0, 
    },
    profitToday: summary?.profitToday ?? 0,
    profitWeek: summary?.avgProfitWeek ?? 0,
    profitMonth: summary?.avgProfitMonth ?? 0,
    formatCurrency,
    refreshData,
  };
}
