"use client";

import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  IconButton, 
  InputAdornment,
  Link,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon
} from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock successful login
    router.push("/dashboard");
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
        backgroundImage: "radial-gradient(circle at 98% 10%, rgba(34, 211, 238, 0.05) 0%, transparent 40%), radial-gradient(circle at 2% 90%, rgba(8, 145, 178, 0.05) 0%, transparent 40%)"
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", borderRadius: 6, boxShadow: "0 20px 50px rgba(0,0,0,0.1)", overflow: 'visible' }}>
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
              <LoginIcon sx={{ color: "primary.main", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Manrope' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Access your GPilot Dashboard
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email Address"
                placeholder="name@company.com"
                type="email"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
              <TextField
                fullWidth
                label="Password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Remember me</Typography>}
                />
                <Link href="#" underline="hover" sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'primary.main' }}>
                  Forgot password?
                </Link>
              </Box>

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{ 
                  borderRadius: 3, 
                  py: 1.5, 
                  fontWeight: 700, 
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(34, 211, 238, 0.3)",
                  mt: 1
                }}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Don't have an account?{" "}
              <Link 
                href="/register" 
                underline="hover" 
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
