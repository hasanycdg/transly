import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { handleStripeCheckoutSessionCompleted, syncWorkspaceBillingFromStripe } from "@/lib/stripe/billing";
import { getStripeClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      {
        error: "Missing Stripe webhook configuration."
      },
      { status: 400 }
    );
  }

  const payload = await request.text();
  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid Stripe webhook signature."
      },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleStripeCheckoutSessionCompleted(session.id);
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleStripeCheckoutSessionCompleted(session.id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncWorkspaceBillingFromStripe({
          customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
          subscriptionId: subscription.id
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json(
      {
        received: true
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Stripe webhook handling failed."
      },
      { status: 500 }
    );
  }
}
