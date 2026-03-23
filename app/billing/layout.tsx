import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { getDashboardShellData } from "@/lib/supabase/workspace";

export default async function BillingLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedUser("/billing");
  const shellData = await getDashboardShellData();

  return <DashboardShell shellData={shellData}>{children}</DashboardShell>;
}
