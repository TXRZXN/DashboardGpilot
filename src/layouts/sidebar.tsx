"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Dashboard, AccountBalanceWallet, History, Analytics, Person } from "@mui/icons-material";
import { useThemeMode } from "@/shared/ui";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Dashboard },
  { label: "Cashflow", href: "/cashflow", icon: AccountBalanceWallet },
  { label: "History", href: "/history", icon: History },
  { label: "Analytics", href: "/analytics", icon: Analytics },
  { label: "My account", href: "/account", icon: Person },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mode } = useThemeMode();
  const backgroundColor = mode === "dark"
    ? "rgba(34, 211, 238, 0.15)"
    : "rgba(8, 145, 178, 0.1)";
  const borderColor = mode === "dark"
    ? "1px solid rgba(34, 211, 238, 0.2)"
    : "1px solid rgba(8, 145, 178, 0.2)";
  const hoverActiveBgcolor = mode === "dark"
    ? "rgba(34, 211, 238, 0.2)"
    : "rgba(8, 145, 178, 0.15)";
  const hoverNotActiveBgcolor = mode === "dark"
    ? "rgba(148, 163, 184, 0.08)"
    : "rgba(15, 23, 42, 0.05)";


  return (
    <Box
      sx={{
        width: 256,
        height: "100vh",
        bgcolor: mode === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        backdropFilter: "blur(12px)",
        zIndex: 50,
        transition: "background-color 0.3s ease",
      }}
    >
      <Box sx={{ p: 3, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "rgba(34, 211, 238, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Analytics sx={{ color: "primary.main", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 600,
                  color: "text.primary",
                  letterSpacing: "-0.01em",
                }}
              >
                GPilotDashboard
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.7rem" }}
              >
                Trading Terminal
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                aria-label={`Navigate to ${item.label}`}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  bgcolor: isActive
                    ? backgroundColor
                    : "transparent",
                  border: isActive
                    ? borderColor
                    : "1px solid transparent",
                  "&:hover": {
                    bgcolor: isActive
                      ? hoverActiveBgcolor
                      : hoverNotActiveBgcolor
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? "text.primary" : "text.secondary",
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

    </Box>
  );
}
