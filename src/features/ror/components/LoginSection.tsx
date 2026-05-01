import React, { useState } from "react";
import { 
    Box, 
    Typography, 
    Grid, 
    TextField, 
    InputAdornment, 
    IconButton, 
    alpha,
    CircularProgress
} from "@mui/material";
import { 
    Email as EmailIcon, 
    Lock as LockIcon, 
    Visibility as VisibilityIcon, 
    VisibilityOff as VisibilityOffIcon 
} from "@mui/icons-material";
import { GlassPaper, ActionButton } from "./StyledComponents";

interface LoginSectionProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onVerify2fa: (code: string) => Promise<void>;
    onVerify2faSms?: (code: string) => Promise<void>;
    isLoading?: boolean;
    workflow: string | null;
    onSelectWorkflow?: (workflow: string) => void;
    tfaProviders?: any[];
    error: string | null;
    onClearError: () => void;
}

export const LoginSection: React.FC<LoginSectionProps> = ({ 
    onLogin, 
    onVerify2fa, 
    onVerify2faSms,
    isLoading, 
    workflow,
    onSelectWorkflow,
    tfaProviders,
    error,
    onClearError
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            await onLogin(email, password);
        }
    };

    const handle2faSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (twoFactorCode.length === 6) {
            if (workflow === "2fa_sms_auth" && onVerify2faSms) {
                await onVerify2faSms(twoFactorCode);
            } else {
                await onVerify2fa(twoFactorCode);
            }
        }
    };

    const is2fa = workflow === "2fa_google_auth" || workflow === "2fa_sms_auth" || workflow === "2fa";
    const isSms = workflow === "2fa_sms_auth";
    const isMultiChoice = workflow === "2fa";

    return (
        <Grid size={{ xs: 12, md: 4 }}>
            <Box textAlign="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {is2fa ? "SECURITY" : "LOGIN"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>
                    {is2fa ? "(2FA VERIFICATION)" : "(AUTHENTICATE)"}
                </Typography>
            </Box>
            <GlassPaper
                sx={{
                    p: 4,
                    height: "400px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {!is2fa ? (
                    <form onSubmit={handleSubmit}>
                        <Typography
                            variant="h5"
                            sx={{ textAlign: "center", fontWeight: 800, mb: 4, color: "#d4af37" }}
                        >
                            ENTER THE <br /> VALHALLA
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="Email Address"
                            variant="filled"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) onClearError();
                            }}
                            disabled={isLoading}
                            sx={{
                                mb: 2,
                                backgroundColor: alpha("#fff", 0.05),
                                "& .MuiInputBase-input": { color: "#fff" },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ color: "#8b949e", fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            variant="filled"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) onClearError();
                            }}
                            disabled={isLoading}
                            sx={{
                                mb: 3,
                                backgroundColor: alpha("#fff", 0.05),
                                "& .MuiInputBase-input": { color: "#fff" },
                                // ซ่อนปุ่มลูกตาของ Browser (เช่น Edge)
                                "& input::-ms-reveal": { display: "none" },
                                "& input::-ms-clear": { display: "none" },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: "#8b949e", fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            edge="end"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <VisibilityOffIcon sx={{ color: "#8b949e" }} />
                                            ) : (
                                                <VisibilityIcon sx={{ color: "#8b949e" }} />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {error && (
                            <Typography 
                                variant="caption" 
                                sx={{ color: "#ff4d4d", mb: 2, display: "block", textAlign: "left", fontWeight: 600, ml: 1 }}
                            >
                                * {error}
                            </Typography>
                        )}

                        <ActionButton 
                            fullWidth 
                            variant="contained" 
                            sx={{ py: 1.5, position: 'relative' }} 
                            type="submit"
                            disabled={isLoading || !email || !password}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: "#000" }} />
                            ) : (
                                "SIGN IN TO PLEDGE"
                            )}
                        </ActionButton>
                    </form>
                ) : isMultiChoice ? (
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{ textAlign: "center", fontWeight: 800, mb: 4, color: "#d4af37" }}
                        >
                            SELECT <br /> VERIFICATION
                        </Typography>

                        <Typography variant="body2" sx={{ textAlign: "center", color: "#8b949e", mb: 3 }}>
                            Choose your preferred 2FA method.
                        </Typography>

                        {tfaProviders?.map((provider) => (
                            <ActionButton
                                key={provider.type}
                                fullWidth
                                variant="outlined"
                                sx={{ 
                                    mb: 2, 
                                    py: 1.5, 
                                    borderColor: alpha("#d4af37", 0.5),
                                    color: "#fff",
                                    "&:hover": {
                                        borderColor: "#d4af37",
                                        backgroundColor: alpha("#d4af37", 0.1),
                                    }
                                }}
                                onClick={() => {
                                    if (onSelectWorkflow) {
                                        const nextWorkflow = provider.type === "google" ? "2fa_google_auth" : "2fa_sms_auth";
                                        onSelectWorkflow(nextWorkflow);
                                    }
                                }}
                            >
                                {provider.type === "google" ? "Google Authenticator" : "SMS Verification"}
                            </ActionButton>
                        ))}
                    </Box>
                ) : (
                    <form onSubmit={handle2faSubmit}>
                        <Typography
                            variant="h5"
                            sx={{ textAlign: "center", fontWeight: 800, mb: 4, color: "#d4af37" }}
                        >
                            {isSms ? "SMS" : "GOOGLE"} <br /> AUTHENTICATOR
                        </Typography>

                        <Typography variant="body2" sx={{ textAlign: "center", color: "#8b949e", mb: 3 }}>
                            {isSms 
                                ? "Please enter the code sent to your phone." 
                                : "Please enter the 6-digit code from your app."
                            }
                        </Typography>

                        <TextField
                            fullWidth
                            placeholder="000000"
                            variant="filled"
                            value={twoFactorCode}
                            onChange={(e) => {
                                setTwoFactorCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                                if (error) onClearError();
                            }}
                            disabled={isLoading}
                            autoFocus
                            sx={{
                                mb: 4,
                                backgroundColor: alpha("#fff", 0.05),
                                "& .MuiInputBase-input": { 
                                    color: "#fff", 
                                    textAlign: 'center', 
                                    fontSize: '2rem', 
                                    letterSpacing: '0.5rem',
                                    fontWeight: 700
                                },
                            }}
                        />

                        {error && (
                            <Typography 
                                variant="caption" 
                                sx={{ color: "#ff4d4d", mb: 3, display: "block", textAlign: "center", fontWeight: 600 }}
                            >
                                * {error}
                            </Typography>
                        )}

                        <ActionButton 
                            fullWidth 
                            variant="contained" 
                            sx={{ py: 1.5, position: 'relative' }} 
                            type="submit"
                            disabled={isLoading || twoFactorCode.length !== 6}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: "#000" }} />
                            ) : (
                                "VERIFY AND ENTER"
                            )}
                        </ActionButton>
                    </form>
                )}

                <Typography
                    variant="caption"
                    sx={{ mt: 2, textAlign: "center", color: "#8b949e", display: "block" }}
                >
                    {is2fa ? "Wait for the code to refresh if it fails" : "Unlock the altar by signing in"}
                </Typography>
            </GlassPaper>
        </Grid>
    );
};
