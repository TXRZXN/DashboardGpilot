"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Suspense } from "react";
import { Box, Typography, Grid, Skeleton, Alert, Stack, Chip, Tabs, Tab } from "@mui/material";
import { MetricCard } from "@/shared/ui/metric-card";
import { useProductDetailData } from "./hooks/use-product-detail-data";
import { useSearchParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import HistoryIcon from "@mui/icons-material/History";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PercentIcon from "@mui/icons-material/Percent";

// Dynamic imports to avoid barrel file pollution (Critical Request Chains)
const EquityChart = dynamic(() => import("@/shared/ui/equity-chart").then((mod) => mod.EquityChart), {
    loading: () => (<Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4, bgcolor: "rgba(255,255,255,0.03)" }} />),
    ssr: false,
});

const SymbolPerformance = dynamic(() => import("@/shared/ui/symbol-performance").then((mod) => mod.SymbolPerformance), {
    loading: () => (<Skeleton variant="rectangular" height={340} sx={{ borderRadius: 4, bgcolor: "rgba(255,255,255,0.03)" }} />),
    ssr: false,
});

const RiskMetrics = dynamic(() => import("@/shared/ui/risk-metrics").then((mod) => mod.RiskMetrics), {
    ssr: false,
});

// History tab — dynamic import (lazy-loaded only when tab is active)
const HistoryTab = dynamic(() => import("@/features/history/HistoryPage"), {
    loading: () => (<Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)" }} />),
    ssr: false,
});

function ProductDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productName = searchParams.get("name") ?? "Product Detail";
    const serviceBase = searchParams.get("base") ?? undefined;
    const [activeTab, setActiveTab] = useState(0);

    const {
        loading,
        error,
        account,
        equityData,
        symbolStats,
        volumeStats,
        performance,
        profitToday,
        profitWeek,
        profitMonth,
        formatCurrency,
    } = useProductDetailData(serviceBase || undefined);

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
            title: "AVG Profit WEEK",
            value: formatCurrency(profitWeek),
            change: "Weekly average",
            changeType: profitWeek >= 0 ? ("positive" as const) : ("negative" as const),
            icon: AttachMoneyIcon,
            iconColor: "#10B981",
        },
        {
            title: "AVG Profit MONTH",
            value: formatCurrency(profitMonth),
            change: "Monthly average",
            changeType: profitMonth >= 0 ? ("positive" as const) : ("negative" as const),
            icon: PercentIcon,
            iconColor: "#22D3EE",
        },
    ];

    return (
        <Box sx={{ p: { xs: 2, lg: 3 }, flex: 1 }}>
            {/* Breadcrumb */}
            <Chip
                icon={<ArrowBackIcon sx={{ fontSize: "16px !important" }} />}
                label="Dashboard"
                size="small"
                onClick={() => router.push("/dashboard")}
                sx={{
                    mb: 1.5,
                    cursor: "pointer",
                    fontWeight: 500,
                    color: "text.secondary",
                    bgcolor: "transparent",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    "&:hover": { bgcolor: "action.hover" },
                }}
            />

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(34, 211, 238, 0.15)"
                                : "rgba(8, 145, 178, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <LocalMallIcon sx={{ color: "primary.main", fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: '"Manrope", sans-serif',
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: { xs: "1.25rem", lg: "1.5rem" },
                            lineHeight: 1.2,
                        }}
                    >
                        {productName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Product Detail
                    </Typography>
                </Box>
            </Box>

            {/* Tabs */}
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    mb: 3,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            minHeight: 44,
                            gap: 0.5,
                        },
                        "& .Mui-selected": {
                            fontWeight: 700,
                        },
                    }}
                >
                    <Tab
                        id="tab-overview"
                        aria-controls="tabpanel-overview"
                        icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label="Overview"
                    />
                    <Tab
                        id="tab-history"
                        aria-controls="tabpanel-history"
                        icon={<HistoryIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label="Trade History"
                    />
                </Tabs>
            </Box>

            {/* Tab Panel: Overview */}
            <Box 
                role="tabpanel" 
                id="tabpanel-overview" 
                aria-labelledby="tab-overview"
                sx={{ display: activeTab === 0 ? 'block' : 'none' }}
            >
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
                </Stack>
            </Box>

            {/* Tab Panel: Trade History */}
            <Box 
                role="tabpanel" 
                id="tabpanel-history" 
                aria-labelledby="tab-history"
                sx={{ display: activeTab === 1 ? 'block' : 'none' }}
            >
                <HistoryTab serviceBase={serviceBase || undefined} />
            </Box>
        </Box>
    );
}

export default function ProductDetailPage() {
    return (
        <Suspense fallback={<Box sx={{ p: 3 }}><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} /></Box>}>
            <ProductDetailContent />
        </Suspense>
    );
}
