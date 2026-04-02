// ---------------------------------------------
// Core Service Types (Global Rules #10)
// ---------------------------------------------

/**
 * โครงสร้าง Error แบบละเอียด (ตามมาตรฐาน AntiGravity)
 */
export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>[] | null;
}

/**
 * มาตรฐานการตอบกลับจาก Backend
 * @template T ประเภทของข้อมูลที่อยู่ในฟิลด์ data
 */
export interface ServiceResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: ErrorDetail | null;
  readonly meta?: {
    total: number;
    page?: number;
    limit?: number;
  };
}

/**
 * Interface สำหรับการ Check Health ของ API
 */
export interface HealthResponse {
  readonly success: boolean;
  readonly data: {
    readonly status: string;
  };
  readonly error: string | null;
}

/**
 * Filter สำหรับการดึงข้อมูล Trades
 */
export interface TradeRequest {
  from_date?: string | null;
  to_date?: string | null;
  symbol?: string | null;
  type?: string | null;
  entry?: string | null;
  comment?: string | null;
  pageNumber?: number;
  pageSize?: number;
}

// ---------------------------------------------
// Analytics / Performance Types
// ---------------------------------------------

export interface EquityPoint {
  readonly time: string;    // ISO 8601
  readonly equity: number;
  readonly ticket: number;
}

export interface PerformanceStats {
  readonly totalTrades: number;
  readonly wins: number;
  readonly losses: number;
  readonly winRate: number;
  readonly riskRewardRatio: number;
  readonly avgWin: number;
  readonly avgLoss: number;
  readonly profitFactor: number;
  readonly grossProfit: number;
  readonly grossLoss: number;
  readonly totalVolume: number;
  readonly netProfit: number;
  readonly fee: number;
  readonly sharpeRatio: number;
  readonly maxDrawdownPct: number;
  readonly maxDrawdownAmount: number;
  readonly recoveryFactor: number;
  readonly healthScore: number;
  readonly equityCurve: readonly EquityPoint[];
}

// ---------------------------------------------
// Dashboard Types
// ---------------------------------------------

export interface SymbolStat {
  readonly symbol: string;
  readonly trades: number;
  readonly profit: number;
  readonly winRate: number;
}

export interface DashboardSummary {
  readonly profitToday: number;
  readonly profitWeek: number;
  readonly profitMonth: number;
  readonly totalVolume: number;
  readonly totalTrades: number;
  readonly symbolStats: readonly SymbolStat[];
  readonly equityCurve: readonly EquityPoint[];
}

// ---------------------------------------------
// Cashflow Types
// ---------------------------------------------

export interface CashflowTransaction {
  readonly id: number;
  readonly date: string;
  readonly type: 'Deposit' | 'Withdrawal' | 'ProfitSharing';
  readonly amount: number;
  readonly status: string;
  readonly method: string;
}

export interface CashflowSummary {
  readonly deposits: number;
  readonly withdrawals: number;
  readonly netFlow: number;
  readonly currentBalance: number;
  readonly transactions: readonly CashflowTransaction[];
  readonly balanceData: readonly EquityPoint[];
}

// ---------------------------------------------
// Grouped Deal (Round-Turn Position)
// ---------------------------------------------

export interface GroupedDeal {
  readonly ticket: number;
  readonly positionId: number;
  readonly symbol: string;
  readonly type: 'BUY' | 'SELL';
  readonly entry: string;
  readonly volume: number;
  readonly openPrice: number;
  readonly closePrice: number;
  readonly profit: number;
  readonly commission: number;
  readonly swap: number;
  readonly fee: number;
  readonly netProfit: number;
  readonly reason: string;
  readonly comment: string;
  readonly openTime: string;   // ISO 8601
  readonly closeTime: string;  // ISO 8601
}

/**
 * โครงสร้าง Response สำหรับรายการเทรดแบบกลุ่ม (พร้อมสถิติสรุป)
 */
export interface GroupedTradesResponse {
  totalTrades: number;
  totalVolume: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  fee: number;
  list: GroupedDeal[];
}

// ---------------------------------------------
// Re-export Domain Models
// ---------------------------------------------
export * from './domain';

