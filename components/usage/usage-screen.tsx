"use client";

import { useMemo, useRef, useState } from "react";

import type { UsageScreenData } from "@/types/workspace";

type UsageScreenProps = {
  data: UsageScreenData;
};

export function UsageScreen({ data }: UsageScreenProps) {
  const chartPoints = useMemo(() => buildChartPoints(data.trend, 520, 160), [data.trend]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(
    chartPoints.points.length > 0 ? chartPoints.points.length - 1 : null
  );
  const activePoint =
    activePointIndex !== null ? chartPoints.points[activePointIndex] ?? null : null;

  function handleChartMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || chartPoints.points.length === 0) {
      return;
    }

    const bounds = svgRef.current.getBoundingClientRect();
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * 560;
    setActivePointIndex(getClosestPointIndex(chartPoints.points, relativeX));
  }

  function handleChartMouseLeave() {
    setActivePointIndex(null);
  }

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
          {data.metrics.map((metric) => (
            <MetricCell key={metric.label} value={metric.value} label={metric.label} meta={metric.meta} tone={metric.tone} />
          ))}
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
              <span className="text-[11px] text-[var(--muted-soft)]">{data.updatedLabel}</span>
            </div>

            <div className="px-[18px] py-4">
              <div className="relative rounded-[8px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                {activePoint ? (
                  <div
                    className="pointer-events-none absolute z-10 min-w-[128px] -translate-x-1/2 rounded-[8px] border border-[var(--border)] bg-white/96 px-3 py-2 shadow-[0_10px_24px_rgba(17,17,16,0.08)] backdrop-blur"
                    style={{
                      left: `${(activePoint.x / 560) * 100}%`,
                      top: "14px"
                    }}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                      {activePoint.label}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold leading-none text-[var(--foreground)]">
                      {formatChartValue(activePoint.value)}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--muted)]">
                      Credits consumed
                    </p>
                  </div>
                ) : null}

                <svg
                  ref={svgRef}
                  viewBox="0 0 560 200"
                  className="h-[220px] w-full"
                  role="img"
                  aria-label="Usage trend chart"
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={handleChartMouseLeave}
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

                  {activePoint ? (
                    <line
                      x1={activePoint.x}
                      x2={activePoint.x}
                      y1="20"
                      y2="176"
                      stroke="rgba(26,79,175,0.18)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ) : null}

                  {chartPoints.points.map((point, index) => (
                    <g key={point.label}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={activePointIndex === index ? "5.5" : "3.5"}
                        fill="white"
                        stroke="var(--processing)"
                        strokeWidth={activePointIndex === index ? "2.4" : "1.8"}
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="14"
                        fill="transparent"
                        onMouseEnter={() => setActivePointIndex(index)}
                      >
                        <title>
                          {point.label}: {formatChartValue(point.value)} credits
                        </title>
                      </circle>
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
                {data.snapshots.map((item) => (
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
                  <span>Current plan allocation</span>
                  <span className="font-medium text-[var(--foreground)]">{data.planValue}</span>
                </div>
                <div className="h-[3px] overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${data.planPercent}%` }} />
                </div>
                <p className="mt-3 text-[11.5px] text-[var(--muted-soft)]">
                  {data.planMeta}
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
              {data.breakdown.map((item) => (
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
  if (data.length === 0) {
    return {
      fillPath: "",
      linePath: "",
      points: []
    };
  }

  const min = Math.min(...data.map((item) => item.value));
  const max = Math.max(...data.map((item) => item.value));
  const chartHeight = height;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

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

function getClosestPointIndex(points: Array<{ x: number }>, targetX: number) {
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const [index, point] of points.entries()) {
    const distance = Math.abs(point.x - targetX);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}

function formatChartValue(value: number) {
  return new Intl.NumberFormat("en").format(value);
}
