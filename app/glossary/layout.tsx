import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";
import { getDashboardShellData } from "@/lib/supabase/workspace";

export default async function GlossaryLayout({
  children
}: {
  children: ReactNode;
}) {
  const shellData = await getDashboardShellData();

  return <DashboardShell shellData={shellData}>{children}</DashboardShell>;
}
