import { LoginPage } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | GPilotDashboard",
  description: "Access your GPilot trading account.",
};

export default function Page() {
  return <LoginPage />;
}
