"use client";

import { Card, CardContent, Box, Typography } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly change?: string;
  readonly changeType?: "positive" | "negative" | "neutral";
  readonly icon: SvgIconComponent;
  readonly iconColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "#22D3EE",
}: Readonly<MetricCardProps>) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "success.main";
      case "negative":
        return "error.main";
      default:
        return "text.secondary";
    }
  };

  return (
    <Card
      sx={{
        height: 115,
        display: "flex",
        flexDirection: "column",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: (theme) =>
          `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.05)"
          }`,
        borderRadius: 3,
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
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

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.7rem", lg: "0.8rem" },
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.primary",
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: { xs: "1.1rem", lg: "1.35rem" },
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            {change && (
              <Typography
                variant="caption"
                sx={{
                  color: getChangeColor(),
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  display: "block",
                  mt: 0.5,
                }}
              >
                {change}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(148, 163, 184, 0.1)"
                  : "rgba(15, 23, 42, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: iconColor, fontSize: 20 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
