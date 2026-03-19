"use client";

const usageTrend = [
  { label: "Mar 1", value: 32 },
  { label: "Mar 3", value: 41 },
  { label: "Mar 5", value: 38 },
  { label: "Mar 7", value: 52 },
  { label: "Mar 9", value: 48 },
  { label: "Mar 11", value: 61 },
  { label: "Mar 13", value: 58 },
  { label: "Mar 15", value: 67 },
  { label: "Mar 17", value: 72 },
  { label: "Mar 19", value: 76 }
];

const featureUsage = [
  { label: "XLIFF translations", value: "48.2k", percent: 82 },
  { label: "Placeholder validation", value: "12.4k", percent: 61 },
  { label: "Exports generated", value: "6.1k", percent: 44 },
  { label: "Review sessions", value: "3.8k", percent: 31 }
];

const recentUsage = [
  { label: "Credits used today", value: "4,820", detail: "Across 19 uploads" },
  { label: "API requests", value: "1,284", detail: "7.2% above yesterday" },
  { label: "Active projects", value: "12", detail: "4 in review" },
  { label: "Current cycle", value: "Mar 1 - Mar 31", detail: "68% consumed" }
];

const chartPoints = buildChartPoints(usageTrend, 520, 160);

export function UsageScreen() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
        <div className="flex flex-col gap-[1px]">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            / Usage
          </span>
          <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
            Usage
          </h1>
        </div>

        <div className="flex items-center gap-[6px]">
          <button className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]">
            Last 30 days
          </button>
          <button className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-85">
            Export Report
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="grid grid-cols-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          <MetricCell value="68%" label="Cycle consumed" meta="12% ahead of plan" tone="positive" />
          <MetricCell value="48.2k" label="Credits used" meta="Current billing cycle" />
          <MetricCell value="1,284" label="API requests" meta="19 upload sessions" />
          <MetricCell value="€420" label="Projected spend" meta="Based on current run-rate" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
          <div className="rounded-[10px] border border-[var(--border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-[18px] py-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Usage Trend
                </p>
                <h2 className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                  Credits consumed over time
                </h2>
              </div>
              <span className="text-[11px] text-[var(--muted-soft)]">Updated 18:36</span>
            </div>

            <div className="px-[18px] py-4">
              <div className="rounded-[8px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                <svg
                  viewBox="0 0 560 200"
                  className="h-[220px] w-full"
                  role="img"
                  aria-label="Usage trend chart"
                >
                  <defs>
                    <linearGradient id="usage-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(26,79,175,0.18)" />
                      <stop offset="100%" stopColor="rgba(26,79,175,0.02)" />
                    </linearGradient>
                  </defs>

                  {[0, 1, 2, 3].map((index) => {
                    const y = 24 + index * 40;

                    return (
                      <line
                        key={y}
                        x1="12"
                        x2="548"
                        y1={y}
                        y2={y}
                        stroke="rgba(17,17,16,0.08)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  <path d={chartPoints.fillPath} fill="url(#usage-fill)" />
                  <path
                    d={chartPoints.linePath}
                    fill="none"
                    stroke="var(--processing)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {chartPoints.points.map((point) => (
                    <g key={point.label}>
                      <circle cx={point.x} cy={point.y} r="3.5" fill="white" stroke="var(--processing)" strokeWidth="1.8" />
                    </g>
                  ))}

                  {chartPoints.points.map((point, index) => (
                    <text
                      key={`${point.label}-axis`}
                      x={point.x}
                      y="188"
                      textAnchor={index === 0 ? "start" : index === chartPoints.points.length - 1 ? "end" : "middle"}
                      fill="var(--muted-soft)"
                      fontSize="10.5"
                    >
                      {point.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Snapshot
                </p>
              </div>
              <div className="space-y-4 px-[18px] py-4">
                {recentUsage.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] text-[var(--muted-soft)]">{item.label}</p>
                      <p className="mt-1 text-[11.5px] text-[var(--muted)]">{item.detail}</p>
                    </div>
                    <span className="text-[13px] font-medium text-[var(--foreground)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  / Plan
                </p>
              </div>
              <div className="px-[18px] py-4">
                <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--muted)]">
                  <span>Enterprise usage allocation</span>
                  <span className="font-medium text-[var(--foreground)]">68 / 100 GB</span>
                </div>
                <div className="h-[3px] overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full w-[68%] rounded-full bg-[var(--success)]" />
                </div>
                <p className="mt-3 text-[11.5px] text-[var(--muted-soft)]">
                  32 GB remaining before the next billing reset on March 31.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[10px] border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border-light)] px-[18px] py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / Usage Breakdown
            </p>
          </div>
          <div className="px-[18px] py-4">
            <div className="grid gap-4 xl:grid-cols-2">
              {featureUsage.map((item) => (
                <div key={item.label} className="rounded-[8px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                  <div className="mb-[6px] flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium text-[var(--foreground)]">{item.label}</span>
                    <span className="text-[11.5px] text-[var(--muted)]">{item.value}</span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-[var(--border)]">
                    <div className="h-full rounded-full bg-[var(--processing)]" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
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
  tone = "default",
  value
}: {
  label: string;
  meta: string;
  tone?: "default" | "positive";
  value: string;
}) {
  return (
    <div className="flex flex-col gap-[3px] bg-white px-[18px] py-4">
      <div className="text-[26px] font-semibold leading-none tracking-[-1.5px] text-[var(--foreground)]">
        {value}
      </div>
      <div className="text-[12px] text-[var(--muted-soft)]">{label}</div>
      <div
        className={[
          "mt-[5px] text-[11px]",
          tone === "positive" ? "text-[var(--success)]" : "text-[var(--muted-soft)]"
        ].join(" ")}
      >
        {meta}
      </div>
    </div>
  );
}

function buildChartPoints(
  data: { label: string; value: number }[],
  width: number,
  height: number
) {
  const min = Math.min(...data.map((item) => item.value));
  const max = Math.max(...data.map((item) => item.value));
  const chartHeight = height;
  const stepX = width / (data.length - 1);

  const points = data.map((item, index) => {
    const normalized = (item.value - min) / (max - min || 1);
    const x = 20 + index * stepX;
    const y = 16 + (1 - normalized) * (chartHeight - 24);

    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const fillPath = `${linePath} L ${points.at(-1)?.x ?? 0} ${height + 8} L ${points[0]?.x ?? 0} ${height + 8} Z`;

  return {
    fillPath,
    linePath,
    points
  };
}
