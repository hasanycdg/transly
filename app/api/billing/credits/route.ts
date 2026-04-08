import { NextResponse } from "next/server";

import { startCreditPackPurchase } from "@/lib/stripe/billing";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { packId?: string };
    const packId = payload.packId?.trim().toLowerCase();

    if (!packId) {
      return NextResponse.json(
        {
          error: "A credit pack is required."
        },
        { status: 400 }
      );
    }

    const result = await startCreditPackPurchase(packId, new URL(request.url).origin);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Credit purchase could not be started.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /required|supported|active subscription/i.test(message) ? 400 : 500
      }
    );
  }
}
