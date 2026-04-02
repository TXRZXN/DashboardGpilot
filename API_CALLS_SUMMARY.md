# สรุปการยิง API และ Flow การทำงานในแต่ละหน้าจอ (Frontend)

แอพพลิเคชั่น GPilot Dashboard ใช้สถาปัตยกรรมแบบแบ่ง State เป็น 2 ระดับ คือระดับ Global ที่แชร์กันทุกหน้า และระดับ Hook เฉพาะหน้าจอ รูปแบบการเรียกใช้งาน API หลัก ๆ มีดังนี้รหัส:

---

## 🌎 ระดับ Global (ใช้งานร่วมกันทุกหน้า)
**ไฟล์ที่เรียก:** `src/shared/providers/trade-data-provider.tsx`

- **API Endpoint ที่เรียก (ยิงขนานกัน):**
  1. `AccountService.getAccountInfo()`
  2. `TradeHistoryService.getHistory()`
- **ยิงเมื่อกดปุ่มอะไร / ตอนไหน:** 
  - ยิงอัตโนมัติ 1 ครั้งถ้วนเมื่อเปิดเข้ามาที่ระบบ (App Initialization) และผ่าน API Health check แล้ว
  - ยิงเมื่อผู้ใช้งานกดปุ่ม Refresh (ผ่านฟังก์ชัน `refreshData()`)
- **เอามาใช้อะไร:**
  - `account`: ข้อมูลพื้นฐานเช่น สมดุลบัญชี (Balance, Equity), Leverage, สกุลเงินที่ใช้
  - `deals`: Raw trades (ประวัติไม้ทั้งหมด) ที่โหลดมาเก็บไว้ตรงกลางเพื่อให้หน้าอื่นๆ เรียกใช้ทันทีโดยไม่ต้องโหลดใหม่
QS22
---

## 1. หน้า Dashboard (`/dashboard`)
**ไฟล์ Hook ที่เรียก:** `src/features/dashboard/hooks/use-dashboard-data.ts`

- **API Endpoint ที่เรียก:**
  - `AnalyticsService.getDashboardSummary({ from_date: ว้นจันทร์ล่าสุด })`
- **ยิงเมื่อกดปุ่มอะไร / ตอนไหน:**
  - ยิงอัตโนมัติเมื่อโหลดเข้าหน้า Dashboard
- **เอามาใช้อะไร:**
  - **Equity Chart (Account Growth):** นำข้อมูล `equityCurve` มาพล็อตกราฟเส้น
  - **Volume Progress:** ใช้ค่า `totalVolume`, `totalTrades` เพื่อวาดหลอดเป้าหมายหลอดความคืบหน้าเรื่อง Volume
  - **Metric Cards:** ตัวเลขสรุปหน้าแรก ได้แก่กำไรของวันนี้ (`profitToday`), สัปดาห์นี้ (`profitWeek`), และของเดือนนี้ (`profitMonth`) แบบที่ Backend คำนวณมาให้เสร็จสรรพ
  - **Symbol Performance:** นำข้อมูล `symbolStats` มาแสดงสถิติประสิทธิภาพการเทรดแยกตามคู่เงิน

---

## 2. หน้า History (`/history`)
**ไฟล์ Hook ที่เรียก:** `src/features/history/hooks/use-history-data.ts`

- **API Endpoint ที่เรียก:**
  - `AnalyticsService.getGroupedTrades()`
- **ยิงเมื่อกดปุ่มอะไร / ตอนไหน:**
  - ยิงอัตโนมัติเมื่อโหลดเข้าหน้า History
- **เอามาใช้อะไร:**
  - **ตารางออเดอร์เข้า-ออก:** ดึงไม้เทรดที่ถูก Group (เข้า-ออก) หักลบเสร็จเรียบร้อยจากฝั่งหลังบ้านมาพ่นใส่ตาราง
  - **Client-Side Filtering & Sorting:** ผู้ใช้สามารถค้นหาคู่เงิน (Search), กดย้ายวัน (Date Range), เรียงตามกำไร/ขาดทุน (Sorting) โดย **ไม่ต้องยิง API ใหม่** (พอดึงมาครั้งเดียว UI จะเปลี่ยนผลลัพธ์ทันทีแบบ Instant)
  - **สรุปยอดปิด:** ใช้ลูปหาค่าผลรวมของตาราง เช่น Total Volume, Gross Profit, สุทธิ (Net P/L) และ ค่าธรรมเนียมทั้งหมด

---

## 3. หน้า Analytics / Performance Intelligence (`/analytics`)
**ไฟล์ Hook ที่เรียก:** `src/features/analytics/hooks/use-analytics-data.ts`

- **API Endpoint ที่เรียก (ยิงขนานกัน):**
  1. `AnalyticsService.getPerformance()` 
  2. `AnalyticsService.getGroupedTrades()`
- **ยิงเมื่อกดปุ่มอะไร / ตอนไหน:**
  - ยิงอัตโนมัติเมื่อโหลดเข้าหน้า Analytics
- **เอามาใช้อะไร:**
  - ข้อมูล **Performance Stats** เอามาโชว์ในกล่องความเสี่ยง (Risk Metrics) เช่น Win Rate, Recovery Factor, Max Drawdown
  - สร้างกราฟ **Margin Gauge:** ตัววัดระดับความฟิตของพอร์ต (Health Score)
  - ดัดแปลง `GroupedTrades` บนฝั่ง Frontend เอาไปเสิร์ฟเป็นกราฟ 2 ตัว:
    - **Asset Exposure:** สัดส่วนความหนาแน่นว่าเล่นคู่เงินไหนเยอะกว่ากันออกมาเป็นโดนัท/แท่งๆ
    - **P/L Distribution:** แจกแจงการกระจายตัวของไม้ที่กำไรกับขาดทุนแบบช่วงๆ เป็น Histogram (ฮิสโทแกรม)

---

## 4. หน้า Cashflow  (`/cashflow`)
**ไฟล์ Hook ที่เรียก:** `src/features/cashflow/hooks/use-cashflow-data.ts`

- **API Endpoint ที่เรียก:**
  - `CashflowService.getCashflowSummary()`
- **ยิงเมื่อกดปุ่มอะไร / ตอนไหน:**
  - ยิงอัตโนมัติเมื่อโหลดเข้าหน้า Cashflow
- **เอามาใช้อะไร:**
  - **Transactions List:** นำประวัติการทำธุรกรรมการเงินต่างๆ (ระบบฝากถอน) มาขึ้นโชว์เรียงเป็นตาราง
  - นำตัวเลข ยอดฝาก (Total Deposits), ยอดถอน (Total Withdrawals), และเงินสดสุทธิ (Net Flow) มาขึ้นสถิติหน้าตาเด่นๆ 
  - นำข้อมูล Balance ไปวาดกราฟเส้นแสดงทิศทางการไหลเวียนของการเคลื่อนไหวที่ไม่ได้เกิดจากการเบิ้ลสวิงของไม้เทรด 

---

## 5. หน้า Account & Manage (`/account`)
**ไฟล์ Hook ที่เรียก:** `src/features/account/hooks/use-account-data.ts`

- **API Endpoint ที่เรียก (ยิงขนานกัน):**
  1. `CashflowService.getCashflowSummary()`
  2. `AnalyticsService.getDashboardSummary()`
- **ยิงเมื่อกดปุ่มอะไร / ตอนไหน:**
  - ยิงอัตโนมัติเมื่อโหลดเข้าหน้า Account
- **เอามาใช้อะไร:**
  - **Financial Summary:** เป็นหน้าควบคุมที่ผนวกเอาข้อมูลฝั่ง Cashflow (เช่นยอดเงินที่ถอนไปแล้ว) มารวมกับฝั่ง Dashboard ทำให้เห็นภาพรวมกระเป๋าจริงๆ ได้ 
  - **Referral Generation:** ดึงชิ่อ Login ไปผสมลงไปในลิงก์เพื่อให้ผู้ใช้กดก๊อปปี้ไปแจก (มี Alert ขอบคุณเวลาถูกคลิกก็อปปี้ขึ้นมาด้วย)

---

## 6. หน้า Auth (Login / Register)

***ปัจจุบัน:*** ในหน้าจอ `/login` และ `/register` ถือว่าเป็นเพียงหน้ากาก UI เพียวๆ **ยังไม่มีการเรียกใช้ API ใดๆ ไปเช็คกับ Backend** เมื่อกดปุ่ม "Sign In" ระบบจะแค่ Redirect แบบง่าย ๆ เข้าไปที่หน้าแดชบอร์ดเลย (`router.push('/dashboard')`) ตรงนี้หากในอนาคตมีระบบจริงแล้ว จะต้องมีการต่อ API ก่อนที่จะยอมให้เข้าถึงหน้าอื่นๆ ได้
