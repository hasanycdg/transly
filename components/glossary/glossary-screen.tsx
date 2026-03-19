"use client";

const glossaryMetrics = [
  { label: "Total terms", value: "186", meta: "Across all projects" },
  { label: "Protected phrases", value: "42", meta: "Never translate" },
  { label: "Locales covered", value: "6", meta: "DE, FR, NL, ES +2" },
  { label: "Pending reviews", value: "12", meta: "Needs approval" }
];

const glossaryTerms = [
  {
    source: "Checkout",
    translations: "DE Kasse · FR Paiement · NL Afrekenen",
    status: "Approved",
    project: "WPML Platform Refresh"
  },
  {
    source: "Billing address",
    translations: "DE Rechnungsadresse · FR Adresse de facturation",
    status: "Approved",
    project: "Shopify Launch Kit"
  },
  {
    source: "Developer key",
    translations: "DE Entwicklerschlüssel · ES Clave de desarrollador",
    status: "Review",
    project: "Developer Docs Sync"
  },
  {
    source: "Priority support",
    translations: "FR Support prioritaire · IT Supporto prioritario",
    status: "Draft",
    project: "Help Center Migration"
  }
];

const glossaryCollections = [
  { name: "Brand voice", count: "38 terms", detail: "Product names, UI nouns, campaign phrases" },
  { name: "Commerce", count: "64 terms", detail: "Checkout, billing, product and tax labels" },
  { name: "Developer docs", count: "51 terms", detail: "Code-sensitive terminology and CLI phrases" }
];

export function GlossaryScreen() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
        <div className="flex flex-col gap-[1px]">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            / Glossary
          </span>
          <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
            Glossary
          </h1>
        </div>

        <div className="flex items-center gap-[6px]">
          <button className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]">
            Import CSV
          </button>
          <button className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-85">
            New Term
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="grid grid-cols-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          {glossaryMetrics.map((metric) => (
            <MetricCell key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.85fr)]">
          <div className="rounded-[10px] border border-[var(--border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-[18px] py-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Terms
                </p>
                <h2 className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                  Shared localization terms
                </h2>
              </div>
              <button className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]">
                Filter
              </button>
            </div>

            <div className="grid grid-cols-[160px_minmax(0,1fr)_90px_160px] border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]">
              {["Source", "Translations", "Status", "Project"].map((label) => (
                <span
                  key={label}
                  className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]"
                >
                  {label}
                </span>
              ))}
            </div>

            {glossaryTerms.map((term) => (
              <div
                key={term.source}
                className="grid grid-cols-[160px_minmax(0,1fr)_90px_160px] items-center border-b border-[var(--border-light)] px-[18px] py-[13px] last:border-b-0"
              >
                <div className="text-[13px] font-medium text-[var(--foreground)]">{term.source}</div>
                <div className="truncate pr-4 text-[11.5px] text-[var(--muted)]">{term.translations}</div>
                <div>
                  <span
                    className={[
                      "inline-flex rounded-[5px] border px-2 py-[3px] text-[11.5px] font-medium",
                      term.status === "Approved"
                        ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                        : term.status === "Review"
                          ? "border-[var(--review-border)] bg-[var(--review-bg)] text-[var(--review)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
                    ].join(" ")}
                  >
                    {term.status}
                  </span>
                </div>
                <div className="text-[11.5px] text-[var(--muted-soft)]">{term.project}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Collections
                </p>
              </div>
              <div className="space-y-4 px-[18px] py-4">
                {glossaryCollections.map((collection) => (
                  <div key={collection.name} className="rounded-[8px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-medium text-[var(--foreground)]">
                        {collection.name}
                      </p>
                      <span className="text-[11.5px] text-[var(--muted)]">{collection.count}</span>
                    </div>
                    <p className="mt-2 text-[11.5px] text-[var(--muted-soft)]">
                      {collection.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Guidance
                </p>
              </div>
              <div className="space-y-3 px-[18px] py-4 text-[11.5px] text-[var(--muted)]">
                <p>Use glossary locking for brand names, technical product terms, and checkout labels.</p>
                <p>Terms marked as approved will be injected into translation prompts first.</p>
                <p>Draft terms should stay out of the prompt until they are reviewed by the team.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCell({
  label,
  meta,
  value
}: {
  label: string;
  meta: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-[3px] bg-white px-[18px] py-4">
      <div className="text-[26px] font-semibold leading-none tracking-[-1.5px] text-[var(--foreground)]">
        {value}
      </div>
      <div className="text-[12px] text-[var(--muted-soft)]">{label}</div>
      <div className="mt-[5px] text-[11px] text-[var(--muted-soft)]">{meta}</div>
    </div>
  );
}
