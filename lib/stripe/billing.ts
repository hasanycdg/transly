import "server-only";

import type Stripe from "stripe";

import {
  BILLING_CREDIT_PACKS,
  getCreditPackDefinition,
  type CreditPackDefinition
} from "@/lib/billing/credit-packs";
import {
  DEFAULT_WORKSPACE_PLAN_ID,
  getBillingPlanDefinition,
  isPaidBillingPlan,
  type BillingPlanDefinition
} from "@/lib/billing/plans";
import { createServerSupabaseClient } from "@/lib/supabase/admin";
import { getBillingScreenData } from "@/lib/supabase/workspace";
import {
  ensureStripeCreditPackPrice,
  ensureStripePrice,
  getStripeBillingPortalConfigId,
  getStripeClient,
  resolvePlanFromStripeSubscription
} from "@/lib/stripe/server";
import type { BillingScreenData } from "@/types/workspace";

type WorkspaceRow = {
  id: string;
  slug: string;
  name: string;
  plan_name: string;
  avatar_label: string;
  credits_limit: number | null;
};

type WorkspaceSettingsRow = {
  workspace_id: string;
  metadata: Record<string, unknown> | null;
};

type BillingCycleRow = {
  id: string;
  period_start: string;
  period_end: string;
  credits_used: number;
  projected_spend_cents: number;
  credits_limit: number;
  status: "active" | "closed" | "projected";
  metadata: Record<string, unknown> | null;
};

type WorkspaceCreditPurchaseRow = {
  id: string;
  status: "pending" | "completed" | "failed";
};

type StripeWorkspaceMetadata = {
  profileEmail?: string;
  profileName?: string;
  stripeCustomerId?: string;
  stripeCurrentPeriodStart?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: string;
};

type StripeWorkspaceContext = {
  workspace: WorkspaceRow;
  settings: WorkspaceSettingsRow;
  rawMetadata: Record<string, unknown>;
  metadata: StripeWorkspaceMetadata;
};

export type BillingMutationResult = {
  data?: BillingScreenData;
  redirectMode?: "checkout" | "portal";
  redirectUrl?: string;
};

const DEFAULT_WORKSPACE_NAME = "Workspace";
const DEFAULT_WORKSPACE_SLUG = "workspace";
const DEFAULT_WORKSPACE_AVATAR_LABEL = "W";
const DEFAULT_WORKSPACE_PLAN = getBillingPlanDefinition(DEFAULT_WORKSPACE_PLAN_ID);

export async function startBillingPlanSelection(
  planId: string,
  origin: string
): Promise<BillingMutationResult> {
  const selectedPlan = getBillingPlanDefinition(planId);
  const context = await getStripeWorkspaceContext();
  const subscription = await getCurrentStripeSubscription(context);

  if (!isPaidBillingPlan(selectedPlan)) {
    if (subscription && isManagedInStripe(subscription)) {
      const redirectUrl = await createStripePortalUrl(context, origin);

      return {
        redirectMode: "portal",
        redirectUrl
      };
    }

    await persistWorkspacePlanState(context, selectedPlan, {
      stripeCustomerId: context.metadata.stripeCustomerId ?? null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null
    });

    return {
      data: await getBillingScreenData()
    };
  }

  if (subscription && isManagedInStripe(subscription)) {
    const updatedSubscription = await changeStripeSubscriptionPlan(context, subscription, selectedPlan);
    await syncWorkspaceBillingFromStripe({
      customerId: getStripeObjectId(updatedSubscription.customer) ?? undefined,
      subscriptionId: updatedSubscription.id
    });

    return {
      data: await getBillingScreenData()
    };
  }

  const checkoutUrl = await createStripeCheckoutUrl(context, selectedPlan, origin);

  return {
    redirectMode: "checkout",
    redirectUrl: checkoutUrl
  };
}

export async function startCreditPackPurchase(
  packId: string,
  origin: string
): Promise<BillingMutationResult> {
  const pack = getCreditPackDefinition(packId);

  if (!pack) {
    throw new Error("A supported credit pack is required.");
  }

  const context = await getStripeWorkspaceContext();
  const subscription = await getCurrentStripeSubscription(context);

  if (!subscription || !isEligibleSubscriptionForCreditPackPurchase(subscription)) {
    throw new Error("An active subscription is required before purchasing credit packs.");
  }

  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomer(context);
  const price = await ensureStripeCreditPackPrice(pack);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    client_reference_id: context.workspace.id,
    success_url: `${sanitizeOrigin(origin)}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}&intent=credits`,
    cancel_url: `${sanitizeOrigin(origin)}/billing?checkout=cancel&intent=credits`,
    line_items: [
      {
        price: price.id,
        quantity: 1
      }
    ],
    allow_promotion_codes: true,
    invoice_creation: {
      enabled: true
    },
    metadata: {
      workspace_id: context.workspace.id,
      checkout_kind: "credit_pack",
      credit_pack_id: pack.id,
      credits: String(pack.credits),
      amount_cents: String(pack.priceCents)
    }
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  await updateWorkspaceStripeMetadata(context, {
    stripeCustomerId: customerId
  });

  return {
    redirectMode: "checkout",
    redirectUrl: session.url
  };
}

export async function handleStripeCheckoutSessionCompleted(sessionId: string) {
  const normalizedSessionId = sessionId.trim();

  if (!normalizedSessionId) {
    throw new Error("A Stripe Checkout session id is required.");
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(normalizedSessionId, {
    expand: ["customer", "subscription", "line_items.data.price.product"]
  });

  if (isCreditPackCheckoutSession(session)) {
    await applyCreditPackPurchaseFromCheckoutSession(session);
  }

  await syncWorkspaceBillingFromStripe({
    sessionId: session.id
  });
}

export async function createBillingPortalSession(origin: string): Promise<string> {
  const context = await getStripeWorkspaceContext();

  if (!context.metadata.stripeCustomerId) {
    throw new Error("No Stripe customer is linked to this workspace yet.");
  }

  return createStripePortalUrl(context, origin);
}

export async function syncWorkspaceBillingFromStripe(input?: {
  customerId?: string;
  sessionId?: string;
  subscriptionId?: string;
}) {
  const stripe = getStripeClient();
  const context = await getStripeWorkspaceContext();
  let customerId = input?.customerId?.trim() || context.metadata.stripeCustomerId;
  let subscriptionId = input?.subscriptionId?.trim() || context.metadata.stripeSubscriptionId;

  if (input?.sessionId?.trim()) {
    const session = await stripe.checkout.sessions.retrieve(input.sessionId.trim(), {
      expand: ["customer", "subscription"]
    });

    customerId = getStripeObjectId(session.customer) ?? customerId;
    subscriptionId = getStripeObjectId(session.subscription) ?? subscriptionId;
  }

  let subscription: Stripe.Subscription | null = null;

  if (subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } else if (customerId) {
    subscription = await findPrimarySubscription(customerId);
  }

  if (!subscription || !isManagedInStripe(subscription)) {
    await persistWorkspacePlanState(context, DEFAULT_WORKSPACE_PLAN, {
      stripeCustomerId: customerId ?? null,
      stripeCurrentPeriodStart: null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: subscription?.status ?? null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null
    });

    return;
  }

  const resolvedPlan = resolvePlanFromStripeSubscription(subscription) ?? DEFAULT_WORKSPACE_PLAN;

  await persistWorkspacePlanState(context, resolvedPlan, {
    stripeCustomerId: customerId ?? getStripeObjectId(subscription.customer) ?? null,
    stripeCurrentPeriodStart: formatStripePeriodBoundary(getStripeSubscriptionPeriodStart(subscription)),
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: subscription.status,
    stripePriceId: subscription.items.data[0]?.price.id ?? null,
    stripeCurrentPeriodEnd: formatStripePeriodBoundary(getStripeSubscriptionPeriodEnd(subscription))
  });
}

async function createStripeCheckoutUrl(
  context: StripeWorkspaceContext,
  plan: BillingPlanDefinition,
  origin: string
) {
  const stripe = getStripeClient();
  const price = await ensureStripePrice(plan);
  const customerId = await ensureStripeCustomer(context);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: context.workspace.id,
    success_url: `${sanitizeOrigin(origin)}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${sanitizeOrigin(origin)}/billing?checkout=cancel`,
    line_items: [
      {
        price: price.id,
        quantity: 1
      }
    ],
    allow_promotion_codes: true,
    metadata: {
      workspace_id: context.workspace.id,
      checkout_kind: "subscription_plan",
      plan_id: plan.id
    },
    subscription_data: {
      metadata: {
        workspace_id: context.workspace.id,
        plan_id: plan.id
      }
    }
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  await updateWorkspaceStripeMetadata(context, {
    stripeCustomerId: customerId
  });

  return session.url;
}

async function changeStripeSubscriptionPlan(
  context: StripeWorkspaceContext,
  subscription: Stripe.Subscription,
  plan: BillingPlanDefinition
) {
  const stripe = getStripeClient();
  const price = await ensureStripePrice(plan);
  const currentItem = subscription.items.data[0];

  if (!currentItem) {
    throw new Error("The current Stripe subscription has no subscription item to update.");
  }

  const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false,
    proration_behavior: "create_prorations",
    items: [
      {
        id: currentItem.id,
        price: price.id
      }
    ],
    metadata: {
      ...subscription.metadata,
      workspace_id: context.workspace.id,
      plan_id: plan.id
    }
  });

  return updatedSubscription;
}

async function createStripePortalUrl(context: StripeWorkspaceContext, origin: string) {
  const stripe = getStripeClient();
  const customerId = context.metadata.stripeCustomerId;

  if (!customerId) {
    throw new Error("No Stripe customer is linked to this workspace yet.");
  }

  const configuration = getStripeBillingPortalConfigId();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${sanitizeOrigin(origin)}/billing?portal=returned`,
    ...(configuration ? { configuration } : {})
  });

  return session.url;
}

async function ensureStripeCustomer(context: StripeWorkspaceContext) {
  if (context.metadata.stripeCustomerId) {
    const stripe = getStripeClient();

    try {
      const existingCustomer = await stripe.customers.retrieve(context.metadata.stripeCustomerId);

      if (typeof existingCustomer === "object" && "deleted" in existingCustomer && existingCustomer.deleted) {
        throw new Error("Deleted Stripe customer.");
      }

      return context.metadata.stripeCustomerId;
    } catch (error) {
      if (!isStripeResourceMissingError(error)) {
        throw error;
      }
    }
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: resolveBillingEmail(context),
    name: context.metadata.profileName ?? context.workspace.name,
    metadata: {
      app: "translayr",
      workspace_id: context.workspace.id,
      workspace_slug: context.workspace.slug
    }
  });

  await updateWorkspaceStripeMetadata(context, {
    stripeCustomerId: customer.id
  });

  return customer.id;
}

async function getCurrentStripeSubscription(context: StripeWorkspaceContext) {
  const customerId = context.metadata.stripeCustomerId;
  const subscriptionId = context.metadata.stripeSubscriptionId;
  const stripe = getStripeClient();

  if (subscriptionId) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price.product"]
      });
    } catch {
      return customerId ? findPrimarySubscription(customerId) : null;
    }
  }

  if (!customerId) {
    return null;
  }

  return findPrimarySubscription(customerId);
}

async function findPrimarySubscription(customerId: string) {
  const stripe = getStripeClient();

  let subscriptions: Stripe.ApiList<Stripe.Subscription>;

  try {
    subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10
    });
  } catch (error) {
    if (isStripeResourceMissingError(error)) {
      return null;
    }

    throw error;
  }

  return (
    subscriptions.data.find((subscription) => isManagedInStripe(subscription)) ??
    subscriptions.data[0] ??
    null
  );
}

async function applyCreditPackPurchaseFromCheckoutSession(session: Stripe.Checkout.Session) {
  const pack = resolveCreditPackFromCheckoutSession(session);

  if (!pack) {
    return;
  }

  const context = await getStripeWorkspaceContext();
  const workspaceIdFromSession = session.metadata?.workspace_id?.trim();

  if (workspaceIdFromSession && workspaceIdFromSession !== context.workspace.id) {
    return;
  }

  const supabase = createServerSupabaseClient();
  const { data: existingPurchaseData, error: existingPurchaseError } = await supabase
    .from("workspace_credit_purchases")
    .select("id, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existingPurchaseError) {
    throw new Error(`Failed to load the credit purchase status: ${existingPurchaseError.message}`);
  }

  const existingPurchase = (existingPurchaseData as WorkspaceCreditPurchaseRow | null) ?? null;

  if (existingPurchase?.status === "completed") {
    return;
  }

  const customerId = getStripeObjectId(session.customer) ?? context.metadata.stripeCustomerId ?? null;
  const paymentIntentId = getStripeObjectId(session.payment_intent);
  const purchaseRecordId =
    existingPurchase?.id ??
    (await insertPendingCreditPurchase({
      workspaceId: context.workspace.id,
      checkoutSessionId: session.id,
      customerId,
      paymentIntentId,
      pack
    }));
  const activeCycle = await getOrCreateActiveCycleForCreditPackPurchase(context);
  const cycleMetadata = normalizeCycleMetadata(activeCycle.metadata);
  const appliedSessionIds = getAppliedCreditPurchaseSessionIds(cycleMetadata);

  if (appliedSessionIds.includes(session.id)) {
    await markCreditPurchaseCompleted(purchaseRecordId, activeCycle.id);
    return;
  }

  const nextCreditsLimit = activeCycle.credits_limit + pack.credits;
  const nextProjectedSpend = activeCycle.projected_spend_cents + pack.priceCents;
  const nextCycleMetadata: Record<string, unknown> = {
    ...cycleMetadata,
    credit_topup_credits_total: getCycleCreditTopUpTotal(cycleMetadata) + pack.credits,
    credit_topup_spend_cents_total: getCycleSpendTopUpTotal(cycleMetadata) + pack.priceCents,
    applied_credit_purchase_session_ids: [...appliedSessionIds, session.id],
    last_credit_topup_session_id: session.id,
    last_credit_topup_pack_id: pack.id,
    last_credit_topup_at: new Date().toISOString()
  };
  const { error: cycleUpdateError } = await supabase
    .from("workspace_billing_cycles")
    .update({
      credits_limit: nextCreditsLimit,
      projected_spend_cents: nextProjectedSpend,
      metadata: nextCycleMetadata
    })
    .eq("id", activeCycle.id);

  if (cycleUpdateError) {
    await markCreditPurchaseFailed(purchaseRecordId, cycleUpdateError.message);
    throw new Error(`Failed to apply purchased credits: ${cycleUpdateError.message}`);
  }

  const { error: workspaceUpdateError } = await supabase
    .from("workspaces")
    .update({
      credits_limit: Math.max(context.workspace.credits_limit ?? 0, nextCreditsLimit)
    })
    .eq("id", context.workspace.id);

  if (workspaceUpdateError) {
    await markCreditPurchaseFailed(purchaseRecordId, workspaceUpdateError.message);
    throw new Error(`Failed to update workspace credits after purchase: ${workspaceUpdateError.message}`);
  }

  await markCreditPurchaseCompleted(purchaseRecordId, activeCycle.id);
}

async function insertPendingCreditPurchase(input: {
  workspaceId: string;
  checkoutSessionId: string;
  customerId: string | null;
  paymentIntentId: string | null;
  pack: CreditPackDefinition;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workspace_credit_purchases")
    .insert({
      workspace_id: input.workspaceId,
      stripe_checkout_session_id: input.checkoutSessionId,
      stripe_customer_id: input.customerId,
      stripe_payment_intent_id: input.paymentIntentId,
      credit_pack_id: input.pack.id,
      credits: input.pack.credits,
      amount_cents: input.pack.priceCents,
      currency: "eur",
      status: "pending",
      metadata: {}
    })
    .select("id")
    .single();

  if (error) {
    if ("code" in error && error.code === "23505") {
      const { data: existingData, error: existingError } = await supabase
        .from("workspace_credit_purchases")
        .select("id")
        .eq("stripe_checkout_session_id", input.checkoutSessionId)
        .single();

      if (existingError) {
        throw new Error(`Failed to load an existing credit purchase record: ${existingError.message}`);
      }

      return (existingData as Pick<WorkspaceCreditPurchaseRow, "id">).id;
    }

    throw new Error(`Failed to create the credit purchase record: ${error.message}`);
  }

  const purchase = data as Pick<WorkspaceCreditPurchaseRow, "id">;

  return purchase.id;
}

async function markCreditPurchaseCompleted(purchaseId: string, billingCycleId: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("workspace_credit_purchases")
    .update({
      status: "completed",
      billing_cycle_id: billingCycleId
    })
    .eq("id", purchaseId);

  if (error) {
    throw new Error(`Failed to finalize the credit purchase record: ${error.message}`);
  }
}

async function markCreditPurchaseFailed(purchaseId: string, failureReason: string) {
  const supabase = createServerSupabaseClient();
  const { data, error: selectError } = await supabase
    .from("workspace_credit_purchases")
    .select("metadata")
    .eq("id", purchaseId)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to load purchase metadata after an error: ${selectError.message}`);
  }

  const purchase = data as { metadata: Record<string, unknown> | null } | null;
  const metadata = purchase?.metadata && typeof purchase.metadata === "object" ? { ...purchase.metadata } : {};
  const { error } = await supabase
    .from("workspace_credit_purchases")
    .update({
      status: "failed",
      metadata: {
        ...metadata,
        last_failure_message: failureReason,
        failed_at: new Date().toISOString()
      }
    })
    .eq("id", purchaseId);

  if (error) {
    throw new Error(`Failed to mark the credit purchase as failed: ${error.message}`);
  }
}

async function getOrCreateActiveCycleForCreditPackPurchase(context: StripeWorkspaceContext) {
  const supabase = createServerSupabaseClient();
  const { data: activeCycleData, error: activeCycleError } = await supabase
    .from("workspace_billing_cycles")
    .select("id, period_start, period_end, credits_limit, credits_used, projected_spend_cents, status, metadata")
    .eq("workspace_id", context.workspace.id)
    .eq("status", "active")
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeCycleError) {
    throw new Error(`Failed to load active billing cycle: ${activeCycleError.message}`);
  }

  if (activeCycleData) {
    return activeCycleData as BillingCycleRow;
  }

  const plan = getBillingPlanDefinition(context.workspace.plan_name);
  const now = new Date();
  const periodStart = normalizeStripePeriodDate(context.metadata.stripeCurrentPeriodStart) ?? now.toISOString().slice(0, 10);
  const periodEnd =
    normalizeStripePeriodDate(context.metadata.stripeCurrentPeriodEnd) ?? addOneUtcMonthToDateKey(periodStart);
  const { data: createdCycleData, error: createdCycleError } = await supabase
    .from("workspace_billing_cycles")
    .insert({
      workspace_id: context.workspace.id,
      period_start: periodStart,
      period_end: periodEnd,
      credits_limit: plan.creditsLimit,
      credits_used: 0,
      projected_spend_cents: plan.basePriceCents,
      status: "active",
      metadata: {}
    })
    .select("id, period_start, period_end, credits_limit, credits_used, projected_spend_cents, status, metadata")
    .single();

  if (createdCycleError) {
    throw new Error(`Failed to create active billing cycle for credit purchases: ${createdCycleError.message}`);
  }

  return createdCycleData as BillingCycleRow;
}

function resolveCreditPackFromCheckoutSession(session: Stripe.Checkout.Session) {
  const metadataPackId = session.metadata?.credit_pack_id?.trim().toLowerCase();

  if (metadataPackId) {
    return getCreditPackDefinition(metadataPackId);
  }

  const lineItem = session.line_items?.data?.[0];
  const lineItemPrice = lineItem?.price;
  const lineItemPackId = lineItemPrice?.metadata?.credit_pack_id?.trim().toLowerCase();

  if (lineItemPackId) {
    return getCreditPackDefinition(lineItemPackId);
  }

  if (lineItemPrice?.unit_amount) {
    return BILLING_CREDIT_PACKS.find((pack) => pack.priceCents === lineItemPrice.unit_amount) ?? null;
  }

  const metadataCredits = parseStrictPositiveInteger(session.metadata?.credits);
  const metadataAmountCents = parseStrictPositiveInteger(session.metadata?.amount_cents);

  if (metadataCredits && metadataAmountCents) {
    return (
      BILLING_CREDIT_PACKS.find(
        (pack) => pack.credits === metadataCredits && pack.priceCents === metadataAmountCents
      ) ?? null
    );
  }

  return null;
}

function isCreditPackCheckoutSession(session: Stripe.Checkout.Session) {
  return (
    session.mode === "payment" &&
    (session.metadata?.checkout_kind === "credit_pack" ||
      typeof session.metadata?.credit_pack_id === "string")
  );
}

function isEligibleSubscriptionForCreditPackPurchase(subscription: Stripe.Subscription) {
  return subscription.status === "active" || subscription.status === "trialing";
}

async function persistWorkspacePlanState(
  context: StripeWorkspaceContext,
  plan: BillingPlanDefinition,
  stripePatch: {
    stripeCustomerId?: string | null;
    stripeCurrentPeriodStart?: string | null;
    stripeCurrentPeriodEnd?: string | null;
    stripePriceId?: string | null;
    stripeSubscriptionId?: string | null;
    stripeSubscriptionStatus?: string | null;
  }
) {
  const supabase = createServerSupabaseClient();
  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({
      plan_name: plan.name,
      credits_limit: plan.creditsLimit
    })
    .eq("id", context.workspace.id);

  if (workspaceError) {
    throw new Error(`Failed to update workspace billing plan: ${workspaceError.message}`);
  }

  const { data: cycleData, error: cycleError } = await supabase
    .from("workspace_billing_cycles")
    .select("id, period_start, period_end, credits_limit, credits_used, projected_spend_cents, status, metadata")
    .eq("workspace_id", context.workspace.id)
    .order("period_start", { ascending: false })
    .limit(12);

  if (cycleError) {
    throw new Error(`Failed to load the active billing cycle: ${cycleError.message}`);
  }

  const cycles = (cycleData as BillingCycleRow[] | null) ?? [];
  const periodStart = normalizeStripePeriodDate(stripePatch.stripeCurrentPeriodStart);
  const periodEnd = normalizeStripePeriodDate(stripePatch.stripeCurrentPeriodEnd);

  if (periodStart && periodEnd) {
    const matchingCycle = cycles.find(
      (cycle) => cycle.period_start === periodStart && cycle.period_end === periodEnd
    );

    if (matchingCycle) {
      const extraCredits = getCycleCreditTopUpTotal(matchingCycle.metadata);
      const extraSpendCents = getCycleSpendTopUpTotal(matchingCycle.metadata);
      const { error: updateCycleError } = await supabase
        .from("workspace_billing_cycles")
        .update({
          credits_limit: plan.creditsLimit + extraCredits,
          projected_spend_cents: Math.max(
            plan.basePriceCents + extraSpendCents,
            matchingCycle.projected_spend_cents
          ),
          status: "active"
        })
        .eq("id", matchingCycle.id);

      if (updateCycleError) {
        throw new Error(`Failed to update the active billing cycle: ${updateCycleError.message}`);
      }
    } else {
      const { error: createCycleError } = await supabase
        .from("workspace_billing_cycles")
        .insert({
          workspace_id: context.workspace.id,
          period_start: periodStart,
          period_end: periodEnd,
          credits_limit: plan.creditsLimit,
          credits_used: 0,
          projected_spend_cents: plan.basePriceCents,
          status: "active"
        });

      if (createCycleError) {
        throw new Error(`Failed to create the active billing cycle: ${createCycleError.message}`);
      }
    }

    const activeCycleIdsToClose = cycles
      .filter(
        (cycle) =>
          cycle.status === "active" &&
          (cycle.period_start !== periodStart || cycle.period_end !== periodEnd)
      )
      .map((cycle) => cycle.id);

    if (activeCycleIdsToClose.length > 0) {
      const { error: closeCyclesError } = await supabase
        .from("workspace_billing_cycles")
        .update({ status: "closed" })
        .in("id", activeCycleIdsToClose);

      if (closeCyclesError) {
        throw new Error(`Failed to close previous billing cycles: ${closeCyclesError.message}`);
      }
    }
  } else {
    const cycle = cycles.find((entry) => entry.status === "active");

    if (cycle) {
      const extraCredits = getCycleCreditTopUpTotal(cycle.metadata);
      const extraSpendCents = getCycleSpendTopUpTotal(cycle.metadata);
      const { error: updateCycleError } = await supabase
        .from("workspace_billing_cycles")
        .update({
          credits_limit: plan.creditsLimit + extraCredits,
          projected_spend_cents: Math.max(plan.basePriceCents + extraSpendCents, cycle.projected_spend_cents)
        })
        .eq("id", cycle.id);

      if (updateCycleError) {
        throw new Error(`Failed to update the active billing cycle: ${updateCycleError.message}`);
      }
    }
  }

  await updateWorkspaceStripeMetadata(context, stripePatch);
}

async function updateWorkspaceStripeMetadata(
  context: StripeWorkspaceContext,
  patch: {
    stripeCustomerId?: string | null;
    stripeCurrentPeriodStart?: string | null;
    stripeCurrentPeriodEnd?: string | null;
    stripePriceId?: string | null;
    stripeSubscriptionId?: string | null;
    stripeSubscriptionStatus?: string | null;
  }
) {
  const supabase = createServerSupabaseClient();
  const nextMetadata: Record<string, unknown> = {
    ...context.rawMetadata
  };

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === "") {
      delete nextMetadata[key];
      continue;
    }

    nextMetadata[key] = value;
  }

  const { error } = await supabase
    .from("workspace_settings")
    .update({
      metadata: nextMetadata
    })
    .eq("workspace_id", context.workspace.id);

  if (error) {
    throw new Error(`Failed to save Stripe billing metadata: ${error.message}`);
  }

  context.rawMetadata = nextMetadata;
  context.metadata = parseStripeWorkspaceMetadata(nextMetadata);
}

async function getStripeWorkspaceContext(): Promise<StripeWorkspaceContext> {
  const supabase = createServerSupabaseClient();
  let workspace = await selectWorkspace(supabase);

  if (!workspace) {
    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        slug: DEFAULT_WORKSPACE_SLUG,
        name: DEFAULT_WORKSPACE_NAME,
        plan_name: DEFAULT_WORKSPACE_PLAN.name,
        avatar_label: DEFAULT_WORKSPACE_AVATAR_LABEL,
        credits_limit: DEFAULT_WORKSPACE_PLAN.creditsLimit,
        credits_used: 0
      })
      .select("id, slug, name, plan_name, avatar_label, credits_limit")
      .single();

    if (error) {
      throw new Error(`Failed to bootstrap the workspace for Stripe billing: ${error.message}`);
    }

    workspace = data as WorkspaceRow;
  }

  let settings = await selectWorkspaceSettings(supabase, workspace.id);

  if (!settings) {
    const { data, error } = await supabase
      .from("workspace_settings")
      .insert({
        workspace_id: workspace.id
      })
      .select("workspace_id, metadata")
      .single();

    if (error) {
      throw new Error(`Failed to bootstrap workspace settings for Stripe billing: ${error.message}`);
    }

    settings = data as WorkspaceSettingsRow;
  }

  const rawMetadata =
    settings.metadata && typeof settings.metadata === "object" ? { ...settings.metadata } : {};

  return {
    workspace,
    settings,
    rawMetadata,
    metadata: parseStripeWorkspaceMetadata(rawMetadata)
  };
}

async function selectWorkspace(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, slug, name, plan_name, avatar_label, credits_limit")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load the workspace for Stripe billing: ${error.message}`);
  }

  return data as WorkspaceRow | null;
}

async function selectWorkspaceSettings(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string
) {
  const { data, error } = await supabase
    .from("workspace_settings")
    .select("workspace_id, metadata")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load workspace settings for Stripe billing: ${error.message}`);
  }

  return data as WorkspaceSettingsRow | null;
}

function parseStripeWorkspaceMetadata(metadata: Record<string, unknown>) {
  return {
    profileEmail: typeof metadata.profileEmail === "string" ? metadata.profileEmail : undefined,
    profileName: typeof metadata.profileName === "string" ? metadata.profileName : undefined,
    stripeCustomerId: typeof metadata.stripeCustomerId === "string" ? metadata.stripeCustomerId : undefined,
    stripeCurrentPeriodStart:
      typeof metadata.stripeCurrentPeriodStart === "string"
        ? metadata.stripeCurrentPeriodStart
        : undefined,
    stripeSubscriptionId:
      typeof metadata.stripeSubscriptionId === "string" ? metadata.stripeSubscriptionId : undefined,
    stripeSubscriptionStatus:
      typeof metadata.stripeSubscriptionStatus === "string"
        ? metadata.stripeSubscriptionStatus
        : undefined,
    stripePriceId: typeof metadata.stripePriceId === "string" ? metadata.stripePriceId : undefined,
    stripeCurrentPeriodEnd:
      typeof metadata.stripeCurrentPeriodEnd === "string" ? metadata.stripeCurrentPeriodEnd : undefined
  } satisfies StripeWorkspaceMetadata;
}

function resolveBillingEmail(context: StripeWorkspaceContext) {
  const preferredEmail = sanitizeEmailAddress(context.metadata.profileEmail);

  if (preferredEmail) {
    return preferredEmail;
  }

  const workspaceSlug = context.workspace.slug.trim().toLowerCase();
  const safeLocalPart = workspaceSlug.length > 0 ? workspaceSlug : "workspace";

  return `${safeLocalPart}@translayr.dev`;
}

function sanitizeOrigin(origin: string) {
  return new URL(origin).origin.replace(/\/$/, "");
}

function formatStripePeriodBoundary(value: number | null) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function getStripeSubscriptionPeriodStart(subscription: Stripe.Subscription) {
  const rawValue = (subscription as Stripe.Subscription & {
    current_period_start?: number | null;
  }).current_period_start;

  return typeof rawValue === "number" ? rawValue : null;
}

function getStripeSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const rawValue = (subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  }).current_period_end;

  return typeof rawValue === "number" ? rawValue : null;
}

function normalizeStripePeriodDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function addOneUtcMonthToDateKey(dateKey: string) {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();

    return new Date(
      Date.UTC(
        fallback.getUTCFullYear(),
        fallback.getUTCMonth() + 1,
        fallback.getUTCDate()
      )
    )
      .toISOString()
      .slice(0, 10);
  }

  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate())
  )
    .toISOString()
    .slice(0, 10);
}

function getCycleCreditTopUpTotal(metadata: Record<string, unknown> | null | undefined) {
  return parseNonNegativeInteger(metadata?.credit_topup_credits_total);
}

function getCycleSpendTopUpTotal(metadata: Record<string, unknown> | null | undefined) {
  return parseNonNegativeInteger(metadata?.credit_topup_spend_cents_total);
}

function getAppliedCreditPurchaseSessionIds(metadata: Record<string, unknown> | null | undefined) {
  const rawValue = metadata?.applied_credit_purchase_session_ids;

  if (!Array.isArray(rawValue)) {
    return [] as string[];
  }

  return rawValue.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

function normalizeCycleMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata || typeof metadata !== "object") {
    return {} as Record<string, unknown>;
  }

  return { ...metadata };
}

function parseStrictPositiveInteger(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function parseNonNegativeInteger(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10);

    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return 0;
}

function getStripeObjectId(
  value:
    | Stripe.Checkout.Session["customer"]
    | Stripe.Checkout.Session["payment_intent"]
    | Stripe.Checkout.Session["subscription"]
    | Stripe.Subscription["customer"]
    | null
) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function isManagedInStripe(subscription: Stripe.Subscription) {
  return subscription.status !== "canceled" && subscription.status !== "incomplete_expired";
}

function sanitizeEmailAddress(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

function isStripeResourceMissingError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeStripeError = error as {
    code?: string;
    message?: string;
    type?: string;
  };

  if (maybeStripeError.code === "resource_missing") {
    return true;
  }

  return (
    maybeStripeError.type === "StripeInvalidRequestError" &&
    typeof maybeStripeError.message === "string" &&
    /no such/i.test(maybeStripeError.message)
  );
}
