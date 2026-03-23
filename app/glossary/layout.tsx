import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { getDashboardShellData } from "@/lib/supabase/workspace";

export default async function GlossaryLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedUser("/glossary");
  const shellData = await getDashboardShellData();

  return <DashboardShell shellData={shellData}>{children}</DashboardShell>;
}
