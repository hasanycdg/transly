import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";

export default function UsageLayout({
  children
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
