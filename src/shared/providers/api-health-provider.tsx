"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { HealthService } from "@/shared/services/health-service";

interface ApiHealthContextType {
  isHealthy: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  checkHealth: () => Promise<void>;
}

const ApiHealthContext = createContext<ApiHealthContextType | undefined>(undefined);

export function ApiHealthProvider({ children }: { children: React.ReactNode }) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const pathname = usePathname();

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await HealthService.checkHealth();
      setIsHealthy(res.success && res.data.status === "ok");
    } catch (err) {
      setIsHealthy(false);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, []);

  // ยิง Health Check ทุกครั้งที่เปลี่ยนหน้าจอ (ตามข้อกำหนดของผู้ใช้)
  useEffect(() => {
    checkHealth();
  }, [pathname, checkHealth]);

  return (
    <ApiHealthContext.Provider
      value={{
        isHealthy,
        isChecking,
        lastChecked,
        checkHealth,
      }}
    >
      {children}
    </ApiHealthContext.Provider>
  );
}

export function useApiHealth() {
  const context = useContext(ApiHealthContext);
  if (context === undefined) {
    throw new Error("useApiHealth must be used within an ApiHealthProvider");
  }
  return context;
}
