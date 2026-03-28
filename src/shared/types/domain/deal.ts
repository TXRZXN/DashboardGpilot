export interface Deal {
  readonly ticket: number;
  readonly order: number;
  readonly position_id: number;
  readonly symbol: string;
  readonly type: 'BUY' | 'SELL' | 'BALANCE'; // เพิ่ม BALANCE สำหรับรายการฝาก/ถอน
  readonly entry: 'IN' | 'OUT' | 'REVERSE' | null;
  readonly volume: number;
  readonly price: number;
  readonly profit: number;
  readonly commission: number;
  readonly swap: number;
  readonly fee: number;
  readonly net_profit: number;
  readonly magic: number;
  readonly reason: string;
  readonly comment: string;
  readonly price_sl: number | null;
  readonly price_tp: number | null;
  readonly time: string; // ISO 8601 string (e.g., "2024-03-26T15:30:00")
  readonly time_msc: number;
}

export interface TradesHistoryResponse {
  readonly total: number;
  readonly data: readonly Deal[];
}
