"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import type { BillingInvoiceItem, BillingPlanOption, BillingScreenData, UsageMetricItem } from "@/types/workspace";

type BillingScreenProps = {
  data: BillingScreenData;
};

type BillingMutationResponse = {
  data?: BillingScreenData;
  error?: string;
  redirectMode?: "checkout" | "portal";
  redirectUrl?: string;
};

export function BillingScreen({ data }: BillingScreenProps) {
  const locale = useAppLocale();
  const router = useRouter();
  const [isUpdatingPlanId, setIsUpdatingPlanId] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const copy =
    locale === "de"
      ? {
          updateFailed: "Der Abrechnungsplan konnte nicht aktualisiert werden.",
          updated: "Abo aktualisiert.",
          portalFailed: "Das Billing-Portal konnte nicht geöffnet werden.",
          eyebrow: "/ Abrechnung",
          heading: "Abo & Abrechnung",
          intro: "Verwalte deinen Plan, beobachte den aktuellen Abrechnungszyklus und prüfe letzte Rechnungen an einem Ort.",
          planSuffix: "Tarif",
          plans: "/ Pläne",
          choosePlan: "Abo auswählen",
          paidPlans: "Bezahlte Pläne werden monatlich exkl. USt. berechnet. Neue kostenpflichtige Abos öffnen in Stripe Checkout.",
          invoices: "/ Rechnungen",
          history: "Abrechnungsverlauf",
          invoiceHeaders: ["Zeitraum", "Ausgestellt", "Betrag", "Status", "Credits"],
          currentCycle: "/ Aktueller Zyklus",
          nextRenewal: "Nächste Verlängerung",
          projectedSpend: "Prognostizierte Kosten",
          creditsRemaining: "Verbleibende Credits",
          payment: "/ Zahlung",
          billingEmail: "Abrechnungs-E-Mail",
          openingStripe: "Stripe wird geöffnet...",
          manageStripe: "In Stripe verwalten",
          current: "Aktuell",
          currentPlan: "Aktueller Plan",
          updating: "Wird aktualisiert...",
          switchTo: (planName: string) => `Zu ${planName} wechseln`
        }
      : {
          updateFailed: "Billing plan could not be updated.",
          updated: "Subscription updated.",
          portalFailed: "Billing portal could not be opened.",
          eyebrow: "/ Billing",
          heading: "Billing",
          intro: "Manage your subscription plan, monitor the current billing cycle, and review recent invoices in one focused space.",
          planSuffix: "plan",
          plans: "/ Plans",
          choosePlan: "Choose your subscription",
          paidPlans: "Paid plans are billed monthly excl. VAT. New paid subscriptions open in Stripe Checkout.",
          invoices: "/ Invoices",
          history: "Billing history",
          invoiceHeaders: ["Period", "Issued", "Amount", "Status", "Credits"],
          currentCycle: "/ Current Cycle",
          nextRenewal: "Next renewal",
          projectedSpend: "Projected spend",
          creditsRemaining: "Credits remaining",
          payment: "/ Payment",
          billingEmail: "Billing email",
          openingStripe: "Opening Stripe...",
          manageStripe: "Manage in Stripe",
          current: "Current",
          currentPlan: "Current plan",
          updating: "Updating...",
          switchTo: (planName: string) => `Switch to ${planName}`
        };

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
      const payload = (await response.json().catch(() => null)) as BillingMutationResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.updateFailed);
      }

      if (payload?.redirectUrl) {
        window.location.assign(payload.redirectUrl);
        return;
      }

      setSuccessMessage(copy.updated);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.updateFailed);
    } finally {
      setIsUpdatingPlanId(null);
    }
  }

  async function handleOpenPortal() {
    if (isOpeningPortal) {
      return;
    }

    try {
      setIsOpeningPortal(true);
      setErrorMessage(null);

      const response = await fetch("/api/billing/portal", {
        method: "POST"
      });
      const payload = (await response.json().catch(() => null)) as BillingMutationResponse | null;

      if (!response.ok || !payload?.redirectUrl) {
        throw new Error(payload?.error ?? copy.portalFailed);
      }

      window.location.assign(payload.redirectUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.portalFailed);
    } finally {
      setIsOpeningPortal(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[720px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.eyebrow}
            </span>
            <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
              {copy.heading}
            </h1>
            <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">
              {copy.intro}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-[11.5px] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />
            {data.currentPlanName} {copy.planSuffix}
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
                  {copy.plans}
                </p>
                <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  {copy.choosePlan}
                </h2>
                <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">
                  {copy.paidPlans}
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
                  {copy.invoices}
                </p>
                <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  {copy.history}
                </h2>
              </div>

              <div className="overflow-hidden">
                <div className="grid grid-cols-[minmax(0,1.2fr)_120px_120px_90px_120px] border-b border-[var(--border-light)] bg-[var(--background)] px-5 py-3">
                  {copy.invoiceHeaders.map((label) => (
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
                  {copy.currentCycle}
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
                  <DetailRow label={copy.nextRenewal} value={data.renewalLabel} />
                  <DetailRow label={copy.projectedSpend} value={data.projectedSpendValue} />
                  <DetailRow label={copy.creditsRemaining} value={data.creditsRemainingValue} />
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.payment}
                </p>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="text-[13px] font-medium text-[var(--foreground)]">{data.paymentMethodLabel}</p>
                  <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">{data.paymentMethodMeta}</p>
                </div>
                <div className="rounded-[12px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                  <DetailRow label={copy.billingEmail} value={data.billingEmail} />
                  {data.manageBillingAvailable ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleOpenPortal();
                      }}
                      disabled={isOpeningPortal}
                      className="mt-3 rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isOpeningPortal ? copy.openingStripe : copy.manageStripe}
                    </button>
                  ) : null}
                  <div className="mt-3 border-t border-[var(--border-light)] pt-3 text-[11.5px] leading-5 text-[var(--muted)]">
                    {data.paymentNotice}
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
  const locale = useAppLocale();
  const copy =
    locale === "de"
      ? {
          current: "Aktuell",
          currentPlan: "Aktueller Plan",
          updating: "Wird aktualisiert...",
          switchTo: (planName: string) => `Zu ${planName} wechseln`
        }
      : {
          current: "Current",
          currentPlan: "Current plan",
          updating: "Updating...",
          switchTo: (planName: string) => `Switch to ${planName}`
        };
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
            {copy.current}
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
        {plan.current ? copy.currentPlan : updating ? copy.updating : copy.switchTo(plan.name)}
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
