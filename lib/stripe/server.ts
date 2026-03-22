import "server-only";

import Stripe from "stripe";

import {
  getBillingPlanDefinition,
  isPaidBillingPlan,
  type BillingPlanDefinition,
  type BillingPlanId
} from "@/lib/billing/plans";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("Missing STRIPE_SECRET_KEY in the server environment.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(apiKey, {
      appInfo: {
        name: "Translayr"
      }
    });
  }

  return stripeClient;
}

export function getStripePlanLookupKey(planId: BillingPlanId) {
  return `translayr_${planId}_eur_monthly_v1`;
}

export function getStripeBillingPortalConfigId() {
  const value = process.env.STRIPE_BILLING_PORTAL_CONFIG_ID?.trim();

  return value && value.length > 0 ? value : null;
}

export async function ensureStripePrice(planInput: BillingPlanDefinition | BillingPlanId | string) {
  const plan = typeof planInput === "string" ? getBillingPlanDefinition(planInput) : planInput;

  if (!isPaidBillingPlan(plan)) {
    throw new Error("The free plan does not use a Stripe price.");
  }

  const stripe = getStripeClient();
  const lookupKey = getStripePlanLookupKey(plan.id);
  const existingPrices = await stripe.prices.list({
    active: true,
    lookup_keys: [lookupKey],
    limit: 1
  });

  const existingPrice = existingPrices.data[0];

  if (existingPrice) {
    return existingPrice;
  }

  const product = await ensureStripeProduct(plan);

  return stripe.prices.create({
    currency: "eur",
    unit_amount: plan.basePriceCents,
    recurring: {
      interval: "month"
    },
    lookup_key: lookupKey,
    nickname: `${plan.name} Monthly`,
    product: product.id,
    metadata: {
      app: "translayr",
      plan_id: plan.id,
      plan_name: plan.name,
      credits_limit: String(plan.creditsLimit),
      amount_cents: String(plan.basePriceCents)
    }
  });
}

export function resolvePlanFromStripeSubscription(
  subscription: Stripe.Subscription
): BillingPlanDefinition | null {
  const metadataPlanId = subscription.metadata?.plan_id?.trim().toLowerCase();

  if (metadataPlanId) {
    return getBillingPlanDefinition(metadataPlanId);
  }

  for (const item of subscription.items.data) {
    const lookupKey = item.price.lookup_key?.trim().toLowerCase();

    if (lookupKey?.startsWith("translayr_")) {
      const segments = lookupKey.split("_");
      const planId = segments[1];

      if (planId) {
        return getBillingPlanDefinition(planId);
      }
    }

    const pricePlanId = item.price.metadata?.plan_id?.trim().toLowerCase();

    if (pricePlanId) {
      return getBillingPlanDefinition(pricePlanId);
    }

    if (
      item.price.product &&
      typeof item.price.product !== "string" &&
      !("deleted" in item.price.product && item.price.product.deleted)
    ) {
      const productPlanId = item.price.product.metadata?.plan_id?.trim().toLowerCase();

      if (productPlanId) {
        return getBillingPlanDefinition(productPlanId);
      }
    }
  }

  return null;
}

async function ensureStripeProduct(plan: BillingPlanDefinition) {
  const stripe = getStripeClient();
  const products = await stripe.products.list({
    active: true,
    limit: 100
  });

  const existingProduct = products.data.find(
    (product) => product.metadata?.app === "translayr" && product.metadata?.plan_id === plan.id
  );

  if (existingProduct) {
    return existingProduct;
  }

  return stripe.products.create({
    name: plan.name,
    description: `${plan.creditsLimit.toLocaleString("en-US")} words per month`,
    metadata: {
      app: "translayr",
      plan_id: plan.id,
      plan_name: plan.name,
      credits_limit: String(plan.creditsLimit)
    }
  });
}
