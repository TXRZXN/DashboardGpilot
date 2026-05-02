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
  Divider,
  Link
} from "@mui/material";
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowForwardIcon,
  Numbers as NumbersIcon,
  VpnKey as VpnKeyIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { AuthService } from "@/shared/services/auth-service";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showInvestorPassword, setShowInvestorPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [mt5Id, setMt5Id] = useState("");
  const [investorPassword, setInvestorPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email: string; defaultPassword?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await AuthService.register({
        email,
        mt5Id: Number(mt5Id),
        mt5_password_plain: investorPassword
      });

      if (res.success && res.data) {
        setSuccessData({
          email: res.data.email,
          defaultPassword: res.data.defaultPassword
        });
      } else {
        setError(res.error?.message || "ลงทะเบียนไม่สำเร็จ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
        backgroundImage: "radial-gradient(circle at 2% 10%, rgba(34, 211, 238, 0.05) 0%, transparent 40%), radial-gradient(circle at 98% 90%, rgba(8, 145, 178, 0.05) 0%, transparent 40%)"
      }}
    >
      <Card sx={{ maxWidth: 450, width: "100%", borderRadius: 6, boxShadow: "0 20px 50px rgba(0,0,0,0.1)", overflow: 'visible' }}>
        <Box sx={{ position: 'relative', height: 8, bgcolor: 'primary.main', borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box 
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: 3, 
                bgcolor: "rgba(34, 211, 238, 0.1)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                mx: "auto",
                mb: 2
              }}
            >
              <PersonIcon sx={{ color: "primary.main", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Manrope' }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Join GPilot Product today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email Address"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }
                }}
              />

              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>MT5 ACCOUNT</Typography>
              </Divider>

              <TextField
                fullWidth
                label="MT5 ID"
                placeholder="e.g. 12345678"
                value={mt5Id}
                onChange={(e) => setMt5Id(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <NumbersIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Investor's Password"
                placeholder="MT5 Investor Password"
                type={showInvestorPassword ? "text" : "password"}
                value={investorPassword}
                onChange={(e) => setInvestorPassword(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowInvestorPassword(!showInvestorPassword)} edge="end">
                          {showInvestorPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }
                }}
              />
              {successData ? (
                <Stack spacing={3}>
                  <Alert severity="success" sx={{ borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>ลงทะเบียนสำเร็จ!</Typography>
                    <Typography variant="body2">
                      อีเมล: {successData.email}<br />
                      รหัสผ่านเริ่มต้น: <strong>{successData.defaultPassword || "P@ssw0rd-1"}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      *โปรดบันทึกรหัสผ่านนี้ไว้เพื่อเข้าสู่ระบบครั้งแรก
                    </Typography>
                  </Alert>
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    onClick={() => router.push("/login")}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                  >
                    ไปหน้า Login
                  </Button>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={() => router.push("/dashboard")}
                    startIcon={<DashboardIcon />}
                    sx={{ 
                      borderRadius: 3, 
                      fontWeight: 700,
                      textTransform: 'none'
                    }}
                  >
                    กลับหน้า Dashboard
                  </Button>
                </Stack>
              ) : (
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5, 
                    fontWeight: 700, 
                    textTransform: "none",
                    boxShadow: "0 8px 20px rgba(34, 211, 238, 0.3)",
                    mt: 1
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
              )}
            </Stack>
          </form>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Already have an account?{" "}
              <Link 
                href="/login" 
                underline="hover" 
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export function RegisterPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography>Loading...</Typography></Box>}>
      <RegisterContent />
    </Suspense>
  );
}
