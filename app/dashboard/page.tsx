import { DashboardHomeScreen } from "@/components/dashboard/dashboard-home-screen";
import { getProjectsOverviewData } from "@/lib/supabase/workspace";

export default async function DashboardPage() {
  const data = await getProjectsOverviewData();

  return <DashboardHomeScreen data={data} />;
}
