import { SupportScreen } from "@/components/support/support-screen";
import { getSettingsScreenData } from "@/lib/supabase/workspace";

export default async function SupportPage() {
  const data = await getSettingsScreenData();

  return <SupportScreen data={data} />;
}
