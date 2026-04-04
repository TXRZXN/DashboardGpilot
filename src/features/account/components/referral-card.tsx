"use client";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    TextField,
    InputAdornment,
    Tooltip,
    IconButton,
    Stack,
    Button,
} from "@mui/material";
import { ContentCopy as ContentCopyIcon, Public as PublicIcon } from "@mui/icons-material";

interface ReferralCardProps {
    readonly referralUrl: string;
    readonly onCopy: () => void;
}

export function ReferralCard({ referralUrl, onCopy }: Readonly<ReferralCardProps>) {
    return (
        <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: "rgba(16, 185, 129, 0.1)", mx: "auto", mb: 2 }}>
                        <PublicIcon sx={{ fontSize: 32, color: "success.main" }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Referral Program
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                        Share your link and earn commissions for every new trader you refer.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", mb: 1, display: "block", fontWeight: 600 }}
                    >
                        YOUR REFERRAL LINK
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={referralUrl}
                        slotProps={{
                            input: {
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Copy to clipboard">
                                            <IconButton onClick={onCopy} edge="end" color="primary">
                                                <ContentCopyIcon sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3, bgcolor: "rgba(148, 163, 184, 0.03)", fontSize: "0.875rem" },
                            },
                        }}
                    />
                </Box>

                <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}>1</Avatar>
                        <Typography variant="body2">Copy and share your unique referral link.</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}>2</Avatar>
                        <Typography variant="body2">Friends register using your link.</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}>3</Avatar>
                        <Typography variant="body2">Receive rewards directly to your account.</Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
