import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/projects/dashboard-shell";
import { PRIVATE_ROBOTS_METADATA } from "@/lib/seo/metadata";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { getDashboardShellData } from "@/lib/supabase/workspace";

export const metadata: Metadata = {
  robots: PRIVATE_ROBOTS_METADATA
};

export default async function NotificationsLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedUser("/notifications");
  const shellData = await getDashboardShellData();

  return <DashboardShell shellData={shellData}>{children}</DashboardShell>;
}
