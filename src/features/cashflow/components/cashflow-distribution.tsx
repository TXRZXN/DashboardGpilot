"use client";

import { Card, CardContent, Box, Typography, Skeleton, useTheme } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CashflowDistributionProps {
  readonly deposits: number;
  readonly withdrawals: number;
  readonly loading?: boolean;
}

export function CashflowDistribution({ deposits, withdrawals, loading }: Readonly<CashflowDistributionProps>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const data = [
    { name: "Deposits", value: deposits, color: "#10B981" },
    { name: "Withdrawals", value: withdrawals, color: "#EF4444" },
  ];

  // Filter out zero values to avoid chart issues
  const chartData = data.filter(d => d.value > 0);

  if (loading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Skeleton variant="circular" width={160} height={160} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const total = deposits + withdrawals;
  const depositPercent = total > 0 ? Math.round((deposits / total) * 100) : 0;
  const withdrawalPercent = total > 0 ? Math.round((withdrawals / total) * 100) : 0;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Cashflow Distribution
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Ratio of deposits vs withdrawals
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? "#1E293B" : "#FFF",
                    borderColor: theme.palette.divider,
                    borderRadius: "8px",
                    color: theme.palette.text.primary
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                  formatter={(value: any) => `$${Number(value || 0).toLocaleString()}`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No transaction data available</Typography>
          )}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Deposits</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main" }}>{depositPercent}%</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: 'block' }}>Withdrawals</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "error.main" }}>{withdrawalPercent}%</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
