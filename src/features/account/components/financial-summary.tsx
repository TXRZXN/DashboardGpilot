"use client";

import { Box, Typography, Grid, Card, CardContent, SxProps, Theme } from "@mui/material";
import { AccountBalanceWallet as AccountBalanceWalletIcon } from "@mui/icons-material";
import { StatBox, InfoGrid } from "@/shared/ui";

interface FinancialSummaryProps {
    readonly loading: boolean;
    readonly realBalance: number;
    readonly grossTradeProfit: number;
    readonly totalDeposits: number;
    readonly totalWithdrawals: number;
    readonly totalProfitSharing: number;
    readonly netProfit: number;
    readonly formatCurrency: (value: number) => string;
    readonly sx?: SxProps<Theme>;
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
    sx,
}: Readonly<FinancialSummaryProps>) {
    return (
        <Card sx={{ borderRadius: 4, ...sx }}>
            <CardContent sx={{ p: 3 }}>
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                    <AccountBalanceWalletIcon sx={{ color: "primary.main", fontSize: 20 }} />
                    Financial Summary
                </Typography>

                <StatBox
                    label="REAL BALANCE (Deposits - Withdrawals - PF + Trade Profit)"
                    value={formatCurrency(realBalance)}
                    loading={loading}
                    color="primary.main"
                    bgcolor="rgba(34, 211, 238, 0.05)"
                    sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <InfoGrid
                            loading={loading}
                            columns={{ xs: 6 }}
                            items={[
                                { label: "Total Deposits", value: formatCurrency(totalDeposits) },
                                { label: "Total Withdrawals", value: formatCurrency(totalWithdrawals) },
                                {
                                    label: "Gross Trade Profit",
                                    value: (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 700,
                                                color: grossTradeProfit >= 0 ? "success.main" : "error.main",
                                            }}
                                        >
                                            {formatCurrency(grossTradeProfit)}
                                        </Typography>
                                    ),
                                },
                                {
                                    label: "Profit Sharing",
                                    value: (
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "error.main" }}>
                                            {formatCurrency(totalProfitSharing)}
                                        </Typography>
                                    ),
                                },
                            ]}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatBox
                            label="Net Profit Gain"
                            value={formatCurrency(netProfit)}
                            loading={loading}
                            color={netProfit >= 0 ? "success.main" : "error.main"}
                            bgcolor="rgba(16, 185, 129, 0.08)"
                            sx={{ border: "1px solid", borderColor: "success.main" }}
                        />
                    </Grid>
                </Grid>

                <Typography variant="caption" sx={{ color: "text.secondary", mt: 2, display: "block" }}>
                    *This counts actual equity currently available in your account.
                </Typography>
            </CardContent>
        </Card>
    );
}
