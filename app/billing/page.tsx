import { BillingScreen } from "@/components/billing/billing-screen";
import { getBillingScreenData } from "@/lib/supabase/workspace";

export default async function BillingPage() {
  const data = await getBillingScreenData();

  return <BillingScreen data={data} />;
}
