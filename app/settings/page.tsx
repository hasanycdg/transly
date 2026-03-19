import { SettingsScreen } from "@/components/settings/settings-screen";
import { getSettingsScreenData } from "@/lib/supabase/workspace";

export default async function SettingsPage() {
  const data = await getSettingsScreenData();

  return <SettingsScreen data={data} />;
}
