import { AddPortPage } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Port | GPilot Product",
  description: "Add a new MT5 account to your GPilot profile.",
};

export default function Page() {
  return <AddPortPage />;
}
