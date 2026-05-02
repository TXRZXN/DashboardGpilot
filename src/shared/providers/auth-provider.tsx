"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthService } from "@/shared/services/auth-service";
import type { LoginResponse } from "@/shared/types/auth";

interface AuthContextType {
  user: LoginResponse["user"] | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user_info");
    const token = localStorage.getItem("auth_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user_info");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((data: LoginResponse) => {
    setUser(data.user);
    localStorage.setItem("user_info", JSON.stringify(data.user));
    // Tokens are already handled by AuthService.login, but we ensure consistency
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
