"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { HealthService } from "@/shared/services/health-service";
import { logger } from "@/shared/utils/logger";

interface ApiHealthContextType {
  isHealthy: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  checkHealth: () => Promise<void>;
}

const ApiHealthContext = createContext<ApiHealthContextType | undefined>(undefined);

interface ApiHealthProviderProps {
  readonly children: React.ReactNode;
}

export function ApiHealthProvider({ children }: ApiHealthProviderProps) {
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
      logger.error("API Health check failed unexpectedly in provider", err instanceof Error ? err : String(err));
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

  const apiHealthValue = React.useMemo(
    () => ({
      isHealthy,
      isChecking,
      lastChecked,
      checkHealth,
    }),
    [isHealthy, isChecking, lastChecked, checkHealth]
  );

  return (
    <ApiHealthContext.Provider value={apiHealthValue}>
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
