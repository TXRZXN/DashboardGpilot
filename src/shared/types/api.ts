// ---------------------------------------------
// Core Service Types (Global Rules #10)
// ---------------------------------------------

/**
 * โครงสร้าง Error กรณี Validation Fail (422)
 * ที่จะปรากฏในฟิลด์ error
 */
export interface ValidationErrorDetail {
  readonly loc: readonly (string | number)[];
  readonly msg: string;
  readonly type: string;
}

/**
 * มาตรฐานการตอบกลับจาก Backend
 * @template T ประเภทของข้อมูลที่อยู่ในฟิลด์ data
 */
export interface ServiceResponse<T> {
  readonly success: boolean;    // บอกว่าการทำงานสำเร็จหรือไม่
  readonly data: T | null;      // ข้อมูล Payload (จะเป็น null หาก success เป็น false)
  readonly error: string | readonly ValidationErrorDetail[] | any | null; // รายละเอียดข้อผิดพลาด
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
}

// ---------------------------------------------
// Re-export Domain Models
// ---------------------------------------------
export * from './domain';
