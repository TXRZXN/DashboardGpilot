"use client";

import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Stack,
    Menu,
    MenuItem,
    Avatar,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import {
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    PersonAdd as PersonAddIcon,
    PostAdd as PostAddIcon,
} from "@mui/icons-material";
import { useThemeMode } from "@/shared/ui/theme-provider";
import { useAuth } from "@/shared/providers/auth-provider";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TopBar() {
    const { mode, toggleTheme } = useThemeMode();
    const { user, isAuthenticated, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: mode === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    transition: "background-color 0.3s ease",
                    zIndex: 110,
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, lg: 2 } }}>
                        {isAuthenticated ? (
                            <>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{
                                        p: 0.5,
                                        border: '2px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: '50%',
                                    }}
                                >
                                    <Avatar 
                                        sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            bgcolor: 'primary.main',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {user?.email?.[0].toUpperCase() || 'U'}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    slotProps={{
                                        paper: {
                                            sx: {
                                                mt: 1.5,
                                                borderRadius: 2,
                                                minWidth: 200,
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                                                bgcolor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
                                            }
                                        }
                                    }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            User Profile
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    
                                    <MenuItem onClick={() => { toggleTheme(); handleMenuClose(); }}>
                                        <ListItemIcon>
                                            {mode === 'dark' ? <LightModeIcon fontSize="small" sx={{ color: "#FBBF24" }} /> : <DarkModeIcon fontSize="small" sx={{ color: "#64748B" }} />}
                                        </ListItemIcon>
                                        <ListItemText>
                                            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={() => { router.push("/add-port"); handleMenuClose(); }}>
                                        <ListItemIcon>
                                            <PostAddIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Add Port</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={() => { router.push("/register"); handleMenuClose(); }}>
                                        <ListItemIcon>
                                            <PersonAddIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Register</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText>Logout</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<LoginIcon fontSize="small" />}
                                    onClick={() => router.push("/login")}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        boxShadow: "none",
                                        bgcolor: "primary.main",
                                        "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
                                        px: { lg: 2.5 },
                                    }}
                                >
                                    Login
                                </Button>
                                <IconButton
                                    onClick={toggleTheme}
                                    aria-label="Toggle brightness mode"
                                    sx={{
                                        color: "text.secondary",
                                    }}
                                >
                                    {mode === "dark" ? (
                                        <LightModeIcon sx={{ color: "#FBBF24" }} />
                                    ) : (
                                        <DarkModeIcon sx={{ color: "#64748B" }} />
                                    )}
                                </IconButton>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
        </>
    );
}
