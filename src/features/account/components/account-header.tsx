"use client";

import { Box, Typography } from "@mui/material";
import { AccountCircle as AccountCircleIcon } from "@mui/icons-material";
import { SectionHeader } from "@/shared/ui";

interface AccountHeaderProps {
    readonly onRefresh: () => void;
    readonly loading: boolean;
}

export function AccountHeader({ onRefresh, loading }: Readonly<AccountHeaderProps>) {
    return (
        <SectionHeader
            title="Account & Profile"
            icon={<AccountCircleIcon sx={{ fontSize: 28 }} />}
            onRefresh={onRefresh}
            loading={loading}
            actions={
                <Typography variant="body2" sx={{ color: "text.secondary", mr: 2, display: { xs: 'none', sm: 'block' } }}>
                    Manage your account settings and summaries
                </Typography>
            }
        />
    );
}
