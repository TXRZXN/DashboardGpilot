"use client";

import dynamic from "next/dynamic";
import { Box, Typography, Grid, Skeleton, Alert, Stack } from "@mui/material";
import { MetricCard } from "@/shared/ui/metric-card";
import { useDashboardData } from "@/features/dashboard/hooks";

// Dynamic imports using direct paths to avoid barrel file pollution (Critical Request Chains)
const EquityChart = dynamic(() => import("@/shared/ui/equity-chart").then((mod) => mod.EquityChart), {
    loading: () => (
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4, bgcolor: "rgba(255,255,255,0.03)" }} />
    ),
    ssr: false,
});

const SymbolPerformance = dynamic(() => import("@/shared/ui/symbol-performance").then((mod) => mod.SymbolPerformance), {
    loading: () => (
        <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 4, bgcolor: "rgba(255,255,255,0.03)" }} />
    ),
    ssr: false,
});

const ExecutionLog = dynamic(() => import("@/shared/ui/execution-log").then((mod) => mod.ExecutionLog), {
    loading: () => (
        <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 4, bgcolor: "rgba(255,255,255,0.03)" }} />
    ),
    ssr: false,
});

const RiskMetrics = dynamic(() => import("@/shared/ui/risk-metrics").then((mod) => mod.RiskMetrics), {
    ssr: false,
});

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PercentIcon from "@mui/icons-material/Percent";

export default function DashboardPage() {
    const {
        loading,
        error,
        account,
        equityData,
        symbolStats,
        volumeStats,
        recent,
        performance,
        profitToday,
        profitWeek,
        profitMonth,
        formatCurrency,
    } = useDashboardData();

    const balance = account?.balance ?? 0;
    const metrics = [
        {
            title: "Balance",
            value: formatCurrency(balance),
            change: "Current balance",
            changeType: "neutral" as const,
            icon: AccountBalanceWalletIcon,
            iconColor: "#22D3EE",
        },
        {
            title: "Profit TODAY",
            value: formatCurrency(profitToday),
            change: "Daily performance",
            changeType: profitToday >= 0 ? ("positive" as const) : ("negative" as const),
            icon: TrendingUpIcon,
            iconColor: "#10B981",
        },
        {
            title: "Profit WEEK",
            value: formatCurrency(profitWeek),
            change: "Weekly (From Mon)",
            changeType: profitWeek >= 0 ? ("positive" as const) : ("negative" as const),
            icon: AttachMoneyIcon,
            iconColor: "#10B981",
        },
        {
            title: "Profit MONTH",
            value: formatCurrency(profitMonth),
            change: "Monthly performance",
            changeType: profitMonth >= 0 ? ("positive" as const) : ("negative" as const),
            icon: PercentIcon,
            iconColor: "#22D3EE",
        },
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
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={{ xs: 1.5, lg: 2 }} sx={{ mb: { xs: 2, lg: 3 } }}>
                {metrics.map((metric) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={metric.title}>
                        {loading ? (
                            <Skeleton
                                variant="rectangular"
                                height={115}
                                sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)" }}
                            />
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

            {/* Analytics Section - New */}
            <Stack spacing={2}>
                <RiskMetrics
                    loading={loading}
                    winRate={performance.winRate}
                    recoveryFactor={performance.recoveryFactor}
                    maxDrawdown={performance.maxDrawdown}
                    profitFactor={performance.profitFactor}
                />

                <EquityChart loading={loading} data={equityData} title="Account Growth" />

                <SymbolPerformance loading={loading} stats={symbolStats} totalTrades={volumeStats.tradeCount} />
                <ExecutionLog loading={loading} recent={recent} />
            </Stack>
        </Box>
    );
}
