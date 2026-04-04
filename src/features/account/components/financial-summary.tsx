"use client";

import { Box, Typography, Grid, Card, CardContent, Skeleton } from "@mui/material";
import { AccountBalanceWallet as AccountBalanceWalletIcon, TrendingUp as TrendingUpIcon } from "@mui/icons-material";

interface FinancialSummaryProps {
    readonly loading: boolean;
    readonly realBalance: number;
    readonly grossTradeProfit: number;
    readonly totalDeposits: number;
    readonly totalWithdrawals: number;
    readonly totalProfitSharing: number;
    readonly netProfit: number;
    readonly formatCurrency: (value: number) => string;
}

export function FinancialSummary({
    loading,
    realBalance,
    grossTradeProfit,
    totalDeposits,
    totalWithdrawals,
    totalProfitSharing,
    netProfit,
    formatCurrency,
}: Readonly<FinancialSummaryProps>) {
    return (
        <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                    <AccountBalanceWalletIcon sx={{ color: "primary.main", fontSize: 20 }} />
                    Financial Summary
                </Typography>

                <Box sx={{ p: 2, bgcolor: "rgba(34, 211, 238, 0.05)", borderRadius: 3, mb: 2 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        REAL BALANCE (Deposits - Withdrawals - PF + Trade Profit)
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", mt: 0.5 }}>
                        {loading ? <Skeleton width={180} /> : formatCurrency(realBalance)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
                        *This counts actual equity currently available in your account.
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                Total Deposits
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {loading ? <Skeleton /> : formatCurrency(totalDeposits)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                Total Withdrawals
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "error.main" }}>
                                {loading ? <Skeleton /> : formatCurrency(totalWithdrawals)}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 4 }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(34, 211, 238, 0.05)", borderRadius: 3 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: "primary.main", fontWeight: 600, display: "block" }}
                            >
                                Gross Trade Profit
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 700,
                                    color: (grossTradeProfit ?? 0) >= 0 ? "success.main" : "error.main",
                                }}
                            >
                                {loading ? <Skeleton /> : formatCurrency(grossTradeProfit)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(239, 68, 68, 0.05)", borderRadius: 3 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: "error.main", fontWeight: 600, display: "block" }}
                            >
                                Profit Sharing
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "error.main" }}>
                                {loading ? <Skeleton /> : formatCurrency(totalProfitSharing)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: "rgba(16, 185, 129, 0.08)",
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "success.main",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: "success.main", fontWeight: 700, display: "block" }}
                            >
                                Net Profit Gain
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 800, color: (netProfit ?? 0) >= 0 ? "success.main" : "error.main" }}
                            >
                                {loading ? <Skeleton /> : formatCurrency(netProfit)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
