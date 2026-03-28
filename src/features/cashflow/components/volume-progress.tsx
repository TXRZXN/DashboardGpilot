"use client";

import { Card, CardContent, Box, Typography, LinearProgress, CircularProgress, Skeleton, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface VolumeProgressProps {
  readonly currentVolume: number;
  readonly targetVolume: number;
  readonly tradeCount: number;
  readonly loading?: boolean;
}

export function VolumeProgress({ currentVolume, targetVolume, tradeCount, loading }: Readonly<VolumeProgressProps>) {
  const percentage = targetVolume > 0 ? Math.min(100, Math.round((currentVolume / targetVolume) * 100)) : 0;
  const tradeGoal = 500; // สมมติเป้าหมายจำนวนเทรด
  const tradePercentage = Math.min(100, Math.round((tradeCount / tradeGoal) * 100));
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Volume Quotient
              </Typography>
              <Tooltip title="อัตราส่วนความเข้มข้นของการเทรด วัดจากปริมาณ Lot รวมเทียบกับเป้าหมายตามสัดส่วน Equity" arrow>
                <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
                  <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Trading activity vs equity-based goal
            </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 4, position: "relative" }}>
          {loading ? (
            <Skeleton variant="circular" width={140} height={140} />
          ) : (
            <>
              <CircularProgress
                variant="determinate"
                value={100}
                size={140}
                thickness={4}
                sx={{ color: (theme) => theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.1)" : "rgba(15, 23, 42, 0.05)" }}
              />
              <CircularProgress
                variant="determinate"
                value={percentage}
                size={140}
                thickness={4}
                sx={{
                  color: "primary.main",
                  position: "absolute",
                  left: 0,
                  strokeLinecap: "round",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {percentage}%
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  of goal
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {loading ? (
            <>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="100%" />
            </>
          ) : (
            <>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Standard Lots
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {currentVolume.toFixed(1)} / {targetVolume}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.1)" : "rgba(15, 23, 42, 0.05)",
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Trade Count
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {tradeCount} / {tradeGoal}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={tradePercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(148, 163, 184, 0.1)" : "rgba(15, 23, 42, 0.05)",
                    "& .MuiLinearProgress-bar": { bgcolor: "success.main" },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
