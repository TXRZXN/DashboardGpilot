"use client";

import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Alert,
  IconButton, 
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon
} from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/shared/services/auth-service";

/**
 * หน้า Change Password สำหรับกรณีบังคับเปลี่ยนรหัสผ่านครั้งแรก
 * ปฏิบัติตาม UI/UX Design Standards (Premium Look)
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบความถูกต้องเบื้องต้น
    if (password.length < 8) {
      setStatus({ type: "error", message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      // เรียกใช้ AuthService เพื่ออัปเดตรหัสผ่าน
      // ฟังก์ชันนี้จะทำการ Reset flag requirePasswordChange ใน Backend ด้วย
      const res = await AuthService.updatePassword(password);
      
      if (res.success) {
        setStatus({ type: "success", message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว กำลังนำท่านไปยัง Dashboard..." });
        
        // รอ 1.5 วินาทีเพื่อให้ผู้ใช้เห็นข้อความแจ้งเตือน ก่อนนำทางไปยัง Dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setStatus({ type: "error", message: res.error?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
        backgroundImage: "radial-gradient(circle at 98% 10%, rgba(237, 108, 2, 0.05) 0%, transparent 40%), radial-gradient(circle at 2% 90%, rgba(237, 108, 2, 0.05) 0%, transparent 40%)"
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 450, 
          width: "100%", 
          borderRadius: 6, 
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            height: 8, 
            bgcolor: 'warning.main', 
            backgroundImage: 'linear-gradient(90deg, #ed6c02, #ff9800)' 
          }} 
        />
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: 4, 
                bgcolor: "rgba(237, 108, 2, 0.1)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                mx: "auto",
                mb: 2.5
              }}
            >
              <SecurityIcon sx={{ color: "warning.main", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Manrope', mb: 1 }}>
              ตั้งรหัสผ่านใหม่
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              กรุณากำหนดรหัสผ่านส่วนตัวของคุณเพื่อเริ่มใช้งาน GPilot
            </Typography>
          </Box>

          {status && (
            <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
              {status.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="รหัสผ่านใหม่"
                placeholder="ระบุรหัสผ่านอย่างน้อย 8 ตัวอักษร"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)} 
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />

              <TextField
                fullWidth
                label="ยืนยันรหัสผ่านใหม่"
                placeholder="ระบุรหัสผ่านเดิมอีกครั้ง"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  borderRadius: 3, 
                  py: 1.8, 
                  fontWeight: 700, 
                  fontSize: '1rem',
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(237, 108, 2, 0.3)",
                  bgcolor: 'warning.main',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                    boxShadow: "0 12px 25px rgba(237, 108, 2, 0.4)",
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(237, 108, 2, 0.3)',
                    color: 'white'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={26} color="inherit" /> : "บันทึกรหัสผ่านและเข้าสู่ระบบ"}
              </Button>
            </Stack>
          </form>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
             <Typography variant="caption" sx={{ color: 'text.disabled' }}>
               ระบบรักษาความปลอดภัยแบบ AES-256-GCM Encryption
             </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
