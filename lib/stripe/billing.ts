import "server-only";

import type Stripe from "stripe";

import {
  BILLING_PLANS,
  DEFAULT_WORKSPACE_PLAN_ID,
  getBillingPlanDefinition,
  isPaidBillingPlan,
  type BillingPlanDefinition,
  type BillingPlanId
} from "@/lib/billing/plans";
import { createServerSupabaseClient } from "@/lib/supabase/admin";
import { getBillingScreenData } from "@/lib/supabase/workspace";
import {
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
  projected_spend_cents: number;
};

type StripeWorkspaceMetadata = {
  profileEmail?: string;
  profileName?: string;
  stripeCustomerId?: string;
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
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: subscription.status,
    stripePriceId: subscription.items.data[0]?.price.id ?? null,
    stripeCurrentPeriodEnd: formatStripePeriodEnd(getStripeSubscriptionPeriodEnd(subscription))
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
    return context.metadata.stripeCustomerId;
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
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10
  });

  return (
    subscriptions.data.find((subscription) => isManagedInStripe(subscription)) ??
    subscriptions.data[0] ??
    null
  );
}

async function persistWorkspacePlanState(
  context: StripeWorkspaceContext,
  plan: BillingPlanDefinition,
  stripePatch: {
    stripeCustomerId?: string | null;
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
    .select("id, projected_spend_cents")
    .eq("workspace_id", context.workspace.id)
    .eq("status", "active")
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cycleError) {
    throw new Error(`Failed to load the active billing cycle: ${cycleError.message}`);
  }

  if (cycleData) {
    const cycle = cycleData as BillingCycleRow;
    const { error: updateCycleError } = await supabase
      .from("workspace_billing_cycles")
      .update({
        credits_limit: plan.creditsLimit,
        projected_spend_cents: Math.max(plan.basePriceCents, cycle.projected_spend_cents)
      })
      .eq("id", cycle.id);

    if (updateCycleError) {
      throw new Error(`Failed to update the active billing cycle: ${updateCycleError.message}`);
    }
  }

  await updateWorkspaceStripeMetadata(context, stripePatch);
}

async function updateWorkspaceStripeMetadata(
  context: StripeWorkspaceContext,
  patch: {
    stripeCustomerId?: string | null;
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
  return context.metadata.profileEmail ?? `${context.workspace.slug}@translayr.app`;
}

function sanitizeOrigin(origin: string) {
  return new URL(origin).origin.replace(/\/$/, "");
}

function formatStripePeriodEnd(value: number | null) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function getStripeSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const rawValue = (subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  }).current_period_end;

  return typeof rawValue === "number" ? rawValue : null;
}

function getStripeObjectId(
  value:
    | Stripe.Checkout.Session["customer"]
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
