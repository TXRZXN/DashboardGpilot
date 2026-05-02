"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { HealthService } from "@/shared/services/health-service";
import { logger } from "@/shared/utils/logger";

interface ApiHealthContextType {
  isHealthy: boolean; // Overall health (both must be up)
  isMainHealthy: boolean;
  isSubHealthy: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  checkHealth: () => Promise<void>;
}

const ApiHealthContext = createContext<ApiHealthContextType | undefined>(undefined);

interface ApiHealthProviderProps {
  readonly children: React.ReactNode;
}

import { API_GATEWAY_SUB, API_GATEWAY_MAIN } from "@/shared/api/endpoint";

export function ApiHealthProvider({ children }: ApiHealthProviderProps) {
  const [isMainHealthy, setIsMainHealthy] = useState(true);
  const [isSubHealthy, setIsSubHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const pathname = usePathname();

  const isHealthy = isMainHealthy && isSubHealthy;

  const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === "True" || process.env.NEXT_PUBLIC_IS_MOCK_MODE === "true";

  /* 
  // Mock Auth Initialization (Disabled - เก็บไว้เป็นตัวอย่างการใช้งาน)
  useEffect(() => {
    if (IS_MOCK_MODE) {
      if (typeof window !== "undefined") {
        if (!localStorage.getItem("auth_token")) {
          localStorage.setItem("auth_token", "dev-mock-token");
          logger.info("Mock Auth Token initialized in localStorage");
        }
        // ตรวจสอบคุกกี้ด้วยเพื่อให้ Middleware ทำงานได้ถูกต้อง
        if (!document.cookie.includes("auth_token")) {
          document.cookie = "auth_token=dev-mock-token; path=/; max-age=86400";
        }
      }
    }
  }, [IS_MOCK_MODE]);
  */

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      // ตรวจสอบทั้งคู่พร้อมกัน
      const [mainRes, subRes] = await Promise.all([
        HealthService.checkHealth(API_GATEWAY_MAIN),
        HealthService.checkHealth(API_GATEWAY_SUB)
      ]);
      
      // ในโหมด Mock ให้ถือว่า Healthy เสมอเพื่อให้ UI ไม่ค้าง
      // ปรับปรุงให้ยืดหยุ่นขึ้น: ยอมรับทั้ง status === "ok" หรือ api === "up/ok"
      setIsMainHealthy(IS_MOCK_MODE ? true : (mainRes.success && (mainRes.data.status === "ok" || mainRes.data.api === "up")));
      setIsSubHealthy(IS_MOCK_MODE ? true : (subRes.success && (subRes.data.api === "up" || subRes.data.status === "ok" || subRes.data.api === "ok")));
    } catch (err) {
      logger.error("API Health check failed unexpectedly in provider", err instanceof Error ? err : String(err));
      if (!IS_MOCK_MODE) {
        setIsMainHealthy(false);
        setIsSubHealthy(false);
      }
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, [IS_MOCK_MODE]);

  // ยิง Health Check เฉพาะในหน้าหลัก (Dashboard, Wallet, Account, History, Clients)
  // ข้ามในหน้า Product Detail และ ROR เพื่อลดจำนวน Request (ตาม User Request)
  useEffect(() => {
    const mainPaths = ["/dashboard", "/wallet", "/account", "/history", "/clients"];
    const shouldCheck = mainPaths.some(path => pathname === path || pathname?.startsWith(path + "/")) && 
                        !pathname?.includes("product-detail") && 
                        !pathname?.includes("record-of-ragnarok");

    if (shouldCheck) {
      checkHealth();
    }
  }, [pathname, checkHealth]);

  const apiHealthValue = React.useMemo(
    () => ({
      isHealthy,
      isMainHealthy,
      isSubHealthy,
      isChecking,
      lastChecked,
      checkHealth,
    }),
    [isHealthy, isMainHealthy, isSubHealthy, isChecking, lastChecked, checkHealth]
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
