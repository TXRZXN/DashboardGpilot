export interface AccountInfo {
  readonly login?: number;     // optional — Backend ไม่ได้ส่งใน response ทุกครั้ง
  readonly server: string;
  readonly name: string;
  readonly currency: string;
  readonly balance: number;
  readonly equity: number;
  readonly margin: number;
  readonly marginFree: number;
  readonly marginLevel: number;
  readonly leverage: number;
  readonly profit: number;
}
