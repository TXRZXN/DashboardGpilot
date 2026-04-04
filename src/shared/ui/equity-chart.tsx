"use client";

import { Card, CardContent, Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";

interface EquityChartProps {
  readonly data?: { date: string; time?: string; equity: number; balance: number }[];
  readonly loading?: boolean;
  readonly title?: string;
}

export function EquityChart({ data: propData, loading, title = "Account Growth" }: Readonly<EquityChartProps>) {
  const [period, setPeriod] = useState("1Y");
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const chartData = useMemo(() => {
    if (!propData || propData.length === 0) return [];

    const now = new Date();
    const startDate = new Date();

    if (period === "1W") startDate.setDate(now.getDate() - 7);
    else if (period === "1M") startDate.setMonth(now.getMonth() - 1);
    else if (period === "3M") startDate.setMonth(now.getMonth() - 3);
    else if (period === "1Y") startDate.setFullYear(now.getFullYear() - 1);

    return propData.filter((d) => {
      // ใช้ time (ISO) ในการเปรียบเทียบแทน date (Formatted)
      const dealDate = d.time ? new Date(d.time) : new Date(d.date);
      return dealDate.getTime() >= startDate.getTime();
    });
  }, [propData, period]);

  const growthPct = useMemo(() => {
    if (chartData.length < 2) return 0;
    
    // Find first non-zero balance to use as base (avoid division by zero and handle accounts starting from zero)
    const firstNonZero = chartData.find((d) => d.balance > 0);
    if (!firstNonZero) return 0;

    const start = firstNonZero.balance;
    const end = chartData[chartData.length - 1].balance;
    
    return ((end - start) / start) * 100;
  }, [chartData]);

  const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: string | null) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Loading chart data...</Typography>
        </Box>
      );
    }

    if (chartData.length === 0) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>No data available for this period</Typography>
        </Box>
      );
    }

    return (
      <LineChart
        xAxis={[
          {
            data: chartData.map((_, i) => i),
            scaleType: "point",
            valueFormatter: (value) => chartData[value]?.date || "",
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
              fontSize: 10,
            },
            valueFormatter: (value: number) => `$${(value / 1000).toFixed(1)}k`,
          },
        ]}
        series={[
          {
            data: chartData.map((d) => d.balance),
            label: "Balance",
            color: theme.palette.success.main,
            area: true,
            showMark: false,
          },
        ]}
        sx={{
          "& .MuiLineElement-root": {
            strokeWidth: 2,
          },
          "& .MuiAreaElement-root": {
            fillOpacity: 0.15,
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
          // @ts-ignore - MUI charts typing issue
          legend: { hidden: true },
        }}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        grid={{ horizontal: true }}
      />
    );
  };

  return (
    <Card sx={{ height: "100%", overflow: 'hidden' }}>
      <Box
        sx={{
          p: { xs: 2, lg: 3 },
          pb: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Performance trend over selected period
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
                px: 1.5,
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
            <ToggleButton value="1Y">1Y</ToggleButton>
          </ToggleButtonGroup>
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  mt: -1.5,
                }}
              />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: '0.65rem', fontWeight: 600 }}>
                  Balance
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: growthPct >= 0 ? "success.main" : "error.main", 
                    fontSize: '0.65rem', 
                    fontWeight: 700,
                    display: 'block',
                    mt: -0.5
                  }}
                >
                  {growthPct >= 0 ? "+" : ""}{growthPct.toFixed(2)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Box sx={{ height: 350, width: "100%", mt: -1 }}>
          {renderContent()}
        </Box>
      </CardContent>
    </Card>
  );
}
