"use client";

import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Button, 
  TextField, 
  InputAdornment, 
  Tooltip, 
  Snackbar, 
  Alert,
  Skeleton,
  Divider,
  Avatar,
  Stack
} from "@mui/material";
import { 
  ContentCopy as ContentCopyIcon, 
  AccountBalanceWallet as AccountBalanceWalletIcon, 
  Person as PersonIcon, 
  Public as PublicIcon, 
  TrendingUp as TrendingUpIcon, 
  CheckCircle as CheckCircleIcon 
} from "@mui/icons-material";
import { useState } from "react";
import { useAccountData } from "./hooks/use-account-data";

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
            {/* User Profile Card */}
            <Card sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <Box sx={{ height: 100, bgcolor: 'primary.main', opacity: 0.1, position: 'absolute', top: 0, left: 0, right: 0 }} />
              <CardContent sx={{ pt: 6, px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'background.paper', 
                      border: '4px solid',
                      borderColor: 'background.paper',
                      boxShadow: 3
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Avatar>
                  <Box sx={{ mb: 1 }}>
                    {loading ? (
                      <Skeleton width={200} height={32} />
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {account?.name ?? "Trader Name"}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} /> Verified Member
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Account ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>#{account?.login ?? "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Server</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{account?.server ?? "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Leverage</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>1:{account?.leverage ?? "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Currency</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{account?.currency ?? "-"}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financial Card */}
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  Financial Summary
                </Typography>
                
                <Box sx={{ p: 2, bgcolor: 'rgba(34, 211, 238, 0.05)', borderRadius: 3, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>
                    REAL BALANCE (Deposits - Withdrawals - PF + Trade Profit)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {loading ? <Skeleton width={180} /> : formatCurrency(realBalance)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: 'block' }}>
                    *This counts actual equity currently available in your account.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(148, 163, 184, 0.05)', borderRadius: 3, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Today</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: (profitToday ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(profitToday)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(148, 163, 184, 0.05)', borderRadius: 3, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Week</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: (profitWeek ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(profitWeek)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(148, 163, 184, 0.05)', borderRadius: 3, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Month</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: (profitMonth ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(profitMonth)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Total Deposits</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(totalDeposits)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Total Withdrawals</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(totalWithdrawals)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(34, 211, 238, 0.05)', borderRadius: 3 }}>
                      <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, display: 'block' }}>Gross Trade Profit</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: (grossTradeProfit ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(grossTradeProfit)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 3 }}>
                      <Typography variant="caption" sx={{ color: "error.main", fontWeight: 600, display: 'block' }}>Profit Sharing</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(totalProfitSharing)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: 3, border: '1px solid', borderColor: 'success.main' }}>
                      <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700, display: 'block' }}>Net Profit Gain</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: (netProfit ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                        {loading ? <Skeleton /> : formatCurrency(netProfit)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14 }} /> 
                    Net Profit Gain represents your actual trading results after haring fees. 
                    If withdrawals exceed total deposits, all remaining balance is considered pure profit.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Side: Referral */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(16, 185, 129, 0.1)', mx: 'auto', mb: 2 }}>
                  <PublicIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Referral Program</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Share your link and earn commissions for every new trader you refer.
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: 'block', fontWeight: 600 }}>
                  YOUR REFERRAL LINK
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={referralUrl}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Copy to clipboard">
                            <IconButton onClick={handleCopy} edge="end" color="primary">
                              <ContentCopyIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 3, bgcolor: 'rgba(148, 163, 184, 0.03)', fontSize: '0.875rem' }
                    }
                  }}
                />
              </Box>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>1</Avatar>
                  <Typography variant="body2">Copy and share your unique referral link.</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>2</Avatar>
                  <Typography variant="body2">Friends register using your link.</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>3</Avatar>
                  <Typography variant="body2">Receive rewards directly to your account.</Typography>
                </Box>
              </Stack>
              
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 4, borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
              >
                View Commission Details
              </Button>
            </CardContent>
          </Card>
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
