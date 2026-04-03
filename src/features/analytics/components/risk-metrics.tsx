"use client";

import { Card, CardContent, Box, Typography, Grid, Tooltip, IconButton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BalanceIcon from "@mui/icons-material/Balance";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SvgIconComponent } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface MetricData {
  label: string;
  value: string;
  description: string;
  icon: SvgIconComponent;
  colorKey: "success" | "primary" | "error";
  bgColor: string;
  formula: string;
}

interface MetricItemProps {
  label: string;
  value: string | number;
  color?: string;
  tooltip?: string;
}

function MetricItem({ label, value, color = "text.primary", tooltip, icon: Icon }: MetricItemProps & { icon: SvgIconComponent }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 8px 24px -12px rgba(0,0,0,0.5)' : '0 8px 24px -12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <IconButton 
                size="small" 
                aria-label="More information"
                sx={{ p: 0, color: "text.disabled", mt: -0.5, mr: -0.5 }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        
        <Typography variant="h5" sx={{ color: color, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
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
  grossProfit = 0,
  grossLoss = 0,
  avgWin = 0,
  avgLoss = 0,
  totalTrades = 0, 
  wins = 0,
  loading 
}: Readonly<RiskMetricsProps>) {
  const theme = useTheme();

  return (
    <Grid container spacing={{ xs: 2, lg: 3 }}>
      <Grid size={{ xs: 6 }}>
        <MetricItem 
          label="Win Rate" 
          value={`${winRate.toFixed(1)}%`} 
          color={theme.palette.success.main}
          icon={TrendingUpIcon}
          tooltip="อัตราการชนะ คำนวณจากเปอร์เซ็นต์ของไม้ที่ปิดแล้วมีกำไรสุทธิเทียบกับจำนวนออเดอร์ทั้งหมด"
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <MetricItem 
          label="Recovery Factor" 
          value={`${recoveryFactor.toFixed(2)}x`}
          color={theme.palette.primary.main}
          icon={TrackChangesIcon}
          tooltip="Recovery Factor วัดความสามารถในการทำกำไรคืนเมื่อเทียบกับจุดที่ขาดทุนสะสมสูงสุด (กำไรสุทธิ / Max DD Amount) เป็นการวัดความอึดของพอร์ต"
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <MetricItem 
          label="Max DD" 
          value={`${maxDrawdown.toFixed(1)}%`} 
          color={theme.palette.error.main}
          icon={TrendingDownIcon}
          tooltip="Maximum Drawdown คือจุดที่พอร์ตตกลงมามากที่สุดจากจุดสูงสุด (Peak) วัดเป็นเปอร์เซ็นต์ของยอดเงินรวม"
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
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
