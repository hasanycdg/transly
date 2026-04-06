import { DeveloperApiScreen } from "@/components/developer-api/developer-api-screen";
import { getSettingsScreenData } from "@/lib/supabase/workspace";

export default async function DeveloperApiPage() {
  const data = await getSettingsScreenData();
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    process.env.BACKEND_API_BASE_URL?.trim() ||
    "http://localhost:4001/api";

  return <DeveloperApiScreen data={data} backendBaseUrl={backendBaseUrl} />;
}
