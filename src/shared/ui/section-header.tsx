"use client";

import { Box, Typography, IconButton, CircularProgress, SxProps, Theme } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

interface SectionHeaderProps {
    readonly title: string;
    readonly onRefresh?: () => void;
    readonly loading?: boolean;
    readonly icon?: React.ReactNode;
    readonly actions?: React.ReactNode;
    readonly sx?: SxProps<Theme>;
}

export function SectionHeader({
    title,
    onRefresh,
    loading = false,
    icon,
    actions,
    sx,
}: Readonly<SectionHeaderProps>) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                ...sx,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {icon && <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>}
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {actions}
                {onRefresh && (
                    <IconButton
                        onClick={onRefresh}
                        disabled={loading}
                        sx={{
                            bgcolor: "background.paper",
                            boxShadow: 1,
                            "&:hover": { bgcolor: "action.hover" },
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <RefreshIcon fontSize="small" />
                        )}
                    </IconButton>
                )}
            </Box>
        </Box>
    );
}
