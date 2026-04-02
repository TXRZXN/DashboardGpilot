"use client";

import { Card, CardContent, Box, Typography, Paper } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

import type { Deal } from "@/shared/types/api";

interface ExecutionLogProps {
  readonly deals?: readonly Deal[];
  readonly loading?: boolean;
}

export function ExecutionLog({ deals: propDeals, loading }: Readonly<ExecutionLogProps>) {
  const recentTrades = (Array.isArray(propDeals) ? propDeals : [])
    .filter(d => d.type !== 'BALANCE')
    .slice(0, 5) // Show latest 5
    .map(deal => ({
      id: deal.ticket,
      symbol: deal.symbol,
      type: deal.type,
      lots: deal.volume,
      profit: deal.profit,
      time: new Date(deal.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));
  const renderLogs = () => {
    if (loading) {
      return (
        <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
          Loading executions...
        </Typography>
      );
    }

    if (recentTrades.length === 0) {
      return (
        <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
          No recent executions
        </Typography>
      );
    }

    return recentTrades.map((trade) => (
      <Paper
        key={trade.id}
        sx={{
          p: 1.5,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(148, 163, 184, 0.05)"
              : "rgba(15, 23, 42, 0.02)",
          border: (theme) =>
            theme.palette.mode === "dark"
              ? "1px solid rgba(148, 163, 184, 0.08)"
              : "1px solid rgba(15, 23, 42, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor:
                trade.type === "BUY"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {trade.type === "BUY" ? (
              <TrendingUpIcon sx={{ fontSize: 18, color: "success.main" }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 18, color: "error.main" }} />
            )}
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: '"Inter", monospace',
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              {trade.symbol}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {trade.lots} lots
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontFamily: '"Inter", monospace',
              fontSize: "0.875rem",
              fontWeight: 500,
              color: trade.profit > 0 ? "success.main" : "error.main",
            }}
          >
            {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Inter", monospace',
              color: "text.secondary",
            }}
          >
            {trade.time}
          </Typography>
        </Box>
      </Paper>
    ));
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Recent Executions
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Latest trade activity
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {renderLogs()}
        </Box>
      </CardContent>
    </Card>
  );
}
