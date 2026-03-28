"use client";

import { Card, CardContent, Box, Typography, Skeleton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";

interface BalancePoint {
  date: string;
  time?: string; // เพิ่ม ISO String
  balance: number;
}

interface BalanceChartProps {
  readonly loading?: boolean;
  readonly data: readonly BalancePoint[];
  readonly currentBalance: number;
  readonly change: number;
  readonly changePercent: number;
}

export function BalanceChart({
  loading,
  data,
  currentBalance,
  change,
  changePercent,
}: Readonly<BalanceChartProps>) {
  const [period, setPeriod] = useState("ALL");
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (period === "ALL") return data;

    const now = new Date();
    const startDate = new Date();

    if (period === "1W") startDate.setDate(now.getDate() - 7);
    else if (period === "1M") startDate.setMonth(now.getMonth() - 1);
    else if (period === "3M") startDate.setMonth(now.getMonth() - 3);

    return data.filter((d) => {
      const dealDate = d.time ? new Date(d.time) : new Date(d.date);
      return dealDate.getTime() >= startDate.getTime();
    });
  }, [data, period]);

  const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: string | null) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2, borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Balance Velocity
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Balance trend over selected period
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={handlePeriodChange}
              size="small"
              sx={{
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                p: "2px",
                '& .MuiToggleButton-root': {
                  px: 1,
                  py: 0.25,
                  border: 'none',
                  borderRadius: '4px !important',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="1W">1W</ToggleButton>
              <ToggleButton value="1M">1M</ToggleButton>
              <ToggleButton value="3M">3M</ToggleButton>
              <ToggleButton value="ALL">ALL</ToggleButton>
            </ToggleButtonGroup>
            
            <Box sx={{ textAlign: "right", display: { xs: 'none', sm: 'block' } }}>
              <Typography
                sx={{
                  fontFamily: '"Inter", monospace',
                  fontSize: { xs: "1.25rem", lg: "1.5rem" },
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: change >= 0 ? "success.main" : "error.main", fontWeight: 500 }}
              >
                {change >= 0 ? "+" : ""}${Math.abs(change).toLocaleString()} ({changePercent}%)
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ height: { xs: 250, lg: 300 }, width: "100%" }}>
          <LineChart
            xAxis={[
              {
                data: chartData.map((_, i) => i),
                scaleType: "point",
                valueFormatter: (val: number) => chartData[val]?.date || "",
                tickLabelStyle: {
                  fill: theme.palette.text.secondary,
                  fontSize: 10,
                },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: {
                  fill: theme.palette.text.secondary,
                  fontSize: 11,
                },
                valueFormatter: (val: number) => `$${(val / 1000).toFixed(0)}k`,
              },
            ]}
            series={[
              {
                data: chartData.map((d) => d.balance),
                label: "Balance",
                color: theme.palette.primary.main,
                area: true,
                showMark: false,
              },
            ]}
            sx={{
              "& .MuiLineElement-root": {
                strokeWidth: 2,
              },
              "& .MuiAreaElement-root": {
                fillOpacity: 0.2,
              },
              "& .MuiChartsAxis-line": {
                stroke: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(15, 23, 42, 0.1)",
              },
              "& .MuiChartsAxis-tick": {
                stroke: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(15, 23, 42, 0.1)",
              },
              "& .MuiChartsGrid-line": {
                stroke: isDark ? "rgba(148, 163, 184, 0.1)" : "rgba(15, 23, 42, 0.05)",
              },
            }}
            slotProps={{
              legend: { hidden: true } as any,
            }}
            grid={{ horizontal: true }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
