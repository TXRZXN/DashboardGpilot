export interface Deal {
  readonly ticket: number;
  readonly order: number;
  readonly positionId: number;
  readonly symbol: string;
  readonly type: 'BUY' | 'SELL' | 'BALANCE' | (string & {}); // BALANCE สำหรับรายการฝาก/ถอน — (string & {}) รองรับ type ที่ไม่ได้กำหนดไว้ล่วงหน้า
  readonly entry: 'IN' | 'OUT' | 'INOUT' | 'OUT_BY' | null;
  readonly volume: number;
  readonly price: number;
  readonly profit: number;
  readonly commission: number;
  readonly swap: number;
  readonly fee: number;
  readonly netProfit: number;
  readonly magic: number;
  readonly reason: string;
  readonly comment: string;
  readonly priceSl: number | null;
  readonly priceTp: number | null;
  readonly time: string; // ISO 8601 string (e.g., "2024-03-26T15:30:00")
  readonly timeMsc: number;
}

export interface TradesHistoryResponse {
  readonly total: number;
  readonly data: readonly Deal[];
}
