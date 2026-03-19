import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";

export default function GlossaryLayout({
  children
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
