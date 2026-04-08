import "server-only";

import Stripe from "stripe";

import {
  getCreditPackDefinition,
  type CreditPackDefinition,
  type CreditPackId
} from "@/lib/billing/credit-packs";
import {
  getBillingPlanDefinition,
  isPaidBillingPlan,
  type BillingPlanDefinition,
  type BillingPlanId
} from "@/lib/billing/plans";

const STRIPE_API_VERSION = "2026-02-25.clover";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("Missing STRIPE_SECRET_KEY in the server environment.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(apiKey, {
      apiVersion: STRIPE_API_VERSION,
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

export function getStripeCreditPackLookupKey(packId: CreditPackId) {
  return `translayr_${packId}_eur_once_v1`;
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
  const explicitPriceId = getStripePlanPriceIdFromEnv(plan.id);

  if (explicitPriceId) {
    return retrieveStripePrice(explicitPriceId);
  }

  const lookupKey = getStripePlanLookupKey(plan.id);
  const existingByLookupKey = await stripe.prices.list({
    active: true,
    lookup_keys: [lookupKey],
    limit: 1
  });

  if (existingByLookupKey.data[0]) {
    return existingByLookupKey.data[0];
  }

  const existingByShape = await findPlanPriceByShape(plan);

  if (existingByShape) {
    return existingByShape;
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

export async function ensureStripeCreditPackPrice(
  packInput: CreditPackDefinition | CreditPackId | string
) {
  const pack = typeof packInput === "string" ? getCreditPackDefinition(packInput) : packInput;

  if (!pack) {
    throw new Error("Unsupported credit pack.");
  }

  const stripe = getStripeClient();
  const explicitPriceId = getStripeCreditPackPriceIdFromEnv(pack.id);

  if (explicitPriceId) {
    return retrieveStripePrice(explicitPriceId);
  }

  const lookupKey = getStripeCreditPackLookupKey(pack.id);
  const existingByLookupKey = await stripe.prices.list({
    active: true,
    lookup_keys: [lookupKey],
    limit: 1
  });

  if (existingByLookupKey.data[0]) {
    return existingByLookupKey.data[0];
  }

  const existingByShape = await findCreditPackPriceByShape(pack);

  if (existingByShape) {
    return existingByShape;
  }

  const product = await ensureStripeCreditPackProduct(pack);

  return stripe.prices.create({
    currency: "eur",
    unit_amount: pack.priceCents,
    lookup_key: lookupKey,
    nickname: `${pack.name} One-time`,
    product: product.id,
    metadata: {
      app: "translayr",
      credit_pack_id: pack.id,
      credit_pack_name: pack.name,
      credits: String(pack.credits),
      amount_cents: String(pack.priceCents)
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

    const product = getExpandedStripeProduct(item.price.product);

    if (product) {
      const productPlanId = product.metadata?.plan_id?.trim().toLowerCase();

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
    (product) =>
      (product.metadata?.app === "translayr" && product.metadata?.plan_id === plan.id) ||
      normalizeText(product.name) === normalizeText(plan.name)
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

async function ensureStripeCreditPackProduct(pack: CreditPackDefinition) {
  const stripe = getStripeClient();
  const products = await stripe.products.list({
    active: true,
    limit: 100
  });

  const existingProduct = products.data.find(
    (product) =>
      (product.metadata?.app === "translayr" && product.metadata?.credit_pack_id === pack.id) ||
      normalizeText(product.name) === normalizeText(pack.name)
  );

  if (existingProduct) {
    return existingProduct;
  }

  return stripe.products.create({
    name: pack.name,
    description: `${pack.credits.toLocaleString("en-US")} one-time credits`,
    metadata: {
      app: "translayr",
      credit_pack_id: pack.id,
      credit_pack_name: pack.name,
      credits: String(pack.credits)
    }
  });
}

async function findPlanPriceByShape(plan: BillingPlanDefinition) {
  const stripe = getStripeClient();
  const prices = await stripe.prices.list({
    active: true,
    currency: "eur",
    type: "recurring",
    limit: 100,
    expand: ["data.product"]
  });

  return (
    prices.data.find((price) => {
      if (price.unit_amount !== plan.basePriceCents || price.recurring?.interval !== "month") {
        return false;
      }

      const lookupKey = price.lookup_key?.trim().toLowerCase();

      if (lookupKey === getStripePlanLookupKey(plan.id)) {
        return true;
      }

      const pricePlanId = price.metadata?.plan_id?.trim().toLowerCase();

      if (pricePlanId === plan.id) {
        return true;
      }

      const product = getExpandedStripeProduct(price.product);

      if (!product) {
        return false;
      }

      return (
        product.metadata?.plan_id?.trim().toLowerCase() === plan.id ||
        normalizeText(product.name) === normalizeText(plan.name)
      );
    }) ?? null
  );
}

async function findCreditPackPriceByShape(pack: CreditPackDefinition) {
  const stripe = getStripeClient();
  const prices = await stripe.prices.list({
    active: true,
    currency: "eur",
    type: "one_time",
    limit: 100,
    expand: ["data.product"]
  });

  return (
    prices.data.find((price) => {
      if (price.unit_amount !== pack.priceCents || price.recurring) {
        return false;
      }

      const lookupKey = price.lookup_key?.trim().toLowerCase();

      if (lookupKey === getStripeCreditPackLookupKey(pack.id)) {
        return true;
      }

      const pricePackId = price.metadata?.credit_pack_id?.trim().toLowerCase();

      if (pricePackId === pack.id) {
        return true;
      }

      const product = getExpandedStripeProduct(price.product);

      if (!product) {
        return false;
      }

      return (
        product.metadata?.credit_pack_id?.trim().toLowerCase() === pack.id ||
        normalizeText(product.name) === normalizeText(pack.name)
      );
    }) ?? null
  );
}

async function retrieveStripePrice(priceId: string) {
  const stripe = getStripeClient();
  const price = await stripe.prices.retrieve(priceId.trim());

  if (!price.active) {
    throw new Error(`Configured Stripe price ${price.id} is not active.`);
  }

  return price;
}

function getStripePlanPriceIdFromEnv(planId: BillingPlanId) {
  const envKey =
    planId === "starter"
      ? "STRIPE_PRICE_ID_STARTER"
      : planId === "pro"
        ? "STRIPE_PRICE_ID_PRO"
        : planId === "scale"
          ? "STRIPE_PRICE_ID_SCALE"
          : null;

  if (!envKey) {
    return null;
  }

  return getTrimmedEnvValue(envKey);
}

function getStripeCreditPackPriceIdFromEnv(packId: CreditPackId) {
  const envKey =
    packId === "credit_10k"
      ? "STRIPE_PRICE_ID_CREDIT_10K"
      : packId === "credit_30k"
        ? "STRIPE_PRICE_ID_CREDIT_30K"
        : "STRIPE_PRICE_ID_CREDIT_50K";

  return getTrimmedEnvValue(envKey);
}

function getTrimmedEnvValue(key: string) {
  const value = process.env[key]?.trim();

  return value && value.length > 0 ? value : null;
}

function getExpandedStripeProduct(
  product: Stripe.Price["product"]
): Stripe.Product | null {
  if (!product || typeof product === "string") {
    return null;
  }

  if ("deleted" in product && product.deleted) {
    return null;
  }

  return product;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
