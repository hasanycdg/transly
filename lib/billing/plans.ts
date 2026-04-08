export type BillingPlanId = "free" | "starter" | "pro" | "scale";

export type BillingPlanDefinition = {
  id: BillingPlanId;
  name: string;
  basePriceCents: number;
  creditsLimit: number;
  description: string;
  features: string[];
  paid: boolean;
};

export const DEFAULT_WORKSPACE_PLAN_ID: BillingPlanId = "free";

export const BILLING_PLANS: BillingPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    basePriceCents: 0,
    creditsLimit: 5_000,
    description: "For trying the product, smaller file sets, and low-volume localization work.",
    features: ["5k monthly words", "Core XLIFF translation", "Glossary basics"],
    paid: false
  },
  {
    id: "starter",
    name: "Starter",
    basePriceCents: 1_900,
    creditsLimit: 100_000,
    description: "For smaller localization workloads and lightweight weekly release cycles.",
    features: ["100k monthly words", "Project workspaces", "Glossary support"],
    paid: true
  },
  {
    id: "pro",
    name: "Pro",
    basePriceCents: 4_900,
    creditsLimit: 500_000,
    description: "For product teams shipping continuously across multiple locales.",
    features: ["500k monthly words", "Review workflow", "Priority glossary injection"],
    paid: true
  },
  {
    id: "scale",
    name: "Scale",
    basePriceCents: 9_900,
    creditsLimit: 1_000_000,
    description: "For larger teams coordinating launches, QA, and exports at higher volume.",
    features: ["1M monthly words", "Faster throughput", "Shared team operations"],
    paid: true
  }
];

export function getBillingPlanDefinition(planIdOrName: string): BillingPlanDefinition {
  const normalizedValue = planIdOrName.trim().toLowerCase();

  return (
    BILLING_PLANS.find(
      (plan) => plan.id === normalizedValue || plan.name.trim().toLowerCase() === normalizedValue
    ) ?? BILLING_PLANS.find((plan) => plan.id === DEFAULT_WORKSPACE_PLAN_ID) ?? BILLING_PLANS[0]
  );
}

export function isPaidBillingPlan(plan: BillingPlanDefinition): boolean {
  return plan.paid;
}
