"use client";

import { Card, CardContent, CardActionArea, Box, Typography, Skeleton } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocalMallIcon from "@mui/icons-material/LocalMall";

interface ProductCardProps {
    title: string;
    avgMonthProfit: number;
    percentDD: number;
    initials?: string;
    loading?: boolean;
    onClick: () => void;
    formatCurrency: (val: number) => string;
}

export function ProductCard({
    title,
    avgMonthProfit,
    percentDD,
    initials,
    loading,
    onClick,
    formatCurrency,
}: ProductCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)" }} />
        );
    }

    return (
        <Card
            sx={{
                minHeight: 160,
                display: "flex",
                bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(16px) saturate(180%)",
                border: (theme) =>
                    `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    transform: "translateY(-8px) scale(1.01)",
                    zIndex: 1,
                    boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                            ? "0 30px 60px -15px rgba(34, 211, 238, 0.4), 0 0 25px rgba(34, 211, 238, 0.2), inset 0 0 15px rgba(34, 211, 238, 0.15)"
                            : "0 20px 50px rgba(8, 145, 178, 0.2), 0 0 25px rgba(8, 145, 178, 0.15)",
                    borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(34, 211, 238, 0.6)" : "rgba(8, 145, 178, 0.6)",
                    bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(34, 211, 238, 0.05)" : "rgba(8, 145, 178, 0.03)",
                    "& .metric-value": {
                        color: "primary.main",
                        textShadow: "0 0 15px rgba(34, 211, 238, 0.6)",
                    },
                },
                alignItems: "center",
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    p: 3,
                    m: 0,
                    "& .MuiCardActionArea-focusHighlight": {
                        bgcolor: "transparent",
                    },
                }}
            >
                <Box
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 3.5,
                        width: "100%",
                    }}
                >
                    {/* Avatar Section */}
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)",
                            boxShadow: "0 8px 16px -4px rgba(34, 211, 238, 0.4)",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "1.4rem",
                            fontFamily: "var(--font-manrope)",
                            flexShrink: 0,
                            border: "2px solid rgba(255,255,255,0.3)",
                        }}
                    >
                        {initials ? initials : getInitials(title)}
                    </Box>

                    {/* Info Section */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                color: "text.primary",
                                fontFamily: "var(--font-manrope)",
                                fontWeight: 800,
                                fontSize: "1.3rem",
                                letterSpacing: "-0.02em",
                                mb: 0.5,
                            }}
                        >
                            {title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    fontSize: "0.65rem",
                                }}
                            >
                                DD %
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "error.main",
                                    fontWeight: 700,
                                    fontFamily: "var(--font-inter)",
                                    fontSize: "0.9rem",
                                }}
                            >
                                {percentDD.toFixed(2)}%
                            </Typography>
                        </Box>
                    </Box>

                    {/* Metric Section */}
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                color: "text.secondary",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                fontSize: "0.75rem",
                                mb: 0.75,
                                textAlign: "right",
                            }}
                        >
                            AVG MONTH PROFIT
                        </Typography>
                        <Typography
                            className="metric-value"
                            variant="h4"
                            sx={{
                                color: "text.primary",
                                fontWeight: 850,
                                fontFamily: "var(--font-inter)",
                                fontSize: "2.1rem",
                                transition: "all 0.3s ease",
                                textAlign: "right",
                                lineHeight: 1,
                            }}
                        >
                            {formatCurrency(avgMonthProfit).replace("$", "").replace("฿", "").trim()}%
                        </Typography>
                    </Box>
                </Box>
            </CardActionArea>
        </Card>
    );
}
