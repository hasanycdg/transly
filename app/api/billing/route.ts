import { NextResponse } from "next/server";

import { getBillingScreenData, updateBillingPlan } from "@/lib/supabase/workspace";

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

    const data = await updateBillingPlan(planId);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Billing plan could not be updated.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /required|supported/i.test(message) ? 400 : 500
      }
    );
  }
}
