"use client";

import { Card, CardContent, Box, Typography, Grid, Tooltip, IconButton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BalanceIcon from "@mui/icons-material/Balance";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SvgIconComponent } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface MetricItemProps {
  label: string;
  value: string | number;
  color?: string;
  tooltip?: string;
}

function MetricItem({ label, value, color = "text.primary", tooltip, icon: Icon }: MetricItemProps & { icon: SvgIconComponent }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        height: 115,
        display: "flex",
        flexDirection: "column",
        bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${
          isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"
        }`,
        borderRadius: 3,
        boxShadow: isDark
          ? "0 4px 20px -10px rgba(0,0,0,0.5)"
          : "0 4px 20px -10px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, lg: 2.5 },
          flex: 1,
          "&:last-child": { pb: { xs: 2, lg: 2.5 } },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.7rem", lg: "0.8rem" },
                  fontWeight: 500,
                }}
              >
                {label}
              </Typography>
              {tooltip && (
                <Tooltip title={tooltip} arrow>
                  <IconButton
                    size="small"
                    aria-label="More information"
                    sx={{ p: 0, color: "text.disabled" }}
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: color,
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: { xs: "1.1rem", lg: "1.35rem" },
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: color, fontSize: 20 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}


interface RiskMetricsProps {
  readonly winRate?: number;
  readonly recoveryFactor?: number;
  readonly maxDrawdown?: number;
  readonly profitFactor?: number;
  readonly grossProfit?: number;
  readonly grossLoss?: number;
  readonly avgWin?: number;
  readonly avgLoss?: number;
  readonly totalTrades?: number;
  readonly wins?: number;
  readonly loading?: boolean;
}

export function RiskMetrics({ 
  winRate = 0, 
  recoveryFactor = 0, 
  maxDrawdown = 0, 
  profitFactor = 0,
  loading 
}: Readonly<RiskMetricsProps>) {
  const theme = useTheme();

  return (
    <Grid container spacing={{ xs: 2, lg: 2 }}>
       <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
   
        <MetricItem 
          label="Win Rate" 
          value={`${winRate.toFixed(1)}%`} 
          color={theme.palette.success.main}
          icon={TrendingUpIcon}
          tooltip="อัตราการชนะ คำนวณจากเปอร์เซ็นต์ของไม้ที่ปิดแล้วมีกำไรสุทธิเทียบกับจำนวนออเดอร์ทั้งหมด"
        />
      </Grid>
       <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
     
        <MetricItem 
          label="Recovery Factor" 
          value={`${recoveryFactor.toFixed(2)}x`}
          color={theme.palette.primary.main}
          icon={TrackChangesIcon}
          tooltip="Recovery Factor วัดความสามารถในการทำกำไรคืนเมื่อเทียบกับจุดที่ขาดทุนสะสมสูงสุด (กำไรสุทธิ / Max DD Amount) เป็นการวัดความอึดของพอร์ต"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
     
        <MetricItem 
          label="Max DD" 
          value={`${maxDrawdown.toFixed(1)}%`} 
          color={theme.palette.error.main}
          icon={TrendingDownIcon}
          tooltip="Maximum Drawdown คือจุดที่พอร์ตตกลงมามากที่สุดจากจุดสูงสุด (Peak) วัดเป็นเปอร์เซ็นต์ของยอดเงินรวม"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
     
        <MetricItem 
          label="Profit Factor" 
          value={profitFactor.toFixed(2)} 
          color={profitFactor >= 2 ? theme.palette.success.main : profitFactor >= 1.5 ? theme.palette.primary.main : theme.palette.text.primary}
          icon={BalanceIcon}
          tooltip="Profit Factor = กำไรรวม / ขาดทุนรวม (ควรมากกว่า 1.5 สำหรับกลยุทธ์ที่ดี)"
        />
      </Grid>
    </Grid>
  );
}
