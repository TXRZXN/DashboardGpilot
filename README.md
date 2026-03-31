# DashboardGpilot — Frontend

> Real-time Trading Dashboard สำหรับนักเทรด Forex เชื่อมต่อกับ MetaTrader 5 ผ่าน Backend API และระบบจัดการบัญชีอัจฉริยะ

---

| Category | Technology |
|------|-----------|
| Framework | Next.js 15 (App Router + Turbopack) |
| Language | TypeScript 5 (Strict Mode) |
| UI Library | MUI v7 (Material UI) |
| Charts | @mui/x-charts v8 |
| Data Grid | @mui/x-data-grid v8 |
| Styling | Emotion + TailwindCSS v4 |
| **Unit Testing** | **Vitest** |
| **UI Testing** | **React Testing Library + happy-dom** |
| **Observability** | **Structured Logging + Distributed Tracing** |

---

## ✨ Key Features (ล่าสุด)

- **🔐 Secure Registration:** ระบบสมัครสมาชิกที่บังคับใช้ **Referral ID** เท่านั้น พร้อมรองรับการผูกบัญชี **MT5 ID** และ **Investor's Password** ตั้งแต่ขั้นตอนสมัคร
- **📊 My Account Dashboard:** ส่วนจัดการบัญชีที่แสดงข้อมูลการเงินเชิงลึก (8 Metrics):
    - **Performance:** Today, Week, Month Trading Profit
    - **Capital Flow:** สรุปยอดฝาก (Deposits) และยอดถอน (Withdrawals) แยกจากกัน
    - **Gross vs Net:** แสดงกำไรสะสม (Gross), ส่วนแบ่งแพลตฟอร์ม (Profit Sharing - PF), และกำไรสุทธิจริงหลังแบ่ง (Net Gain)
- **🌓 Centralized Theme Control:** รวมจุดเปลี่ยน Light/Dark Mode ไว้ที่ Top Bar เพียงจุดเดียวเพื่อความสะอาดตา
- **🚀 Partner Integration:** ปุ่ม "สมัคร Strikepro" ใน Top Bar เพื่อการเชื่อมต่อพาร์ทเนอร์ที่รวดเร็ว
- **🎨 UI Cleanup:** ปรับปรุง Layout ให้มีความ Minimalist สูงสุด ลบโลโก้และฟิลด์ที่ไม่จำเป็นออกเพื่อให้พื้นที่แสดงข้อมูลมากที่สุด

---

## 🏗 Architecture

โปรเจคใช้ **Feature-based Clean Architecture** แยก Layer ชัดเจน (อ่านรายละเอียดได้ที่ [ARCHITECTURE.md](file:///d:/Users/naruechatbu/Work/__Personal__/DashboardGpilot/Frontend/ARCHITECTURE.md)):

```
src/
├── app/                        # Next.js App Router (Route Definitions)
│   ├── (auth)/                 # Route Group: Authenticated logic (Login/Register)
│   └── (Gpilot)/               # Route Group: requires sidebar layout
│       ├── dashboard/          # Home Overview
│       ├── account/            # My Account & Financials [NEW]
│       ├── analytics/          # Advanced Performance
│       └── history/            # Trade Logs
│
├── features/                   # Feature Modules (UI + Application Layer)
│   ├── auth/                   # Identity Management (Login, Register) [NEW]
│   ├── account/                # Account & Financial Metrics [NEW]
│   ├── dashboard/              # Dashboard feature
│   ├── analytics/
│   ├── history/
│   └── cashflow/
│
├── shared/                     # Shared cross-feature code
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

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables (.env)

| Variable | คำอธิบาย |
|----------|----------|
| `API_URL` | URL ของ Backend API (Internal) |
| `API_KEY` | Key สำหรับการ Authentication กับ Backend |
| `NEXT_PUBLIC_API_URL` | ตั้งค่าเป็น `/api/gateway` (Proxy Path) |
| `NEXT_PUBLIC_IS_MOCK_MODE` | ตั้งเป็น `true` เพื่อใช้ข้อมูลจำลอง (ข้อมูลใน History และ Account จะโหลดจาก Mock) |

### 3. คำสั่งที่สำคัญ (Scripts)

| คำสั่ง | คำอธิบาย |
|---------|-----------|
| `npm run dev` | รัน Development Server (Turbopack) |
| `npm run build` | บิลด์สำหรับ Production |
| `npm run test` | รันการทดสอบ (Watch Mode) |
| `npm run test:run` | รันการทดสอบครั้งเดียว |
| `npm run test:coverage` | ตรวจสอบ Code Coverage |
| `npm run lint` | ตรวจสอบ Code Quality (ESLint) |

---

## 🔄 Data Flow

```
User visits /dashboard
  → Server Component renders (static shell)
  → useDashboardData() hook fetches data client-side
  → apiClient("/api/v1/...") → Next.js Gateway Proxy (/api/gateway/*)
  → FastAPI Backend → MT5Client → MetaTrader 5
  → ServiceResponse<T> flows back to UI
```

---

---

## 🧪 Mock Mode

เมื่อตั้ง `NEXT_PUBLIC_IS_MOCK_MODE=true` ทุก Service จะคืนข้อมูลจำลอง ทำให้ทีม UI พัฒนาได้โดยไม่ต้องรอ Backend:

| Service | Mock Data |
|---------|-----------|
| `AccountService.getAccountInfo()` | Demo account, balance $10,000 |
| `TradeHistoryService.getHistory()` | 6 deals: XAUUSD, EURUSD, GBPUSD |

---

## 📌 API Layer Pattern

ตาม Global Rules #10 — ห้าม fetch ตรงจาก UI Component:

| Client | ใช้เมื่อ | Path |
|--------|---------|------|
| `apiClient` | Client Components | `/api/gateway/*` (proxy) |
| `apiServer` | Server Components / Server Actions | Direct backend URL |

ทุก Service คืนค่าในรูปแบบ `ServiceResponse<T>`:

```typescript
{
  success: boolean;
  data: T | null;
  error: string | ValidationErrorDetail[] | null;
}
```

---

## 📂 Naming Conventions

| สิ่ง | รูปแบบ | ตัวอย่าง |
|-----|--------|---------|
| React Components | PascalCase | `MetricCard.tsx` |
| Hooks | `use` prefix | `use-dashboard-data.ts` |
| Services | kebab-case | `account-service.ts` |
| Types/Interfaces | PascalCase | `AccountInfo`, `Deal` |
| Folders | kebab-case | `trade-history/` |
