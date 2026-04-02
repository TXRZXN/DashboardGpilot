"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Avatar,
  CircularProgress
} from "@mui/material";
import { 
  Sync as SyncIcon, 
  ErrorOutline as ErrorIcon, 
  CheckCircleOutline as SuccessIcon,
  People as PeopleIcon
} from "@mui/icons-material";
import { useState } from "react";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { createLogger } from "@/shared/utils/logger";

const logger = createLogger("ReferralSyncCard");

export function ReferralSyncCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    successCount: number; 
    failedUsers: { email: string; error: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSyncReferrals = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await TradeHistoryService.syncReferralTrades();
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message ?? "ไม่สามารถเริ่มต้นการซิงค์ได้");
      }
    } catch (e) {
      logger.error("Sync referral error", e instanceof Error ? e : String(e));
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PeopleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ระบบซิงค์ข้อมูลเพื่อน (Referral Sync)
            </Typography>
          </Stack>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            onClick={handleSyncReferrals}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "กำลังซิงค์..." : "ซิงค์ด่วน"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          ระบบจะทำการซิงค์ข้อมูลการเทรด (Profit Sharing) ประจำสัปดาห์โดยอัตโนมัติทุกวันอังคาร 
          คุณสามารถกดปุ่ม "ซิงค์ด่วน" เพื่อปรับปรุงข้อมูลล่าสุดได้ทันที
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        )}

        {result && (
          <Box>
            <Alert 
              severity={result.failedUsers.length > 0 ? "warning" : "success"}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              ซิงค์สำเร็จ {result.successCount} รายการ 
              {result.failedUsers.length > 0 && ` (ล้มเหลว ${result.failedUsers.length} รายการ)`}
            </Alert>

            {result.failedUsers.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: "error.main", display: "flex", alignItems: "center", gap: 1 }}>
                  <ErrorIcon fontSize="small" /> รายการที่ซิงค์ไม่สำเร็จ (Sync Failed)
                </Typography>
                <List sx={{ bgcolor: "background.default", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  {result.failedUsers.map((user, index) => (
                    <ListItem key={user.email} divider={index < result.failedUsers.length - 1}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "error.light" }}>
                          <Typography variant="caption">{user.email[0].toUpperCase()}</Typography>
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={user.email} 
                        secondary={user.error} 
                        primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: "caption", color: "error.main" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {result.successCount > 0 && result.failedUsers.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main', mt: 2 }}>
                    <SuccessIcon fontSize="small" />
                    <Typography variant="caption">การซิงค์ข้อมูลทั้งหมดเสร็จสมบูรณ์</Typography>
                </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
