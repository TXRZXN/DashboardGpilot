"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TradeHistoryService } from "@/shared/services/trade-history-service";
import { createLogger } from "@/shared/utils/logger";

const logger = createLogger("BackgroundSync");

/**
 * BackgroundSync Component
 * ทำหน้าที่กระตุ้นการอัปเดตข้อมูลจาก MT5 ลง Database ฝั่ง Backend (Fire-and-forget)
 * โดยจะทำงานทุกครั้งที่มีการเปลี่ยนหน้าจอ (Route Change)
 */
export function BackgroundSync() {
  const pathname = usePathname();

  useEffect(() => {
    // ข้ามการทำงานครั้งแรกถ้าต้องการ (หรือจะรันเลยก็ได้)
    // ในที่นี้เลือกที่จะรันทุกครั้งที่ pathname เปลี่ยน
    
    // รายการหน้าที่ไม่ต้องการให้รัน Sync (เช่น Auth pages)
    const skipPaths = ["/login", "/register"];
    if (skipPaths.some((path) => pathname.startsWith(path))) {
      return;
    }

    logger.info(`Triggering background sync for path: ${pathname}`);

    // Call API แบบ Fire-and-forget (ไม่ยุ่งกับ UI state)
    // การเรียก getHistory() จะส่งผลให้ Backend ไปดึงข้อมูลใหม่จาก MT5 มาลง DB
    TradeHistoryService.getHistory({ pageSize: 1 }) // ดึงแค่รายการเดียวเพื่อกระตุ้น Sync ประหยัด Bandwidth
      .catch((err) => {
        logger.error("Background sync failed (Silent)", err);
      });

  }, [pathname]);

  return null; // Component นี้ไม่มีการแสดงผล UI
}
