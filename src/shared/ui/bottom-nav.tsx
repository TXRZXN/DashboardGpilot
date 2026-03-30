"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PersonIcon from "@mui/icons-material/Person";
import { useThemeMode } from "@/shared/ui/theme-provider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Cashflow", href: "/cashflow", icon: <AccountBalanceWalletIcon /> },
  { label: "History", href: "/history", icon: <HistoryIcon /> },
  { label: "Analytics", href: "/analytics", icon: <AnalyticsIcon /> },
  { label: "Account", href: "/account", icon: <PersonIcon /> },
];

export function BottomNav() {
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const currentIndex = navItems.findIndex((item) => item.href === pathname);

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", lg: "none" },
        bgcolor: mode === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        zIndex: 1000,
        pb: "env(safe-area-inset-bottom)",
        transition: "background-color 0.3s ease",
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentIndex}
        sx={{
          bgcolor: "transparent",
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            color: "text.secondary",
            minWidth: "auto",
            py: 1,
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.7rem",
            fontWeight: 500,
            "&.Mui-selected": {
              fontSize: "0.7rem",
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
