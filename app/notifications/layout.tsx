import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { getDashboardShellData } from "@/lib/supabase/workspace";

export default async function NotificationsLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedUser("/notifications");
  const shellData = await getDashboardShellData();

  return <DashboardShell shellData={shellData}>{children}</DashboardShell>;
}
