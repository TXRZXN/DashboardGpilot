"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  Avatar, 
  Skeleton,
  SxProps,
  Theme 
} from "@mui/material";
import { 
  Person as PersonIcon, 
  CheckCircle as CheckCircleIcon 
} from "@mui/icons-material";
import { InfoGrid } from "@/shared/ui";

interface ProfileCardProps {
  readonly name: string;
  readonly login: number;
  readonly server: string;
  readonly leverage: number;
  readonly currency: string;
  readonly loading: boolean;
  readonly sx?: SxProps<Theme>;
}

export function ProfileCard({ 
  name, 
  login, 
  server, 
  leverage, 
  currency, 
  loading,
  sx
}: Readonly<ProfileCardProps>) {
  const profileItems = [
    { label: "Account ID", value: `#${login || "-"}` },
    { label: "Server", value: server || "-" },
    { label: "Leverage", value: `1:${leverage || "-"}` },
    { label: "Currency", value: currency || "-" },
  ];

  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative', ...sx }}>
      <Box sx={{ height: 100, bgcolor: 'primary.main', opacity: 0.1, position: 'absolute', top: 0, left: 0, right: 0 }} />
      <CardContent sx={{ pt: 6, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'background.paper', 
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: 3
            }}
          >
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Avatar>
          <Box sx={{ mb: 1 }}>
            {loading ? (
              <Skeleton width={160} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {name || "Trader Name"}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} /> Verified Member
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <InfoGrid 
          items={profileItems} 
          loading={loading} 
          columns={{ xs: 6 }} 
        />
      </CardContent>
    </Card>
  );
}
