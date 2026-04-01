"use client";

import { 
  Box, 
  Typography, 
  Grid, 
  Snackbar, 
  Alert,
  Stack
} from "@mui/material";
import { useState } from "react";
import { useAccountData } from "./hooks/use-account-data";
import { ProfileCard, FinancialSummary, ReferralCard } from "./components";

export function AccountPage() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { 
    loading, 
    error, 
    account,
    realBalance,
    profitToday,
    profitWeek,
    profitMonth,
    grossTradeProfit,
    totalDeposits,
    totalWithdrawals,
    totalProfitSharing,
    netProfit,
    formatCurrency, 
    referralUrl 
  } = useAccountData();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setSnackbarOpen(true);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, lg: 3 }, flex: 1, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Manrope', mb: 1 }}>
          Manage Account
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Details, referral link, and financial summary
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Profile & Finance */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <ProfileCard account={account} loading={loading} />
            <FinancialSummary 
              loading={loading}
              realBalance={realBalance}
              profitToday={profitToday}
              profitWeek={profitWeek}
              profitMonth={profitMonth}
              grossTradeProfit={grossTradeProfit}
              totalDeposits={totalDeposits}
              totalWithdrawals={totalWithdrawals}
              totalProfitSharing={totalProfitSharing}
              netProfit={netProfit}
              formatCurrency={formatCurrency}
            />
          </Stack>
        </Grid>

        {/* Right Side: Referral */}
        <Grid size={{ xs: 12, md: 5 }}>
          <ReferralCard referralUrl={referralUrl} onCopy={handleCopy} />
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
