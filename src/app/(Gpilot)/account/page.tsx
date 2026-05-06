import { AccountPage, type AccountInitialData } from "@/features/account";
import type { Metadata } from "next";
import { apiServer } from "@/shared/api/api-server";
import { SUB_ENDPOINTS, API_GATEWAY_SUB } from "@/shared/api/endpoint";
import type { ServiceResponse, AccountProfile, AccountFinance, GroupedTradesResponse } from "@/shared/types/api";

export const metadata: Metadata = {
  title: "Account | GPilot Product",
  description: "Manage your GPilot trading account.",
};

export default async function Page() {
  let initialData: AccountInitialData = {};

  try {
    // ดึงข้อมูลพื้นฐานทั้งหมดตั้งแต่บน Server เพื่อให้หน้าเว็บ Render ได้ทันที
    const [profileRes, financeRes, tradesRes] = await Promise.all([
      apiServer<ServiceResponse<AccountProfile[]>>(
        SUB_ENDPOINTS.ACCOUNT_PROFILE,
        { cache: 'no-store' },
        undefined,
        API_GATEWAY_SUB
      ),
      apiServer<ServiceResponse<AccountFinance[]>>(
        SUB_ENDPOINTS.ACCOUNT_FINANCE,
        { cache: 'no-store' },
        undefined,
        API_GATEWAY_SUB
      ),
      apiServer<ServiceResponse<GroupedTradesResponse[]>>(
        SUB_ENDPOINTS.ACCOUNT_TRADES,
        { cache: 'no-store' },
        { page: 1, limit: 10 },
        API_GATEWAY_SUB
      ),
    ]);

    initialData = {
      profile: profileRes.success ? profileRes.data : null,
      finance: financeRes.success ? financeRes.data : null,
      tradesData: tradesRes.success ? tradesRes.data : null,
    };
  } catch (error) {
    console.error("Failed to fetch account initial data on server:", error);
    // ถ้าเฟลบน Server หน้าเว็บยังคงทำงานได้โดยจะไปพึ่งพา Client-side data fetching แทน
  }

  return <AccountPage initialData={initialData} />;
}
