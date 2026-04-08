import { BillingScreen } from "@/components/billing/billing-screen";
import { handleStripeCheckoutSessionCompleted, syncWorkspaceBillingFromStripe } from "@/lib/stripe/billing";
import { getBillingScreenData } from "@/lib/supabase/workspace";

type BillingPageProps = {
  searchParams: Promise<{
    checkout?: string;
    intent?: string;
    portal?: string;
    session_id?: string;
  }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;

  if (params.checkout === "success" && typeof params.session_id === "string" && params.session_id.length > 0) {
    await handleStripeCheckoutSessionCompleted(params.session_id);
  } else if (params.portal === "returned") {
    await syncWorkspaceBillingFromStripe();
  }

  const data = await getBillingScreenData();

  return <BillingScreen data={data} />;
}
