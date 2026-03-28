"use client";

import { Card, CardContent, Box, Typography, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTheme } from "@mui/material/styles";

interface MarginGaugeProps {
  readonly value?: number;
  readonly max?: number;
  readonly loading?: boolean;
}

export function MarginGauge({ value = 0, max = 100, loading }: Readonly<MarginGaugeProps>) {
  const theme = useTheme();
  
  // ป้องกันค่าติดลบหรือเกิน 100
  const safeValue = Math.max(0, Math.min(max, value));
  const percentage = max > 0 ? (safeValue / max) * 100 : 0;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  const getHealthStatus = (pct: number) => {
    if (pct >= 80) return { label: "Excellent", color: theme.palette.success.main };
    if (pct >= 60) return { label: "Good", color: theme.palette.primary.main };
    if (pct >= 40) return { label: "Moderate", color: theme.palette.warning.main };
    return { label: "Weak", color: theme.palette.error.main };
  };

  const health = getHealthStatus(percentage);

  const healthLevels = [
    { range: "0-40%", color: theme.palette.error.main, label: "Weak" },
    { range: "40-60%", color: theme.palette.warning.main, label: "Mod" },
    { range: "60-80%", color: theme.palette.primary.main, label: "Good" },
    { range: "80-100%", color: theme.palette.success.main, label: "Exc" },
  ];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              Portfolio Health Index
            </Typography>
            <Tooltip title="ดัชนีชี้วัดสุขภาพพอร์ตองค์รวม คำนวณถ่วงน้ำหนักจาก Win Rate (40%), Profit Factor (40%) และ Drawdown Control (20%)" arrow>
              <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Overall performance and viability score
          </Typography>
        </Box>

        <Box 
          sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          role="progressbar"
          aria-valuenow={Math.round(value)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Portfolio Health Score Index"
        >
          <Box sx={{ position: "relative", width: 192, height: 144 }}>
            <svg width="100%" height="100%" viewBox="0 0 160 100">
              <path
                d="M 20 90 A 70 70 0 0 1 140 90"
                fill="none"
                stroke={theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.15)" : "rgba(15, 23, 42, 0.08)"}
                strokeWidth="12"
                strokeLinecap="round"
              />
              {!loading && (
                <path
                  d="M 20 90 A 70 70 0 0 1 140 90"
                  fill="none"
                  stroke={health.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference * 0.75}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              )}
              <text
                x="80"
                y="70"
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontFamily="Inter, monospace"
                fontSize="24"
                fontWeight="700"
              >
                {loading ? "..." : `${value.toFixed(0)}`}
              </text>
              <text
                x="80"
                y="90"
                textAnchor="middle"
                fill={loading ? theme.palette.text.secondary : health.color}
                fontFamily="Inter, sans-serif"
                fontSize="11"
                fontWeight="600"
              >
                {loading ? "Calculating..." : health.label}
              </text>
            </svg>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              width: "100%",
              mt: 2,
              textAlign: "center",
            }}
          >
            {healthLevels.map((level) => (
              <Box key={level.range}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: level.color,
                    mx: "auto",
                    mb: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6rem", display: 'block' }}>
                  {level.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.55rem" }}>
                  {level.range}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
