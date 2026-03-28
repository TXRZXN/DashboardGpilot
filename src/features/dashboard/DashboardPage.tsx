"use client";

import dynamic from "next/dynamic";
import { Box, Typography, Grid, Skeleton, Alert } from "@mui/material";
import { MetricCard } from "@/shared/ui/metric-card";
import { useDashboardData } from "@/features/dashboard/hooks";

// Dynamic imports using direct paths to avoid barrel file pollution (Critical Request Chains)
const EquityChart = dynamic(() => import("@/shared/ui/equity-chart").then(mod => mod.EquityChart), {
  loading: () => <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' }} />,
  ssr: false,
});

const SymbolPerformance = dynamic(() => import("@/shared/ui/symbol-performance").then(mod => mod.SymbolPerformance), {
  loading: () => <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' }} />,
  ssr: false,
});

const ExecutionLog = dynamic(() => import("@/shared/ui/execution-log").then(mod => mod.ExecutionLog), {
  loading: () => <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' }} />,
  ssr: false,
});

const VolumeProgress = dynamic(() => import("@/features/cashflow/components/volume-progress").then(mod => mod.VolumeProgress), {
  loading: () => <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' }} />,
  ssr: false,
});

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PercentIcon from "@mui/icons-material/Percent";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

export default function DashboardPage() {
  const {
    loading,
    error,
    account,
    deals,
    equityData,
    symbolStats,
    volumeStats,
    formatCurrency,
  } = useDashboardData();

  const balance = account?.balance ?? 0;
  const equity = account?.equity ?? 0;
  const profit = account?.profit ?? 0;
  const marginLevel = account?.margin_level ?? 0;
  const marginFree = account?.margin_free ?? 0;
  const margin = account?.margin ?? 0;
  const leverage = account?.leverage ?? 0;

  const isProfit = profit > 0;
  const formattedProfit = formatCurrency(profit);
  const profitChangeStr = isProfit ? `+${formattedProfit} floating` : `${formattedProfit} floating`;
  const profitChangeType = isProfit ? ("positive" as const) : ("negative" as const);

  const metrics = [
    {
      title: "Balance",
      value: formatCurrency(balance),
      change: "Current balance",
      changeType: "neutral" as const,
      icon: AccountBalanceWalletIcon,
      iconColor: "#22D3EE"
    },
    {
      title: "Equity",
      value: formatCurrency(equity),
      change: profitChangeStr,
      changeType: profitChangeType,
      icon: TrendingUpIcon,
      iconColor: "#10B981"
    },
    {
      title: "Floating P/L",
      value: formattedProfit,
      change: undefined,
      changeType: profitChangeType,
      icon: AttachMoneyIcon,
      iconColor: "#10B981"
    },
    {
      title: "Margin Level",
      value: `${marginLevel.toFixed(2)}%`,
      change: `Leverage 1:${leverage}`,
      changeType: "neutral" as const,
      icon: PercentIcon,
      iconColor: "#22D3EE"
    },
    {
      title: "Free Margin",
      value: formatCurrency(marginFree),
      change: `Margin: ${formatCurrency(margin)}`,
      changeType: "neutral" as const,
      icon: ArrowDownwardIcon,
      iconColor: "#94A3B8"
    },
    {
      title: "Account Leverage",
      value: `1:${leverage}`,
      change: "Standard account",
      changeType: "neutral" as const,
      icon: ArrowUpwardIcon,
      iconColor: "#94A3B8"
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, lg: 3 }, flex: 1 }}>
      <Box sx={{ mb: { xs: 2, lg: 3 } }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            color: "text.primary",
            fontSize: { xs: "1.25rem", lg: "1.5rem" },
          }}
        >
          Trading Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loading ? (
            <Skeleton width={150} height={20} />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Account: {account?.login} ({account?.name}) - {account?.server}
            </Typography>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, lg: 2 }} sx={{ mb: { xs: 2, lg: 3 } }}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 2 }} key={metric.title}>
            {loading ? (
              <Skeleton variant="rectangular" height={115} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)' }} />
            ) : (
              <MetricCard
                title={metric.title}
                value={metric.value}
                change={metric.change}
                changeType={metric.changeType}
                icon={metric.icon}
                iconColor={metric.iconColor}
              />
            )}
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 2, lg: 3 }} sx={{ mb: { xs: 2, lg: 3 } }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <EquityChart loading={loading} data={equityData} title="Account Growth" />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          
            <VolumeProgress 
              loading={loading} 
              currentVolume={volumeStats?.currentVolume || 0}
              targetVolume={volumeStats?.targetVolume || 0}
              tradeCount={volumeStats?.tradeCount || 0}
            />
        
        </Grid>
      </Grid>
      <Box sx={{ mb: { xs: 2, lg: 3 } }}>
        <SymbolPerformance loading={loading} stats={symbolStats} />
      </Box>
      
      <ExecutionLog loading={loading} deals={deals} />
    </Box>
  );
}
