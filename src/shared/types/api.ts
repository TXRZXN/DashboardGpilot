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
    totalPage?:number;
  } | null;
}


/**
 * Interface สำหรับการ Check Health ของ API
 */
export interface HealthResponse {
  readonly success: boolean;
  readonly data: {
    readonly status?: string;    // สำหรับ Main Backend
    readonly api?: string;       // สำหรับ Backend-Sub
    readonly database?: string;  // สำหรับ Backend-Sub
  };
  readonly error: ErrorDetail | string | null;
}

/**
 * Filter สำหรับการดึงข้อมูล Trades
 * รองรับทั้ง Backend-Main (Standard & Grouped)
 */
export interface TradeRequest {
  from_date?: string | null;  // สำหรับ API ทั่วไป
  to_date?: string | null;    // สำหรับ API ทั่วไป
  date_from?: string | null;  // สำหรับ /trades/grouped (Backend Alias)
  end_date?: string | null;   // สำหรับ /trades/grouped (Backend Alias)
  symbol?: string | null;
  type?: string | null;
  entry?: string | null;
  comment?: string | null;
  pageNumber?: number;
  pageSize?: number;
  page?: number;     // Pagination Alias
  limit?: number;    // Pagination Alias
  order_by?: string | null;   // Sorting
  order_dir?: 'ASC' | 'DESC'; // Sorting
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
// Product Detail Types
// ---------------------------------------------

export interface SymbolStat {
  readonly symbol: string;
  readonly trades: number;
  readonly profit: number;
  readonly winRate: number;
}

export interface ProductDetailRecentTransaction {
  readonly type: string;
  readonly amount: number;
  readonly datetime: string;
  readonly symbol?: string | null;
}

export interface DashboardSummary {
  readonly DD: number;
  readonly avgProfitMonth: number;
}

export interface ProductDetail {
  readonly balance: number;
  readonly profitToday: number;
  readonly avgProfitWeek: number;
  readonly avgProfitMonth: number;
  readonly winrate: number;
  readonly recoveryFactor: number;
  readonly maxdd: number;
  readonly profitFactor: number;
  readonly equityCurve: readonly EquityPoint[];
  readonly symbolStats: {
    readonly totaltrades: number;
    readonly list: readonly SymbolStat[];
  };
}


// ---------------------------------------------
// Cashflow Types
// ---------------------------------------------

export interface CashflowTransaction {
  readonly type: string;
  readonly date: string;
  readonly amount: number;
  readonly comment?: string | null;
  readonly status?: string | null;
}

export interface CashflowSummary {
  readonly totalWithdrawal: number;
  readonly totalDeposit: number;
  readonly countWithdrawal: number;
  readonly countDeposit: number;
  readonly largestWithdrawal: number;
  readonly largestDeposit: number;
  readonly todayDeposit: number;
  readonly todayWithdrawal: number;
  readonly todayProfitSharing: number;
  readonly totalTransactions: number;
  readonly transactions: readonly CashflowTransaction[];
}

export interface AccountSummary {
  readonly balance: number;

  // Profile Data
  readonly name: string;
  readonly login: number;
  readonly server: string;
  readonly leverage: number;
  readonly currency: string;
  
  readonly grossTradeProfit: number;
  readonly totalDeposits: number;
  readonly totalWithdrawals: number;
  readonly totalProfitSharing: number;
  readonly netProfit: number;
}

/**
 * ข้อมูลสรุปรายพอร์ต (จาก Backend-Sub /account/profile)
 */
export interface AccountProfile {
  readonly mt5Id: number;
  readonly name: string;
  readonly server: string;
  readonly currency: string;
  readonly balance: number;
  readonly leverage: number;
  readonly updatedAt: string;
}

/**
 * ข้อมูลสถิติและการเงินภาพรวม (จาก Backend-Sub /account/finance)
 */
export interface AccountFinance {
  readonly user_id: string;
  readonly grossTradeProfit: number;
  readonly totalDeposits: number;
  readonly totalWithdrawals: number;
  readonly totalProfitSharing: number;
  readonly netProfit: number;
  readonly totalBalance: number;
  readonly totalTrades: number;
  readonly equityCurve: EquityPoint[];
  readonly updated_at: string;
}

// ---------------------------------------------
// Grouped Deal (Round-Turn Position)
// ---------------------------------------------

export interface GroupedDeal {
  readonly ticket?: number;
  readonly positionId?: number;
  readonly symbol?: string;
  readonly type: string;
  readonly entry?: string | null;
  readonly volume?: number;
  readonly openPrice?: number;
  readonly closePrice?: number;
  readonly profit?: number;
  readonly commission?: number;
  readonly swap?: number;
  readonly fee?: number;
  readonly netProfit: number;
  readonly reason?: string;
  readonly comment?: string;
  readonly openTime?: string;
  readonly closeTime?: string;
  readonly time: string;
  readonly balance: number;
}

/**
 * โครงสร้าง Response สำหรับรายการเทรดแบบกลุ่ม (พร้อมสถิติสรุป)
 */
export interface GroupedTradesPage {
  readonly pageTrades: number;
  readonly pageVolume: number;
  readonly pageGrossProfit: number;
  readonly pageGrossLoss: number;
  readonly pageNetProfit: number;
  readonly pageFee: number;
  readonly list: GroupedDeal[];
}

export interface GroupedTradesResponse {
  totalTrades: number;
  totalVolume: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  fee: number;
  paginated: GroupedTradesPage;
}

// ---------------------------------------------
// Referral Sync Types
// ---------------------------------------------

export interface ReferralSyncSummary {
  readonly successCount: number;
  readonly failedUsers: { email: string; error: string }[];
}

export interface ReferralSyncRequest {
  readonly from_date?: string;
  readonly to_date?: string;
}

// ---------------------------------------------
// Re-export Domain Models
// ---------------------------------------------
export * from './domain';

