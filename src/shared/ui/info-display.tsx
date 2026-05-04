import { Box, Typography, Skeleton, Grid, SxProps, Theme } from "@mui/material";

interface StatBoxProps {
    readonly label: string;
    readonly value: string | number | React.ReactNode;
    readonly loading?: boolean;
    readonly color?: string;
    readonly bgcolor?: string;
    readonly trend?: "up" | "down" | "neutral";
    readonly sx?: SxProps<Theme>;
}

export function StatBox({
    label,
    value,
    loading = false,
    color,
    bgcolor,
    sx,
}: Readonly<StatBoxProps>) {
    return (
        <Box
            sx={{
                p: 2,
                bgcolor: bgcolor || "transparent",
                borderRadius: 3,
                border: bgcolor ? "none" : "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                ...sx,
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    color: color || "text.secondary",
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    fontWeight: 700,
                    color: color || "text.primary",
                }}
            >
                {loading ? <Skeleton width="60%" /> : value}
            </Typography>
        </Box>
    );
}

interface InfoItem {
    readonly label: string;
    readonly value: string | number | React.ReactNode;
}

interface InfoGridProps {
    readonly items: InfoItem[];
    readonly loading?: boolean;
    readonly columns?: { xs?: number; sm?: number; md?: number; lg?: number };
    readonly sx?: SxProps<Theme>;
}


export function InfoGrid({ items, loading = false, columns = { xs: 6 }, sx }: Readonly<InfoGridProps>) {
    return (
        <Grid container spacing={2} sx={sx}>
            {items.map((item, index) => (
                <Grid key={`${item.label}-${index}`} size={columns}>
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", mb: 0.5, display: "block" }}
                        >
                            {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading ? <Skeleton width="80%" /> : item.value}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
}
