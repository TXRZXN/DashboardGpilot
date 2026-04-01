import { CashflowSummary, DashboardSummary } from "@/shared/types/api";

/**
 * Interface สำหรับข้อมูลทางการเงินที่ผ่านการคำนวณหรือ Mapping แล้ว
 */
export interface AccountFinancialStats {
  balance: number;
  deposits: number;
  withdrawals: number;
  netProfit: number;
  profitToday: number;
  profitWeek: number;
  profitMonth: number;
  profitSharing: number; // หาก Backend ยังไม่แยกก้อนนี้มาให้เราอาจต้องหาที่มาอื่นหรือดึงจาก transactions
}

/**
 * รวมผลและ Mapping ข้อมูลจากหลาย Service เข้าด้วยกัน (Separation of Concerns)
 * @param cashflow - ข้อมูลจาก Cashflow Summary
 * @param dash - ข้อมูลจาก Dashboard Summary
 * @returns สถิติการเงินที่พร้อมใช้งานใน UI
 */
export function mapAccountData(
  cashflow: CashflowSummary | null,
  dash: DashboardSummary | null
): AccountFinancialStats {
  return {
    balance: cashflow?.currentBalance ?? 0,
    deposits: cashflow?.deposits ?? 0,
    withdrawals: cashflow?.withdrawals ?? 0,
    netProfit: cashflow?.netFlow ?? 0,
    profitToday: dash?.profitToday ?? 0,
    profitWeek: dash?.profitWeek ?? 0,
    profitMonth: dash?.profitMonth ?? 0,
    profitSharing: 0, // ค่าเริ่มต้น หากมีการคำนวณแยกจะเพิ่มในภายหลัง
  };
}
