"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent
} from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { formatCompactNumber, formatPercent } from "@/lib/projects/formatters";
import { StatusBadge } from "@/components/projects/status-badge";
import type {
  UsageActivityFeedItem,
  UsageLanguageInsightItem,
  UsageProjectInsightItem,
  UsageScreenData,
  UsageTopFileItem,
  UsageTrendPoint
} from "@/types/workspace";

type UsageScreenProps = {
  data: UsageScreenData;
};

type UsageTabId = "overview" | "breakdown" | "activity";

const USAGE_TABS: Array<{ id: UsageTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "breakdown", label: "Breakdown" },
  { id: "activity", label: "Activity" }
];

export function UsageScreen({ data }: UsageScreenProps) {
  const locale = useAppLocale();
  const [activeTab, setActiveTab] = useState<UsageTabId>("overview");
  const summary = data.summary;
  const usagePercentClamped = clamp(summary.percentConsumed, 0, 100);
  const showUpgradeWarning = summary.percentConsumed >= 80;
  const copy =
    locale === "de"
      ? {
          usage: "/ Nutzung",
          heading: "Nutzung",
          intro: "Sieh, was dein Workspace in diesem Zyklus verbraucht hat, wohin es geflossen ist und was als Nächstes Aufmerksamkeit braucht.",
          tabs: {
            overview: "Überblick",
            breakdown: "Aufschlüsselung",
            activity: "Aktivität"
          },
          wordsUsedTotal: "Verbrauchte Wörter vs. Gesamt",
          creditsUsed: "Verbrauchte Credits",
          percentageConsumed: "Verbrauchter Anteil",
          remainingUsage: "Verbleibende Nutzung",
          resetDate: "Reset-Datum",
          creditsConsumedSoFar: "Bisher verbrauchte Credits",
          currentAllowance: "Deines aktuellen Kontingents",
          stillAvailable: "In diesem Zyklus noch verfügbar",
          currentCycle: "/ Aktueller Zyklus",
          wordsUsedThisCycle: "In diesem Zyklus verbrauchte Wörter",
          consumed: "Verbraucht",
          remaining: "verbleibend",
          cycle: "Zyklus",
          reset: "Reset",
          upgrade: "/ Upgrade",
          nearLimit: "Die Nutzung nähert sich dem Limit",
          keepRoom: "Lass Platz für den nächsten Launch",
          healthyRange:
            "Dein Workspace liegt aktuell in einem gesunden Bereich. Wenn ein größerer Release ansteht, kannst du den Plan vor dem nächsten Zyklus erweitern.",
          remainingUsageLow: "Verbleibende Nutzung liegt bei",
          upgradePlan: "Plan upgraden",
          buyCredits: "Credits kaufen",
          everythingInside: "Alles bleibt innerhalb der Nutzungsseite.",
          words: "Wörter"
        }
      : {
          usage: "/ Usage",
          heading: "Usage",
          intro: "See what your workspace has used this cycle, where it went, and what needs attention next.",
          tabs: {
            overview: "Overview",
            breakdown: "Breakdown",
            activity: "Activity"
          },
          wordsUsedTotal: "Words used vs total",
          creditsUsed: "Credits used",
          percentageConsumed: "Percentage consumed",
          remainingUsage: "Remaining usage",
          resetDate: "Reset date",
          creditsConsumedSoFar: "Credits consumed so far",
          currentAllowance: "Of your current allowance",
          stillAvailable: "Still available this cycle",
          currentCycle: "/ Current cycle",
          wordsUsedThisCycle: "Words used this cycle",
          consumed: "Consumed",
          remaining: "remaining",
          cycle: "Cycle",
          reset: "Reset",
          upgrade: "/ Upgrade",
          nearLimit: "Usage is getting close to the limit",
          keepRoom: "Keep room for the next launch",
          healthyRange:
            "Your workspace is in a healthy range right now. If a larger release is coming up, you can expand your plan before the next cycle fills up.",
          remainingUsageLow: "Remaining usage is down to",
          upgradePlan: "Upgrade plan",
          buyCredits: "Buy credits",
          everythingInside: "Everything stays inside the Usage page.",
          words: "words"
        };
  const overviewMetrics = [
    {
      label: copy.wordsUsedTotal,
      value: `${formatCompactNumber(summary.wordsUsed, locale)} / ${formatCompactNumber(summary.totalWords, locale)}`,
      meta: summary.cycleLabel
    },
    {
      label: copy.creditsUsed,
      value: formatCompactNumber(summary.creditsUsed, locale),
      meta: copy.creditsConsumedSoFar
    },
    {
      label: copy.percentageConsumed,
      value: formatPercent(summary.percentConsumed),
      meta: copy.currentAllowance
    },
    {
      label: copy.remainingUsage,
      value: formatCompactNumber(summary.remainingUsage, locale),
      meta: copy.stillAvailable
    },
    {
      label: copy.resetDate,
      value: summary.resetDateLabel,
      meta: summary.resetRelativeLabel
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[760px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.usage}
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
            {data.updatedLabel}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <div className="rounded-[16px] border border-[var(--border)] bg-white p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    {copy.currentCycle}
                  </p>
                  <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.08em] text-[var(--foreground)]">
                    {formatCompactNumber(summary.wordsUsed, locale)} / {formatCompactNumber(summary.totalWords, locale)}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">
                    {copy.wordsUsedThisCycle}
                  </p>
                </div>

                <div className="rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    {copy.consumed}
                  </p>
                  <p className="mt-1 text-[22px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
                    {formatPercent(summary.percentConsumed)}
                  </p>
                  <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                    {summary.resetRelativeLabel}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 text-[12px] text-[var(--muted)]">
                  <span>{summary.cycleLabel}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {formatCompactNumber(summary.remainingUsage, locale)} {copy.remaining}
                  </span>
                </div>
                <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-[var(--border-light)]">
                  <div
                    className={[
                      "h-full rounded-full transition-[width]",
                      showUpgradeWarning ? "bg-[var(--review)]" : "bg-[var(--processing)]"
                    ].join(" ")}
                    style={{ width: `${usagePercentClamped}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <CycleDetailCard label={copy.cycle} value={summary.cycleLabel} />
                <CycleDetailCard
                  label={copy.remainingUsage}
                  value={`${formatCompactNumber(summary.remainingUsage, locale)} ${copy.words}`}
                />
                <CycleDetailCard label={copy.reset} value={summary.resetDateLabel} />
              </div>
            </div>
          </div>

          <div
            className={[
              "rounded-[16px] border bg-white p-6",
              showUpgradeWarning
                ? "border-[var(--review-border)] bg-[var(--review-bg)]"
                : "border-[var(--border)]"
            ].join(" ")}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.upgrade}
            </p>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {showUpgradeWarning ? copy.nearLimit : copy.keepRoom}
            </h3>
            <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">
              {showUpgradeWarning
                ? locale === "de"
                  ? `Du hast bereits ${formatPercent(summary.percentConsumed)} dieses Zyklus verbraucht. Upgrade deinen Plan oder kaufe vor ${summary.resetDateLabel} zusätzliche Credits, damit kommende Auslieferungen nicht ausgebremst werden.`
                  : `You've already used ${formatPercent(summary.percentConsumed)} of this cycle. Upgrade your plan or add credits before ${summary.resetDateLabel} to avoid slowing down upcoming deliveries.`
                : copy.healthyRange}
            </p>

            {showUpgradeWarning ? (
              <div className="mt-4 rounded-[12px] border border-[var(--review-border)] bg-white/72 px-4 py-3 text-[12px] text-[var(--review)]">
                {copy.remainingUsageLow} {formatCompactNumber(summary.remainingUsage, locale)} {copy.words}.
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-[12.5px] font-medium text-[var(--foreground)] shadow-[0_8px_20px_rgba(17,17,16,0.06)] transition hover:border-[var(--foreground)] hover:bg-[var(--background-strong)]"
              >
                {copy.upgradePlan}
              </Link>
              <Link
                href="/billing?intent=credits"
                className="inline-flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
              >
                {copy.buyCredits}
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-[14px] border border-[var(--border)] bg-white p-2">
          <div className="inline-flex rounded-[10px] bg-[var(--background)] p-1">
            {USAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "rounded-[8px] px-4 py-2 text-[12.5px] font-medium transition",
                  activeTab === tab.id
                    ? "bg-white text-[var(--foreground)] shadow-[0_1px_2px_rgba(17,17,16,0.06)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                ].join(" ")}
              >
                {tab.id === "overview" ? copy.tabs.overview : tab.id === "breakdown" ? copy.tabs.breakdown : copy.tabs.activity}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[11.5px] text-[var(--muted-soft)]">
            {copy.everythingInside}
          </div>
        </section>

        {activeTab === "overview" ? (
          <OverviewTab metrics={overviewMetrics} trend={data.trend} updatedLabel={data.updatedLabel} />
        ) : null}

        {activeTab === "breakdown" ? (
          <BreakdownTab
            projectUsage={data.projectUsage}
            languageUsage={data.languageUsage}
            topFiles={data.topFiles}
          />
        ) : null}

        {activeTab === "activity" ? <ActivityTab activity={data.activity} /> : null}
      </div>
    </div>
  );
}

function OverviewTab({
  metrics,
  trend,
  updatedLabel
}: {
  metrics: Array<{ label: string; value: string; meta: string }>;
  trend: UsageTrendPoint[];
  updatedLabel: string;
}) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} meta={metric.meta} />
        ))}
      </section>

      <UsageTrendCard trend={trend} updatedLabel={updatedLabel} />
    </div>
  );
}

function BreakdownTab({
  projectUsage,
  languageUsage,
  topFiles
}: {
  projectUsage: UsageProjectInsightItem[];
  languageUsage: UsageLanguageInsightItem[];
  topFiles: UsageTopFileItem[];
}) {
  const locale = useAppLocale();
  const copy =
    locale === "de"
      ? {
          usagePerProject: "/ Nutzung pro Projekt",
          whereUsageGoes: "Wohin der Großteil der Nutzung fließt",
          project: "Projekt",
          files: "Dateien",
          share: "Anteil",
          used: "Verbraucht",
          status: "Status",
          noProjectUsage: "Noch keine Projektnutzung",
          noProjectUsageDesc: "Sobald Dateien übersetzt werden, erscheint hier die Nutzung auf Projektebene.",
          usagePerLanguage: "/ Nutzung pro Sprache",
          targetLanguages: "Zielsprachen mit dem meisten Volumen",
          fileLabel: (count: number) => `${count} Datei${count === 1 ? "" : "en"}`,
          noLanguageUsage: "Noch keine Sprachnutzung",
          noLanguageUsageDesc: "Sobald Übersetzungen gelaufen sind, erscheint hier das Volumen je Sprache.",
          topFiles: "/ Top-Dateien",
          topFilesTitle: "Dateien mit dem höchsten Verbrauch",
          words: "Wörter",
          noFileActivity: "Noch keine Dateiaktivität",
          noFileActivityDesc: "Top-Dateien erscheinen nach Uploads und Übersetzungen im Workspace."
        }
      : {
          usagePerProject: "/ Usage per project",
          whereUsageGoes: "Where most usage is going",
          project: "Project",
          files: "Files",
          share: "Share",
          used: "Used",
          status: "Status",
          noProjectUsage: "No project usage yet",
          noProjectUsageDesc: "Once files are translated, project-level usage will appear here.",
          usagePerLanguage: "/ Usage per language",
          targetLanguages: "Target languages using the most volume",
          fileLabel: (count: number) => `${count} file${count === 1 ? "" : "s"}`,
          noLanguageUsage: "No language usage yet",
          noLanguageUsageDesc: "Language-level volume will appear once translations have been run.",
          topFiles: "/ Top files",
          topFilesTitle: "Files driving the most usage",
          words: "words",
          noFileActivity: "No file activity yet",
          noFileActivityDesc: "Top files will appear after uploads and translations start moving through the workspace."
        };
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
      <div className="rounded-[16px] border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border-light)] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            {copy.usagePerProject}
          </p>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            {copy.whereUsageGoes}
          </h2>
        </div>

        {projectUsage.length > 0 ? (
          <div className="overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1.6fr)_90px_80px_95px_110px] border-b border-[var(--border-light)] bg-[var(--background)] px-5 py-3">
              {[copy.project, copy.files, copy.share, copy.used, copy.status].map((label) => (
                <span
                  key={label}
                  className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]"
                >
                  {label}
                </span>
              ))}
            </div>

            {projectUsage.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-[minmax(0,1.6fr)_90px_80px_95px_110px] items-center border-b border-[var(--border-light)] px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                    {project.name}
                  </p>
                  <p className="mt-1 truncate text-[11.5px] text-[var(--muted-soft)]">
                    {project.languages}
                  </p>
                </div>
                <div className="text-[12px] text-[var(--muted)]">{project.fileCount}</div>
                <div className="text-[12px] text-[var(--muted)]">{formatPercent(project.sharePercent)}</div>
                <div className="text-[12px] font-medium text-[var(--foreground)]">
                  {formatCompactNumber(project.wordsUsed, locale)}
                </div>
                <div>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={copy.noProjectUsage}
            description={copy.noProjectUsageDesc}
          />
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-[16px] border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border-light)] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.usagePerLanguage}
            </p>
            <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {copy.targetLanguages}
            </h2>
          </div>

          <div className="space-y-4 px-5 py-5">
            {languageUsage.length > 0 ? (
              languageUsage.map((language) => (
                <div key={language.code}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--foreground)]">{language.label}</p>
                      <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">
                        {copy.fileLabel(language.fileCount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-medium text-[var(--foreground)]">
                        {formatCompactNumber(language.wordsUsed, locale)}
                      </p>
                      <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">
                        {formatPercent(language.sharePercent)}
                      </p>
                    </div>
                  </div>
                  <div className="h-[5px] overflow-hidden rounded-full bg-[var(--border-light)]">
                    <div
                      className="h-full rounded-full bg-[var(--processing)]"
                      style={{ width: `${clamp(language.sharePercent, 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title={copy.noLanguageUsage}
                description={copy.noLanguageUsageDesc}
                compact
              />
            )}
          </div>
        </div>

        <div className="rounded-[16px] border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border-light)] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.topFiles}
            </p>
            <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {copy.topFilesTitle}
            </h2>
          </div>

          <div className="space-y-3 px-5 py-5">
            {topFiles.length > 0 ? (
              topFiles.map((file) => (
                <div
                  key={file.id}
                  className="rounded-[12px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                        {file.name}
                      </p>
                      <p className="mt-1 truncate text-[11.5px] text-[var(--muted-soft)]">
                        {file.projectName} · {file.languagePair}
                      </p>
                    </div>
                    <StatusBadge status={file.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-[11.5px] text-[var(--muted)]">
                    <span>{file.updatedLabel}</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatCompactNumber(file.wordsUsed, locale)} {copy.words}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title={copy.noFileActivity}
                description={copy.noFileActivityDesc}
                compact
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityTab({ activity }: { activity: UsageActivityFeedItem[] }) {
  const locale = useAppLocale();
  const copy =
    locale === "de"
      ? {
          recentActivity: "/ Letzte Aktivität",
          heading: "Uploads, Übersetzungen und Exporte",
          emptyTitle: "Keine aktuelle Aktivität",
          emptyDescription: "Uploads, Übersetzungen und Exporte erscheinen hier, sobald der Workspace aktiv wird."
        }
      : {
          recentActivity: "/ Recent activity",
          heading: "Uploads, translations, and exports",
          emptyTitle: "No recent activity",
          emptyDescription: "Uploads, translations, and exports will appear here as soon as the workspace becomes active."
        };
  return (
    <section className="rounded-[16px] border border-[var(--border)] bg-white">
      <div className="border-b border-[var(--border-light)] px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
          {copy.recentActivity}
        </p>
        <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          {copy.heading}
        </h2>
      </div>

      <div className="px-5 py-5">
        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-5 rounded-[12px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4"
              >
                <div className="flex min-w-0 gap-3">
                  <ActivityKindBadge kind={item.kind} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--foreground)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">
                      {item.detail}
                    </p>
                    <p className="mt-2 text-[11.5px] text-[var(--muted-soft)]">
                      {item.projectName}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-[11.5px] text-[var(--muted-soft)]">
                  {item.timestampLabel}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        )}
      </div>
    </section>
  );
}

function UsageTrendCard({
  trend,
  updatedLabel
}: {
  trend: UsageTrendPoint[];
  updatedLabel: string;
}) {
  const locale = useAppLocale();
  const chartPoints = useMemo(() => buildChartPoints(trend, 520, 160), [trend]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const activePoint = activePointIndex !== null ? chartPoints.points[activePointIndex] ?? null : null;

  function handleChartMouseMove(event: ReactMouseEvent<SVGSVGElement>) {
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

  const tooltipClassName =
    activePoint && activePoint.x < 84
      ? "translate-x-0"
      : activePoint && activePoint.x > 476
        ? "-translate-x-full"
        : "-translate-x-1/2";
  const tooltipStyle =
    activePoint && activePoint.x < 84
      ? { left: "20px", top: "16px" }
      : activePoint && activePoint.x > 476
        ? { left: "calc(100% - 20px)", top: "16px" }
        : activePoint
          ? { left: `${(activePoint.x / 560) * 100}%`, top: "16px" }
          : undefined;

  const copy =
    locale === "de"
      ? {
          usageTrend: "/ Nutzungsverlauf",
          heading: "Nutzung in den letzten Tagen",
          helper: "Fahre mit der Maus über die Linie, um den exakten Wert pro Tag zu sehen.",
          wordsUsed: "Verbrauchte Wörter",
          aria: "Diagramm zum Nutzungsverlauf"
        }
      : {
          usageTrend: "/ Usage trend",
          heading: "Usage over the last days",
          helper: "Hover over the line to see the exact value for each day.",
          wordsUsed: "Words used",
          aria: "Usage trend chart"
        };

  return (
    <section className="rounded-[16px] border border-[var(--border)] bg-white">
      <div className="flex flex-col gap-3 border-b border-[var(--border-light)] px-5 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            {copy.usageTrend}
          </p>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            {copy.heading}
          </h2>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            {copy.helper}
          </p>
        </div>
        <div className="text-[11.5px] text-[var(--muted-soft)]">{updatedLabel}</div>
      </div>

      <div className="px-5 py-5">
        <div className="relative rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
          {activePoint ? (
            <div
              className={[
                "pointer-events-none absolute z-10 min-w-[144px] rounded-[10px] border border-[var(--border)] bg-white/96 px-3 py-2 shadow-[0_12px_24px_rgba(17,17,16,0.08)] backdrop-blur",
                tooltipClassName
              ].join(" ")}
              style={tooltipStyle}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {activePoint.label}
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-none text-[var(--foreground)]">
                {formatCompactNumber(activePoint.value, locale)}
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {copy.wordsUsed}
              </p>
            </div>
          ) : null}

          <svg
            ref={svgRef}
            viewBox="0 0 560 200"
            className="h-[220px] w-full"
            role="img"
            aria-label={copy.aria}
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
                />
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
    </section>
  );
}

function MetricCard({
  label,
  value,
  meta
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-white px-5 py-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
        {label}
      </p>
      <p className="mt-3 text-[20px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-[11.5px] text-[var(--muted)]">
        {meta}
      </p>
    </div>
  );
}

function CycleDetailCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
        {label}
      </p>
      <p className="mt-2 text-[13px] font-medium text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function ActivityKindBadge({ kind }: { kind: UsageActivityFeedItem["kind"] }) {
  const locale = useAppLocale();
  const content = getActivityKindContent(kind, locale);

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        content.className
      ].join(" ")}
    >
      {content.label}
    </span>
  );
}

function EmptyState({
  title,
  description,
  compact = false
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "px-4 py-3" : "px-6 py-10 text-center"}>
      <p className="text-[13px] font-medium text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function buildChartPoints(data: UsageTrendPoint[], width: number, height: number) {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getActivityKindContent(
  kind: UsageActivityFeedItem["kind"],
  locale: "en" | "de"
) {
  switch (kind) {
    case "upload":
      return {
        label: locale === "de" ? "Upload" : "Upload",
        className: "border-[var(--border)] bg-white text-[var(--muted)]"
      };
    case "export":
      return {
        label: locale === "de" ? "Export" : "Export",
        className: "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
      };
    case "translation":
    default:
      return {
        label: locale === "de" ? "Übersetzung" : "Translation",
        className: "border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]"
      };
  }
}
