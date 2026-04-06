import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { getDashboardShellData } from "@/lib/supabase/workspace";

export default async function DeveloperApiLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedUser("/developer-api");
  const shellData = await getDashboardShellData();

  return <DashboardShell shellData={shellData}>{children}</DashboardShell>;
}
