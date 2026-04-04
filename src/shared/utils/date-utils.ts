/**
 * หาวันจันทร์ล่าสุดของสัปดาห์ปัจจุบัน (Current Week Monday)
 * @param date - วันที่ต้องการอ้างอิง (Default: Now)
 * @returns Date object ของวันจันทร์ที่ผ่านมา เวลา 00:00:00.000
 */
export function getMostRecentMonday(date: Date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // คำนวณจำนวนวันที่ต้องย้อนกลับไปหาวันจันทร์
  // ถ้าเป็นวันอาทิตย์ (0) ต้องย้อนกลับ 6 วัน
  // ถ้าเป็นวันจันทร์ (1) ย้อนกลับ 0 วัน
  // ถ้าเป็นวันอื่นๆ (2-6) ย้อนกลับ (day - 1) วัน
  const diff = day === 0 ? 6 : day - 1;
  
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  
  return result;
}

/**
 * หาวันอาทิตย์ที่จะถึงของสัปดาห์นั้นๆ (End of Week Sunday)
 */
export function getEndOfWeek(date: Date): Date {
  const result = getMostRecentMonday(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * เพิ่ม/ลด จำนวนวัน
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * แปลง Date เป็น ISO String เฉพาะวันที่ (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * แปลง Date เป็น ISO String แบบเต็ม (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function toFullISOString(date: Date): string {
  return date.toISOString();
}
