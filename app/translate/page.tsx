import { TextTranslationScreen } from "@/components/translation/text-translation-screen";
import { getSettingsScreenData } from "@/lib/supabase/workspace";

export default async function TranslatePage() {
  const settings = await getSettingsScreenData();

  return (
    <TextTranslationScreen
      defaultTargetLanguage={settings.translation.targetLanguage}
      defaultToneStyle={settings.translation.toneStyle}
    />
  );
}
