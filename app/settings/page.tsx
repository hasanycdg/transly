import { SettingsScreen } from "@/components/settings/settings-screen";
import { getSettingsScreenData } from "@/lib/supabase/workspace";
import type { SettingsSectionId } from "@/types/workspace";

type SettingsPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

const SETTINGS_SECTION_IDS = new Set<SettingsSectionId>([
  "profile",
  "translation",
  "preferences",
  "notifications",
  "support",
  "danger"
]);

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const data = await getSettingsScreenData();
  const requestedSection = params.section;
  const initialSection =
    typeof requestedSection === "string" && SETTINGS_SECTION_IDS.has(requestedSection as SettingsSectionId)
      ? (requestedSection as SettingsSectionId)
      : "translation";

  return <SettingsScreen data={data} initialSection={initialSection} />;
}
