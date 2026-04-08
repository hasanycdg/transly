import { NextResponse } from "next/server";

import { startBillingPlanSelection } from "@/lib/stripe/billing";
import { getBillingScreenData } from "@/lib/supabase/workspace";

export async function GET() {
  try {
    const data = await getBillingScreenData();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Billing data could not be loaded."
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as { planId?: string };
    const planId = payload.planId?.trim().toLowerCase();

    if (!planId) {
      return NextResponse.json(
        {
          error: "A billing plan is required."
        },
        { status: 400 }
      );
    }

    const result = await startBillingPlanSelection(planId, new URL(request.url).origin);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Billing PATCH failed", error);
    const message = error instanceof Error ? error.message : "Billing plan could not be updated.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /required|supported|linked/i.test(message) ? 400 : 500
      }
    );
  }
}
