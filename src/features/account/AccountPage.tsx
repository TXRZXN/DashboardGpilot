"use client";

import { Box, Typography, Grid, Snackbar, Alert, Stack, Button } from "@mui/material";
import { useState } from "react";
import { useAccountData } from "./hooks/use-account-data";
import { ProfileCard, FinancialSummary, ReferralCard, PasswordManagementCard, ReferralSyncCard } from "./components";
import RefreshIcon from "@mui/icons-material/Refresh";

export function AccountPage() {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const {
        loading,
        error,
        summary,
        realBalance,
        grossTradeProfit,
        totalDeposits,
        totalWithdrawals,
        totalProfitSharing,
        netProfit,
        formatCurrency,
        referralUrl,
        refreshData,
    } = useAccountData();

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        setSnackbarOpen(true);
    };

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pb: 8 }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Account & Profile
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Manage your MT5 account settings and view financial summaries
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={refreshData}
                    disabled={loading}
                    sx={{ borderRadius: 2 }}
                >
                    Refresh
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column: Profile & Referral */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <ProfileCard
                            loading={loading}
                            name={summary?.name ?? ""}
                            login={summary?.login ?? 0}
                            server={summary?.server ?? ""}
                            leverage={summary?.leverage ?? 0}
                            currency={summary?.currency ?? ""}
                        />
                        <ReferralCard referralUrl={referralUrl} onCopy={handleCopy} />
                    </Stack>
                </Grid>

                {/* Right Column: Financial Overview & Settings */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        <FinancialSummary
                            loading={loading}
                            realBalance={realBalance}
                            grossTradeProfit={grossTradeProfit}
                            totalDeposits={totalDeposits}
                            totalWithdrawals={totalWithdrawals}
                            totalProfitSharing={totalProfitSharing}
                            netProfit={netProfit}
                            formatCurrency={formatCurrency}
                        />
                        <PasswordManagementCard />
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                    <ReferralSyncCard />
                </Grid>
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                    Copied to clipboard!
                </Alert>
            </Snackbar>
        </Box>
    );
}
