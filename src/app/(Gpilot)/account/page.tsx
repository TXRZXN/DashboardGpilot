import { AccountPage } from "@/features/account";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | GPilotDashboard",
  description: "Manage your GPilot trading account.",
};

export default function Page() {
  return <AccountPage />;
}
