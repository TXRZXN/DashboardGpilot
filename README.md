# DashboardGpilot — Frontend

> Real-time Trading Dashboard สำหรับนักเทรด Forex เชื่อมต่อกับ MetaTrader 5 ผ่าน Backend API และระบบจัดการบัญชีอัจฉริยะ

---

| Category | Technology |
| :--- | :--- |
| Framework | Next.js 15 (App Router + Turbopack) |
| Language | TypeScript 5 (Strict Mode) |
| UI Library | MUI v7 (Material UI) |
| Charts | @mui/x-charts v8 |
| Data Grid | @mui/x-data-grid v8 |
| Styling | Emotion + TailwindCSS v4 |
| **Data Fetching** | **TanStack Query v5 (Caching + SWR)** |
| **Unit Testing** | **Vitest** |
| **UI Testing** | **React Testing Library + happy-dom** |
| **Observability** | **Structured Logging + Distributed Tracing** |

---

## ✨ Key Features (ล่าสุด)

- **🔐 Mandatory Password Change:** ระบบบังคับเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก เพื่อความปลอดภัยสูงสุดของผู้ใช้
- **🔄 Reactive Refresh Token:** ระบบต่ออายุ Session อัตโนมัติเบื้องหลัง ทำให้ผู้ใช้ไม่ต้องล็อกอินซ้ำบ่อยๆ และใช้งานได้อย่างต่อเนื่อง
- **🔐 Multi-Service RBAC:** ระบบจัดการสิทธิ์การเข้าถึงผลิตภัณฑ์ (Admin, Role A, Role B) แยกตาม Microservice ของแต่ละผลิตภัณฑ์
- **⚡ Advanced Data Fetching:** ใช้ **TanStack Query** เพื่อระบบ Caching (1 min stale) และ SWR ทำให้เปลี่ยนหน้าจอปุ๊บ ข้อมูลขึ้นปั๊บ ไม่ต้องรอโหลด
- **⚡ Parallel Data Fetching:** หน้า Dashboard โหลดข้อมูลแต่ละผลิตภัณฑ์แยกจากกันอิสระ (Parallel) โดยตัวที่เสร็จก่อนจะแสดงผลก่อนทันที ไม่ต้องรอกัน
- **📊 Real-time Analytics:** ระบบสรุปสถิติการเทรด (Balance, Profit, Win Rate) แบบเรียลไทม์จาก MT5
- **🔄 Background Sync:** ระบบอัปเดตข้อมูลประวัติการเทรดทำงานเบื้องหลัง (Detail Page) เพื่อประสบการณ์การใช้งานที่ลื่นไหล
- **🔐 Secure Access:** ระบบสมัครสมาชิกและล็อกอินที่เน้นความปลอดภัยสูงสุด รองรับ **Centralized Auth (JWT/Bearer Token)**
- **🏥 Dual-Service Health:** ระบบตรวจสอบสถานะการเชื่อมต่อของทั้ง Main Backend และ Core-API แบบเรียลไทม์ เพื่อความมั่นใจในความพร้อมของระบบ

---

## 📡 Observability & Monitoring

เพื่อให้ระบบสามารถตรวจสอบย้อนหลังและเฝ้าระวังปัญหาได้ เราจึงใช้มาตรฐาน Observability ดังนี้:

### 1. Structured Logging
เราใช้ `pino` ผ่าน `shared/utils/logger` เพื่อบันทึกเหตุการณ์สำคัญในรูปแบบ JSON:
- `DEBUG`: ใช้ระหว่างการพัฒนาเพื่อดูข้อมูลละเอียด
- `INFO`: บันทึกการทำงานปกติ เช่น การเข้าสู่ระบบสำเร็จ, การเปลี่ยนหน้า
- `WARN`: บันทึกข้อผิดพลาดที่กู้คืนได้ เช่น การเชื่อมต่อ API ล้มเหลวและมีการ Retry
- `ERROR`: บันทึกข้อผิดพลาดที่ต้องการการตรวจสอบ เช่น API ล่ม หรือระบบจัดการ Token ล้มเหลว

### 2. Distributed Tracing
ทุก Request ที่ส่งไปยัง Backend จะมีการแนบ `X-Trace-ID` ใน Header เพื่อให้สามารถ Trace ข้อมูลข้าม Service ได้อย่างแม่นยำ

### 3. Health Metrics
ระบบมีการ Monitor สถานะของ API Gateway และ Microservices ทุกๆ 30 วินาที ผ่าน `ApiHealthProvider` โดยจะมีการแสดงสถานะความพร้อมของระบบที่หน้า Dashboard

---

## 🏗 Architecture

โปรเจคใช้ **Feature-based Clean Architecture** (อ่านรายละเอียดได้ที่ [ARCHITECTURE.md](file:///d:/EAGold/Gpliot/GPilotFrontEnd/ARCHITECTURE.md)):

```text
src/
├── app/                        # Next.js App Router (Routing)
├── features/                   # Feature Modules (UI + Application Layer)
│   ├── history/                # Trade History feature
│   └── cashflow/               # Cashflow feature
│
├── shared/                     # Shared cross-feature code
│   ├── ui/                     # Reusable UI Components (DataTable, Gauge, Charts)
│   ├── api/                    # Infrastructure: API clients
│   ├── services/               # Application Layer: Business logic
│   ├── types/                  # Domain Types (shared TypeScript interfaces)
│   ├── config/                 # Configuration (theme, etc.)
│   └── utils/                  # Utility Functions (crypto, logger)
│
├── layouts/                    # Shared layout components (Sidebar, TopBar)
└── proxy.ts                    # Next.js Middleware (Auth guard / Gateway routing)
```

---

## ⚙️ Getting Started

### 0. Prerequisites

- **Node.js:** เวอร์ชั่น 18.x ขึ้นไป (แนะนำ **v22.19.0**)
- **NPM:** เวอร์ชั่น 10.x ขึ้นไป

### 1. Installation

```bash
npm install
```

### 2. Running for Development
เพื่อให้ Frontend ทำงานครบทุกฟีเจอร์ ต้องรัน Backend ทั้งสองส่วนควบคู่กัน:
1. **Backend-Main**: `localhost:8000` (จัดการข้อมูลเทรดเรียลไทม์)
2. **Backend-Sub**: `localhost:8001` (จัดการระบบ Auth และ Sync)

Frontend จะใช้ระบบ `rewrites` ใน `next.config.mjs` เพื่อส่งต่อ Request ไปยัง Backend ที่ถูกต้องโดยอัตโนมัติผ่าน path `/api/gateway/...`

### 3. ตั้งค่า Environment Variables (.env)

| Variable | คำอธิบาย |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | ตั้งค่าเป็น `/api/gateway` (Proxy Path) |
| `NEXT_PUBLIC_IS_MOCK_MODE` | ตั้งเป็น `true` เพื่อใช้ข้อมูลจำลอง |
| `NEXT_PUBLIC_MT5_ENCRYPTION_KEY` | Hex Key สำหรับเข้ารหัสรหัสผ่าน MT5 (ต้องตรงกับ Backend-Sub) |

### 4. คำสั่งที่สำคัญ (Scripts)

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `npm run dev` | รัน Development Server (Turbopack) |
| `npm run build` | บิลด์สำหรับ Production |
| `npm run test` | รันการทดสอบ (Watch Mode) |
| `npm run lint` | ตรวจสอบ Code Quality (ESLint) |

---

## 🔄 Data Flow

```text
User visits /dashboard
  → Server Component renders (static shell)
  → useDashboardData() hook checks TanStack Query Cache
  → If Cache is valid (staleTime < 1min) → Return data instantly
  → If Cache is stale → Fetch data client-side (Background Revalidation)
  → apiClient() retrieves auth_token from localStorage
  → apiClient("/api/v1/...") → Authorization: Bearer <token>
  → Next.js Rewrite → Proxy to local Backend (8000 or 8001)
  → FastAPI Backend logic execution
```

---

## 🔗 Referral System (Security Obfuscation)

ลิงก์ Referral ถูกออกแบบมาให้ซ่อน User ID จริงเพื่อบรรเทาปัญหาการแก้ไข URL โดยตรงจากผู้ใช้งาน

### 1. รูปแบบลิงก์
`https://gpilotsystem.com/register?ref=[EncodedValue]`

### 2. ตรรกะการเข้ารหัส (Frontend)
การเข้ารหัสทำใน `src/features/account/hooks/use-account-data.ts`:
1. เติม Prefix `GP-` หน้า User ID (เช่น `12345` -> `GP-12345`)
2. แปลงเป็น **Base64** (Encoding)
3. ตัดเครื่องหมาย `=` (Padding) ออก

---

## 🛠 Integration Note
ระบบ DashboardGpilot ทำงานแบบ Microservices โดยมี **Backend-Sub** เป็นตัวจัดการ Identity (Auth) และ **Backend-Main** เป็นตัวจัดการ Trading Data ทั้งหมดแชร์ `JWT_SECRET_KEY` และ `MT5_ENCRYPTION_KEY` ร่วมกันเพื่อให้ระบบความปลอดภัยเป็นหนึ่งเดียว
