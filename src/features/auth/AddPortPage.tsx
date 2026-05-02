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
} from "@mui/material";
import { 
  Email as EmailIcon, 
  ArrowForward as ArrowForwardIcon,
  Numbers as NumbersIcon,
  VpnKey as VpnKeyIcon,
  Dashboard as DashboardIcon,
  PostAdd as PostAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from "@mui/icons-material";
import { AuthService } from "@/shared/services/auth-service";
import { useAuth } from "@/shared/providers/auth-provider";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function AddPortContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [showInvestorPassword, setShowInvestorPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [mt5Id, setMt5Id] = useState("");
  const [investorPassword, setInvestorPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error?.message || "เพิ่มพอร์ตให้สมาชิกไม่สำเร็จ");
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
              <PostAddIcon sx={{ color: "primary.main", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Manrope' }}>
              Add Member Port
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Add a new MT5 port for your member
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Stack spacing={3}>
              <Alert severity="success" sx={{ borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>เพิ่มพอร์ตให้สมาชิกสำเร็จ!</Typography>
                <Typography variant="body2">
                  พอร์ต MT5 ID: <strong>{mt5Id}</strong> ของสมาชิก (Email: {email}) ได้ถูกเพิ่มเข้าสู่ระบบเรียบร้อยแล้ว
                </Typography>
              </Alert>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => router.push("/dashboard")}
                startIcon={<DashboardIcon />}
                sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
              >
                กลับหน้า Dashboard
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Member Email Address"
                  placeholder="member@example.com"
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
                  {isLoading ? "Adding Port..." : "Add Member Port"}
                </Button>
                
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => router.back()}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Cancel
                </Button>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export function AddPortPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography>Loading...</Typography></Box>}>
      <AddPortContent />
    </Suspense>
  );
}
