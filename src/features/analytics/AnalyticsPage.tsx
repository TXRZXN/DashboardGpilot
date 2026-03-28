"use client";

import dynamic from "next/dynamic";
import { Box, Typography, Grid, Alert, Skeleton } from "@mui/material";
import { RiskMetrics } from "@/features/analytics/components/risk-metrics";
import { MarginGauge } from "@/features/analytics/components/margin-gauge";
import { AssetExposure } from "@/features/analytics/components/asset-exposure";
import { useAnalyticsData } from "@/features/analytics/hooks";

// Dynamic imports using direct paths to avoid barrel file pollution
const EquityChart = dynamic(() => import("@/shared/ui/equity-chart").then(mod => mod.EquityChart), {
  loading: () => <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' }} />,
  ssr: false,
});

const PLDistribution = dynamic(() => import("@/features/analytics/components/pl-distribution").then(mod => mod.PLDistribution), {
  loading: () => <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)' }} />,
  ssr: false,
});

export default function AnalyticsPage() {
  const { loading, error, account, stats } = useAnalyticsData();

  // Mapping equity curve to chart format
  const equityChartData = stats?.equityCurve.map(point => ({
    date: point.date, // Formatted
    time: point.time, // ISO สำหรับการกรอง
    equity: point.equity,
    balance: point.equity
  }));

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
          Performance Intelligence
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Advanced risk metrics and portfolio analysis
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: { xs: 2, lg: 3 } }}>
        <RiskMetrics 
          loading={loading}
          winRate={stats?.winRate}
          recoveryFactor={stats?.recoveryFactor}
          maxDrawdown={stats?.maxDrawdown}
          profitFactor={stats?.profitFactor}
          grossProfit={stats?.grossProfit}
          grossLoss={stats?.grossLoss}
          avgWin={stats?.avgWin}
          avgLoss={stats?.avgLoss}
          totalTrades={stats?.totalTrades}
          wins={stats?.wins}
        />
      </Box>

      <Grid container spacing={{ xs: 2, lg: 3 }} sx={{ mb: { xs: 2, lg: 3 } }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MarginGauge 
            loading={loading}
            // Portfolio Health Index (WinRate 40%, PF 40%, MaxDD 20%)
            value={stats?.healthScore || 0} 
            max={100} 
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <AssetExposure 
            loading={loading}
            assets={stats?.assetExposure}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, lg: 3 }} sx={{ mb: { xs: 2, lg: 3 } }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <EquityChart 
            loading={loading}
            data={equityChartData}
            title="Performance Velocity"
          />
        </Grid>
      </Grid>

      <PLDistribution 
        loading={loading}
        data={stats?.plDistribution}
      />
    </Box>
  );
}
