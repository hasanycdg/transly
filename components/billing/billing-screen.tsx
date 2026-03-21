"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import type { BillingInvoiceItem, BillingPlanOption, BillingScreenData, UsageMetricItem } from "@/types/workspace";

type BillingScreenProps = {
  data: BillingScreenData;
};

export function BillingScreen({ data }: BillingScreenProps) {
  const router = useRouter();
  const [isUpdatingPlanId, setIsUpdatingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  async function handleSelectPlan(planId: string) {
    if (isUpdatingPlanId) {
      return;
    }

    try {
      setIsUpdatingPlanId(planId);
      setErrorMessage(null);

      const response = await fetch("/api/billing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ planId })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Billing plan could not be updated.");
      }

      setSuccessMessage("Subscription updated.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Billing plan could not be updated.");
    } finally {
      setIsUpdatingPlanId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[720px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / Billing
            </span>
            <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
              Abo &amp; Billing
            </h1>
            <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">
              Manage your subscription plan, monitor the current billing cycle, and review recent invoices in one
              focused space.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-[11.5px] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />
            {data.currentPlanName} plan
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        {successMessage ? (
          <div className="rounded-[16px] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-[12.5px] text-[var(--success)]">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[16px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[12.5px] text-[var(--danger)]">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid grid-cols-1 overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <BillingMetricCell key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <div className="rounded-[14px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Plans
                </p>
                <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  Choose your subscription
                </h2>
                <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">
                  Switch plans directly here. Usage limits update with the selected subscription.
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2">
                {data.plans.map((plan) => (
                  <BillingPlanCard
                    key={plan.id}
                    plan={plan}
                    updating={isUpdatingPlanId === plan.id}
                    disabled={Boolean(isUpdatingPlanId)}
                    onSelect={() => {
                      void handleSelectPlan(plan.id);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Invoices
                </p>
                <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  Billing history
                </h2>
              </div>

              <div className="overflow-hidden">
                <div className="grid grid-cols-[minmax(0,1.2fr)_120px_120px_90px_120px] border-b border-[var(--border-light)] bg-[var(--background)] px-5 py-3">
                  {["Period", "Issued", "Amount", "Status", "Credits"].map((label) => (
                    <span key={label} className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]">
                      {label}
                    </span>
                  ))}
                </div>

                {data.invoices.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[14px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Current Cycle
                </p>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="text-[13px] font-medium text-[var(--foreground)]">{data.currentPlanName}</p>
                  <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">{data.planDescription}</p>
                </div>

                <div className="rounded-[12px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                  <div className="flex items-center justify-between gap-3 text-[12px]">
                    <span className="text-[var(--muted)]">{data.cycleLabel}</span>
                    <span className="font-medium text-[var(--foreground)]">{data.usageValue}</span>
                  </div>
                  <div className="mt-3 h-[4px] overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-[var(--foreground)]"
                      style={{ width: `${data.usagePercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-[11.5px] text-[var(--muted)]">{data.usageMeta}</p>
                </div>

                <div className="space-y-3">
                  <DetailRow label="Next renewal" value={data.renewalLabel} />
                  <DetailRow label="Projected spend" value={data.projectedSpendValue} />
                  <DetailRow label="Credits remaining" value={data.creditsRemainingValue} />
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Payment
                </p>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="text-[13px] font-medium text-[var(--foreground)]">{data.paymentMethodLabel}</p>
                  <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">{data.paymentMethodMeta}</p>
                </div>
                <div className="rounded-[12px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                  <DetailRow label="Billing email" value={data.billingEmail} />
                  <div className="mt-3 border-t border-[var(--border-light)] pt-3 text-[11.5px] leading-5 text-[var(--muted)]">
                    Payment provider wiring is not connected yet, but the billing workspace is now in place and the
                    subscription plan can already be managed here.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BillingMetricCell({ metric }: { metric: UsageMetricItem }) {
  return (
    <div className="flex flex-col gap-[3px] bg-white px-[18px] py-4">
      <div className="text-[24px] font-semibold leading-none tracking-[-1.2px] text-[var(--foreground)]">
        {metric.value}
      </div>
      <div className="text-[12px] text-[var(--muted-soft)]">{metric.label}</div>
      <div
        className={[
          "mt-[5px] text-[11px]",
          metric.tone === "positive" ? "text-[var(--success)]" : "text-[var(--muted-soft)]"
        ].join(" ")}
      >
        {metric.meta}
      </div>
    </div>
  );
}

function BillingPlanCard({
  plan,
  updating,
  disabled,
  onSelect
}: {
  plan: BillingPlanOption;
  updating: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={[
        "rounded-[14px] border px-4 py-4 transition",
        plan.current ? "border-[var(--foreground)] bg-[var(--background)]" : "border-[var(--border)] bg-white"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-[var(--foreground)]">{plan.name}</p>
          <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">{plan.description}</p>
        </div>
        {plan.current ? (
          <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--foreground)]">
            Current
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[22px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">{plan.price}</p>
          <p className="text-[11.5px] text-[var(--muted-soft)]">{plan.priceMeta}</p>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] text-[var(--muted)]">
          {plan.credits}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {plan.features.map((feature) => (
          <div key={feature} className="text-[11.5px] text-[var(--muted)]">
            {feature}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSelect}
        disabled={plan.current || disabled}
        className={[
          "mt-5 rounded-[12px] px-4 py-2.5 text-[12px] font-medium transition",
          plan.current
            ? "border border-[var(--border)] bg-white text-[var(--foreground)]"
            : "bg-[var(--foreground)] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        ].join(" ")}
      >
        {plan.current ? "Current plan" : updating ? "Updating..." : `Switch to ${plan.name}`}
      </button>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: BillingInvoiceItem }) {
  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_120px_120px_90px_120px] items-center border-b border-[var(--border-light)] px-5 py-4 text-[12px] last:border-b-0">
      <div className="min-w-0 font-medium text-[var(--foreground)]">{invoice.periodLabel}</div>
      <div className="text-[var(--muted)]">{invoice.issuedOnLabel}</div>
      <div className="text-[var(--foreground)]">{invoice.amountLabel}</div>
      <div>
        <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
          {invoice.statusLabel}
        </span>
      </div>
      <div className="text-[var(--muted)]">{invoice.creditsLabel}</div>
    </div>
  );
}

function DetailRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12px]">
      <span className="text-[var(--muted-soft)]">{label}</span>
      <span className="text-right font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
