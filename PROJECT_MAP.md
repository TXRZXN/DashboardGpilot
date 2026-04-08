# 🗺 Project Map — DashboardGpilot Frontend

> **Purpose:** This document acts as a "Table of Contents" for the AI coding assistant and developers to quickly locate logic and understand the project layout without scanning every file.

---

## 🏛 Architecture Layers

Following **Feature-based Clean Architecture**:

| Layer | Directory | Responsibility |
| :--- | :--- | :--- |
| **Presentation** | `src/features/`, `src/app/`, `src/shared/ui/` | UI Components, Routing, User Interaction |
| **Application** | `src/shared/services/`, `src/features/*/hooks/` | Business Flow Orchestration & Hooks |
| **Domain** | `src/shared/types/` | Data Models & Business Rules (Pure Types) |
| **Infrastructure** | `src/shared/api/`, `src/shared/utils/` | API Clients, Tracing, Logger, External Tools |

---

## 📂 Feature Directory Map (`src/features/`)

Each folder contains feature-specific UI and local hooks.

- 👤 **`account/`**: User account management, profile settings, and MT5 account linking.
- 🔑 **`auth/`**: Login, registration, and token management UI.
- 💸 **`cashflow/`**: Transaction history, deposits, and withdrawals logic/UI.
- 📊 **`dashboard/`**: Main analytics overview, performance charts, and summary cards.
- 📜 **`history/`**: Detailed trade logs and historical performance data.

---

## 🛠 Shared Logic Map (`src/shared/`)

The backbone of the application.

### 🌐 API & Infrastructure (`shared/api/`)

- **[client.ts](file:///d:/EAGold/Gpliot/GPilotFrontEnd/src/shared/api/client.ts)**: Central API gateway. Handles Auth headers, `X-Trace-ID`, and error mapping.
- **[endpoint.ts](file:///d:/EAGold/Gpliot/GPilotFrontEnd/src/shared/api/endpoint.ts)**: Registry of all Backend API endpoints.

### ⚙️ Services (`shared/services/`)

*Application logic that connects UI to API.*

- **`account-service.ts`**: Handles account summaries and linking.
- **`auth-service.ts`**: Logic for login, signup, and session management.
- **`trade-history-service.ts`**: Complex logic for fetching and formatting trade logs.
- **`analytics-service.ts`**: Logic for aggregating stats for charts.

### 🧩 UI & Components (`shared/ui/`)

*Universal reusable components.*

- **`DataTable`**: Generic table with sorting/filtering.
- **`Charts`**: Reusable Recharts wrappers.
- **`RiskMetrics`**: Specialized components for displaying trading risk.

---

## 🧭 Navigation Shortcuts (Where to find...?)

| If you want to... | Look in... |
| :--- | :--- |
| Change the Backend URL | [`.env`](file:///d:/EAGold/Gpliot/GPilotFrontEnd/.env) or [`shared/api/client.ts`](file:///d:/EAGold/Gpliot/GPilotFrontEnd/src/shared/api/client.ts) |
| Add a new API endpoint | [`shared/api/endpoint.ts`](file:///d:/EAGold/Gpliot/GPilotFrontEnd/src/shared/api/endpoint.ts) |
| Fix a Login bug | [`shared/services/auth-service.ts`](file:///d:/EAGold/Gpliot/GPilotFrontEnd/src/shared/services/auth-service.ts) |
| Modify the Dashboard UI | [`features/dashboard/DashboardPage.tsx`](file:///d:/EAGold/Gpliot/GPilotFrontEnd/src/features/dashboard/DashboardPage.tsx) |
| Change global styles | [`styles/globals.css`](file:///d:/EAGold/Gpliot/GPilotFrontEnd/styles/globals.css) |
| Adjust UI Theme/Colors | `src/shared/ui/` (search for theme provider or CSS variables) |

---

## 📜 Maintenance Note

> [!IMPORTANT]
> When adding a new **Feature** or **Service**, please update this map to ensure AI assistants stay synchronized with the codebase structure.
