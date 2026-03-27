# DashboardGpilot — Frontend

> Real-time Trading Dashboard สำหรับนักเทรด Forex เชื่อมต่อกับ MetaTrader 5 ผ่าน Backend API

---

| Category | Technology |
|------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript 5 (Strict Mode) |
| UI Library | MUI v7 (Material UI) |
| Charts | @mui/x-charts v8 |
| Data Grid | @mui/x-data-grid v8 |
| Styling | Emotion + TailwindCSS v4 |
| **Unit Testing** | **Vitest** |
| **UI Testing** | **React Testing Library + happy-dom** |
| **Coverage** | **v8 (@vitest/coverage-v8)** |

---

## 🏗 Architecture

โปรเจคใช้ **Feature-based Clean Architecture** แยก Layer ชัดเจน:

```
src/
├── app/                        # Next.js App Router (Route Definitions)
│   └── (Gpilot)/               # Route Group: requires sidebar layout
│       ├── dashboard/
│       ├── analytics/
│       ├── cashflow/
│       └── history/
│
├── features/                   # Feature Modules (UI + Application Layer)
│   ├── dashboard/              # Dashboard feature
│   │   ├── DashboardPage.tsx   # Page component (Server Component)
│   │   ├── components/         # Feature-specific UI components
│   │   └── hooks/              # Feature-specific hooks (Client-side)
│   ├── analytics/
│   ├── cashflow/
│   └── history/
│
├── shared/                     # Shared cross-feature code
│   ├── api/                    # Infrastructure: API clients
│   │   ├── client.ts           # apiClient — สำหรับ Client Components (/api/gateway proxy)
│   │   └── server.ts           # apiServer — สำหรับ Server Components (direct backend URL)
│   ├── services/               # Application Layer: Business logic + data fetching
│   │   ├── account-service.ts
│   │   └── trade-history-service.ts
│   │   └── __tests__/          # Service Unit Tests
│   ├── ui/                     # Shared reusable UI components
│   │   ├── metric-card.tsx
│   │   └── __tests__/          # Component UI Tests
│   ├── types/                  # Domain Types (shared TypeScript interfaces)
│   ├── config/                 # Configuration (theme, etc.)
│   └── utils/                  # Utility Functions
│       └── __tests__/          # Utils Unit Tests
│
├── tests/                      # Global Test Setup & Mocks
├── layouts/                    # Shared layout components (Sidebar, Header)
└── proxy.ts                    # Next.js Middleware (Auth guard / Gateway routing)
```

---

## 🧪 Testing Strategy

ยึดตาม **Global Rule #6** โดยครอบคลุมทั้ง 3 ระดับ:

- **Unit Tests:** สำหรับ Business Logic, Domain Logic และ Utility Functions (เครื่องมือ: Vitest)
- **Integration Tests:** สำหรับ API Clients, Service Workers (เครื่องมือ: Vitest + Vitest Mocks)
- **Component Tests:** สำหรับ UI Components (เครื่องมือ: React Testing Library + happy-dom)

> [!IMPORTANT]
> **เป้าหมาย Code Coverage:** ต้องพยายามรักษาให้อยู่ที่อย่างน้อย **80%** เพื่อความยั่งยืนของโปรเจกต์

---

## ⚙️ Getting Started

### 0. Prerequisites

- **Node.js:** เวอร์ชั่น 18.x ขึ้นไป (แนะนำ **v22.19.0** — มีไฟล์ `.nvmrc` ให้)
- **NPM:** เวอร์ชั่น 10.x ขึ้นไป

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

คัดลอกไฟล์ต้นแบบและปรับแต่งค่าตามต้องการ:

```bash
cp .env.example .env.local
```

| Variable | คำอธิบาย |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | URL ของ Backend API |
| `NEXT_PUBLIC_IS_MOCK_MODE` | ตั้งเป็น `true` เพื่อใช้ข้อมูลจำลอง (แนะนำสำหรับการพัฒนา UI) |
| `NEXT_PUBLIC_API_KEY` | (Optional) สำหรับการดึงข้อมูลจาก MT5 ที่ต้องใช้ Key |

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
