/**
 * กำหนด URL พื้นฐานสำหรับ API
 * ใช้ Gateway Proxy (/api/gateway) เพื่อซ่อน Backend URL และ API Key จาก Browser (F12)
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/gateway";

/**
 * รายการ Endpoint ทั้งหมดที่ใช้งานในแอปพลิเคชัน
 */
export const ENDPOINTS = {
  /** เช็คสถานะ API และการเชื่อมต่อ MT5 */
  HEALTH: "/api/v1/health",
  /** ดึงประวัติการเทรด (รองรับ Filtering) */
  TRADES: "/api/v1/trades",
  /** ดึงข้อมูลบัญชี MT5 */
  ACCOUNT: "/api/v1/account",
} as const;
