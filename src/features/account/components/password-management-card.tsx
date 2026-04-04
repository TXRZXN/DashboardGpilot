"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Stack, 
  Divider, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from "@mui/material";
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import { useState } from "react";
import { AuthService } from "@/shared/services/auth-service";

export function PasswordManagementCard() {
  const [webPassword, setWebPassword] = useState("");
  const [mt5Password, setMt5Password] = useState("");
  const [showWebPass, setShowWebPass] = useState(false);
  const [showMt5Pass, setShowMt5Pass] = useState(false);
  const [loading, setLoading] = useState<"web" | "mt5" | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUpdateWebPassword = async () => {
    if (!webPassword) return;
    setLoading("web");
    setStatus(null);
    const result = await AuthService.updatePassword(webPassword);
    setLoading(null);
    if (result.success) {
      setStatus({ type: "success", message: "เปลี่ยนรหัสผ่านเว็บสำเร็จแล้ว" });
      setWebPassword("");
    } else {
      setStatus({ type: "error", message: result.error?.message ?? "เปลี่ยนรหัสผ่านเว็บไม่สำเร็จ" });
    }
  };

  const handleUpdateMt5Password = async () => {
    if (!mt5Password) return;
    setLoading("mt5");
    setStatus(null);
    const result = await AuthService.updateMT5Password(mt5Password);
    setLoading(null);
    if (result.success) {
      setStatus({ type: "success", message: "เปลี่ยนรหัสผ่าน MT5 สำเร็จแล้ว" });
      setMt5Password("");
    } else {
      setStatus({ type: "error", message: result.error?.message ?? "เปลี่ยนรหัสผ่าน MT5 ไม่สำเร็จ" });
    }
  };

  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ความปลอดภัยและการจัดการรหัสผ่าน
          </Typography>
        </Box>

        {status && (
          <Alert 
            severity={status.type} 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setStatus(null)}
          >
            {status.message}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Web Password Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <LockIcon fontSize="small" color="action" /> รหัสผ่านเข้าใช้งานเว็บ (Web Dashboard)
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                size="small"
                type={showWebPass ? "text" : "password"}
                placeholder="ระบุรหัสผ่านใหม่"
                value={webPassword}
                onChange={(e) => setWebPassword(e.target.value)}
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowWebPass(!showWebPass)} edge="end" size="small">
                          {showWebPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      "& input::-ms-reveal, & input::-ms-clear": {
                        display: "none",
                      },
                    },
                  },
                }}
              />
              <Button 
                variant="contained" 
                disableElevation
                onClick={handleUpdateWebPassword}
                disabled={!webPassword || !!loading}
                sx={{ minWidth: 120, borderRadius: 2 }}
              >
                {loading === "web" ? <CircularProgress size={24} color="inherit" /> : "อัปเดต"}
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* MT5 Password Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <VpnKeyIcon fontSize="small" color="action" /> รหัสผ่าน MT5 (Investor Password)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 1.5, display: "block" }}>
              * รหัสผ่านนี้จะถูกเข้ารหัสก่อนส่งขึ้นระบบเพื่อความปลอดภัยสูงสุด
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                size="small"
                type={showMt5Pass ? "text" : "password"}
                placeholder="ระบุรหัสผ่าน MT5 ใหม่"
                value={mt5Password}
                onChange={(e) => setMt5Password(e.target.value)}
                autoComplete="off"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowMt5Pass(!showMt5Pass)} edge="end" size="small">
                          {showMt5Pass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      "& input::-ms-reveal, & input::-ms-clear": {
                        display: "none",
                      },
                    },
                  },
                }}
              />
              <Button 
                variant="outlined" 
                onClick={handleUpdateMt5Password}
                disabled={!mt5Password || !!loading}
                sx={{ minWidth: 120, borderRadius: 2 }}
              >
                {loading === "mt5" ? <CircularProgress size={24} /> : "อัปเดต MT5"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
