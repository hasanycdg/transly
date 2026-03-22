import { NextResponse } from "next/server";

import { createBillingPortalSession } from "@/lib/stripe/billing";

export async function POST(request: Request) {
  try {
    const redirectUrl = await createBillingPortalSession(new URL(request.url).origin);

    return NextResponse.json(
      {
        redirectUrl
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Billing portal could not be opened.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /linked/i.test(message) ? 400 : 500
      }
    );
  }
}
