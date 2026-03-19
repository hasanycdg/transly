import { GlossaryScreen } from "@/components/glossary/glossary-screen";
import { getGlossaryScreenData } from "@/lib/supabase/workspace";

export default async function GlossaryPage() {
  const data = await getGlossaryScreenData();

  return <GlossaryScreen data={data} />;
}
