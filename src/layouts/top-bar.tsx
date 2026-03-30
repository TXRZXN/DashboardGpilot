"use client";

import { 
  AppBar, 
  Toolbar, 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Divider,
  Stack
} from "@mui/material";
import { 
  LightMode as LightModeIcon, 
  DarkMode as DarkModeIcon,
  Login as LoginIcon,
  Close as CloseIcon,
  AdsClick as AdsClickIcon
} from "@mui/icons-material";
import { useThemeMode } from "@/shared/ui/theme-provider";
import { useState } from "react";

export function TopBar() {
  const { mode, toggleTheme } = useThemeMode();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleOpenLogin = () => setLoginOpen(true);
  const handleCloseLogin = () => setLoginOpen(false);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: mode === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          transition: "background-color 0.3s ease",
          zIndex: 110,
        }}
      >
      <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, lg: 2 } }}>
          <Button
            variant="outlined"
            size="small"
            component="a"
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<AdsClickIcon fontSize="small" />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: mode === "dark" ? "success.light" : "success.dark",
              borderColor: mode === "dark" ? "success.light" : "success.dark",
              "&:hover": { 
                bgcolor: mode === "dark" ? "rgba(74, 222, 128, 0.1)" : "rgba(22, 163, 74, 0.05)",
                borderColor: mode === "dark" ? "success.light" : "success.dark",
              },
              px: { lg: 2 },
              display: { xs: "none", sm: "flex" }
            }}
          >
            สมัคร Strikepro
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<LoginIcon fontSize="small" />}
            onClick={handleOpenLogin}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
              px: { lg: 2.5 }
            }}
          >
            Login
          </Button>
          <IconButton
            onClick={toggleTheme}
            aria-label="Toggle brightness mode"
            sx={{
              color: "text.secondary",
            }}
          >
            {mode === "dark" ? (
              <LightModeIcon sx={{ color: "#FBBF24" }} />
            ) : (
              <DarkModeIcon sx={{ color: "#64748B" }} />
            )}
          </IconButton>

        </Box>
      </Toolbar>
    </AppBar>

    {/* Login Modal */}
    <Dialog 
      open={loginOpen} 
      onClose={handleCloseLogin}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: mode === "dark" ? "#0F172A" : "#FFFFFF",
            backgroundImage: "none"
          }
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Manrope' }}>Login</Typography>
        <IconButton onClick={handleCloseLogin} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Email or Username"
            variant="outlined"
            placeholder="Enter your email"
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            placeholder="••••••••"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" 
          onClick={handleCloseLogin}
          sx={{ 
            py: 1.2, 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          Sign In
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
}
