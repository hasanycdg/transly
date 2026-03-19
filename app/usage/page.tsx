import { UsageScreen } from "@/components/usage/usage-screen";
import { getUsageScreenData } from "@/lib/supabase/workspace";

export default async function UsagePage() {
  const data = await getUsageScreenData();

  return <UsageScreen data={data} />;
}
