"use client";

import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  Avatar, 
  Skeleton 
} from "@mui/material";
import { 
  Person as PersonIcon, 
  CheckCircle as CheckCircleIcon 
} from "@mui/icons-material";
import type { AccountInfo } from "@/shared/types/api";

interface ProfileCardProps {
  readonly account: AccountInfo | null;
  readonly loading: boolean;
}

export function ProfileCard({ account, loading }: Readonly<ProfileCardProps>) {
  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
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
              <Skeleton width={200} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {account?.name ?? "Trader Name"}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} /> Verified Member
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Account ID</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>#{account?.login ?? "-"}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Server</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{account?.server ?? "-"}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Leverage</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>1:{account?.leverage ?? "-"}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: 'block' }}>Currency</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{account?.currency ?? "-"}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
