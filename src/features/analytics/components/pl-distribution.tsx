"use client";

import { Card, CardContent, Box, Typography, Tooltip, IconButton } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface PLData {
  range: string;
  count: number;
}

interface PLDistributionProps {
  readonly data?: PLData[];
  readonly loading?: boolean;
}

export function PLDistribution({ data: propData, loading }: Readonly<PLDistributionProps>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const data = propData || [];

  const renderChart = () => {
    if (loading) {
      return (
        <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", display: "block", py: 4 }}>
          Loading distribution data...
        </Typography>
      );
    }

    if (data.length === 0) {
      return (
        <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", display: "block", py: 4 }}>
          No distribution data
        </Typography>
      );
    }

    return (
      <BarChart
        xAxis={[
          {
            data: data.map((d) => d.range),
            scaleType: "band",
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
          },
        ]}
        series={[
          {
            data: data.map((d) => d.count),
            label: "Trades",
            color: theme.palette.success.main,
          },
        ]}
        sx={{
          "& .MuiBarElement-root": {
            rx: 4,
          },
          "& .MuiChartsAxis-line": {
            stroke: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(15, 23, 42, 0.1)",
          },
          "& .MuiChartsAxis-tick": {
            stroke: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(15, 23, 42, 0.1)",
          },
        }}
        slotProps={{
          // @ts-ignore - MUI charts typing issue
          legend: { hidden: true },
        }}
      />
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              P/L Distribution
            </Typography>
            <Tooltip title="กราฟการกระจายตัวของกำไร/ขาดทุน (Histogram) แสดงให้เห็นว่าไม้ส่วนใหญ่ของคุณกำไรหรือขาดทุนอยู่ในช่วงราคาใด" arrow>
              <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Frequency of trade outcome ranges
          </Typography>
        </Box>
        <Box sx={{ height: { xs: 200, lg: 250 }, width: "100%" }}>
          {renderChart()}
        </Box>
      </CardContent>
    </Card>
  );
}
