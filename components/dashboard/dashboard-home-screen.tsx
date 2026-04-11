"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ReactNode } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { StatusBadge } from "@/components/projects/status-badge";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  formatProjectDate,
  getLanguageLabel
} from "@/lib/projects/formatters";
import { getProjectSummary } from "@/lib/projects/mock-data";
import type { ProjectsOverviewData } from "@/types/workspace";

type DashboardHomeScreenProps = {
  data: ProjectsOverviewData;
};

export function DashboardHomeScreen({ data }: DashboardHomeScreenProps) {
  const locale = useAppLocale();
  const home = data.home;
  const projects = data.projects;
  const insights = useMemo(() => {
    const aggregateTargetLanguages = (
      entries: Array<{ targetLanguage: string; words: number }>
    ) =>
      Array.from(
        entries.reduce((map, entry) => {
          const safeWords = Math.max(entry.words, 0);

          if (!entry.targetLanguage || safeWords <= 0) {
            return map;
          }

          const existing = map.get(entry.targetLanguage) ?? {
            code: entry.targetLanguage,
            words: 0,
            files: 0
          };

          existing.words += safeWords;
          existing.files += 1;
          map.set(entry.targetLanguage, existing);
          return map;
        }, new Map<string, { code: string; words: number; files: number }>())
          .values()
      )
        .filter((entry) => entry.files > 0 && entry.words > 0)
        .sort((left, right) => right.words - left.words || right.files - left.files)
        .slice(0, 5);

    const projectSummaries = projects.map((project) => {
      const summary = getProjectSummary(project);
      const processingFiles = project.files.filter(
        (file) => file.status === "Processing" || file.status === "Queued"
      ).length;
      const reviewFiles = project.files.filter((file) => file.status === "Review").length;
      const failedFiles = project.files.filter((file) => file.status === "Error").length;

      return {
        project,
        summary,
        processingFiles,
        reviewFiles,
        failedFiles,
        attentionScore:
          failedFiles * 5 +
          reviewFiles * 3 +
          processingFiles * 2 +
          (project.status === "Error" ? 6 : 0) +
          (project.status === "In Review" ? 3 : 0)
      };
    });
    const activeProjects = projectSummaries.filter(
      ({ project }) => project.status === "Active" || project.status === "In Review"
    ).length;
    const filesInProgress = projectSummaries.reduce((sum, item) => sum + item.processingFiles, 0);
    const reviewQueue = projectSummaries.reduce((sum, item) => sum + item.reviewFiles, 0);
    const qualityProjects = projectSummaries.filter(({ project }) => project.qualityScore > 0);
    const averageQualityScore =
      qualityProjects.length > 0
        ? Math.round(
            qualityProjects.reduce((sum, { project }) => sum + project.qualityScore, 0) /
              qualityProjects.length
          )
        : 0;
    const attentionProjects = projectSummaries
      .filter(
        ({ project, processingFiles, reviewFiles, failedFiles }) =>
          project.status === "In Review" ||
          project.status === "Error" ||
          processingFiles > 0 ||
          reviewFiles > 0 ||
          failedFiles > 0
      )
      .sort((left, right) => {
        if (right.attentionScore !== left.attentionScore) {
          return right.attentionScore - left.attentionScore;
        }

        return new Date(right.project.lastUpdated).getTime() - new Date(left.project.lastUpdated).getTime();
      })
      .slice(0, 5);
    const fileBasedTopLanguages = aggregateTargetLanguages(
      projects.flatMap((project) =>
        project.files
          .filter((file) => file.status !== "Queued" && file.words > 0)
          .map((file) => ({ targetLanguage: file.targetLanguage, words: file.words }))
      )
    );
    const recentTranslationTopLanguages = aggregateTargetLanguages(
      home.recentTranslations.map((translation) => ({
        targetLanguage: translation.targetLanguage,
        words: translation.wordsUsed
      }))
    );
    const projectedTopLanguages = aggregateTargetLanguages(
      projects.flatMap((project) => {
        const targetCount = Math.max(project.targetLanguages.length, 1);
        const estimatedWordsPerLanguage =
          project.creditsUsed > 0 ? Math.round(project.creditsUsed / targetCount) : 0;

        return project.targetLanguages.map((targetLanguage) => ({
          targetLanguage,
          words: estimatedWordsPerLanguage
        }));
      })
    );
    const targetLanguageOccurrences = projects.flatMap((project) =>
      project.targetLanguages.length > 0
        ? project.targetLanguages
        : project.files.map((file) => file.targetLanguage)
    );
    const monthlyVolumeFallbackTopLanguages = aggregateTargetLanguages(
      targetLanguageOccurrences.map((targetLanguage) => ({
        targetLanguage,
        words:
          home.wordsThisMonth > 0 && targetLanguageOccurrences.length > 0
            ? Math.round(home.wordsThisMonth / targetLanguageOccurrences.length)
            : 0
      }))
    );
    const topLanguages =
      fileBasedTopLanguages.length > 0
        ? fileBasedTopLanguages
        : recentTranslationTopLanguages.length > 0
          ? recentTranslationTopLanguages
          : projectedTopLanguages.length > 0
            ? projectedTopLanguages
            : monthlyVolumeFallbackTopLanguages;
    const recentActivity = projects
      .flatMap((project) =>
        project.recentActivity.map((activity) => ({
          id: `${project.id}-${activity.id}`,
          projectId: project.id,
          projectName: project.name,
          title: activity.title,
          detail: activity.detail,
          timestamp: activity.timestamp
        }))
      )
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 6);

    return {
      activeProjects,
      filesInProgress,
      reviewQueue,
      averageQualityScore,
      attentionProjects,
      topLanguages,
      recentActivity
    };
  }, [home.recentTranslations, home.wordsThisMonth, projects]);
  const usagePercent = Math.max(0, Math.min(home.planPercent, 100));
  const cycleRange = formatCycleRange(home.cycleStart, home.cycleEnd, locale);
  const copy =
    locale === "de"
      ? {
          breadcrumb: "/ dashboard",
          heading: "Workspace Dashboard",
          intro: "Verbrauch, operative Lage und die letzten Übersetzungen in einer kompakten Übersicht.",
          usageAction: "Nutzung",
          billingAction: "Abrechnung öffnen",
          newProjectAction: "+ Neues Projekt",
          wordsTranslated: "Wörter übersetzt",
          costThisMonth: "Kosten diesen Monat",
          savingsVsAgency: "Ersparnis vs. Agentur",
          creditsRemaining: "Credits verbleibend",
          agencyBaseline: "Agentur-Basis",
          benchmarkNote: "Benchmark auf Basis von 0,12 € pro Wort.",
          resetsOn: "Reset",
          healthy: "Gesund",
          limited: "Begrenzt",
          projectsSection: "Projekte",
          projectsAttention: "Projekte mit Aufmerksamkeit",
          viewAll: "Alle anzeigen",
          noAttention: "Keine weiteren Projekte brauchen Aufmerksamkeit.",
          noAttentionCta: "Alle Projekte öffnen →",
          processing: "Bearbeitung",
          review: "Review",
          failed: "Fehler",
          operatingState: "Betriebszustand",
          activeProjects: "Aktive Projekte",
          filesInProgress: "Dateien in Bearbeitung",
          reviewQueue: "Review-Warteschlange",
          averageQuality: "Ø Qualität",
          noDataYet: "Noch keine Daten",
          recentActivity: "Letzte Aktivität",
          noActivity: "Noch keine Aktivität im Workspace.",
          noActivityCta: "Projekte öffnen →",
          languagesSection: "Sprachen",
          targetLanguages: "Zielsprachen nach Volumen",
          noLanguages: "Noch keine Zielsprachen mit Volumen.",
          noLanguagesCta: "Datei hochladen, um zu starten →",
          filesLabel: "Dateien",
          translationsSection: "Übersetzungen",
          latestTranslations: "Letzte Übersetzungen",
          noTranslations: "Noch keine fertigen Übersetzungen in diesem Monat.",
          noTranslationsCta: "Datei hochladen, um zu starten →"
        }
      : {
          breadcrumb: "/ dashboard",
          heading: "Workspace Dashboard",
          intro: "Usage, operating state, and recent translations in one compact workspace view.",
          usageAction: "Usage",
          billingAction: "Open billing",
          newProjectAction: "+ New project",
          wordsTranslated: "Words translated",
          costThisMonth: "Cost this month",
          savingsVsAgency: "Savings vs. agency",
          creditsRemaining: "Credits remaining",
          agencyBaseline: "Agency baseline",
          benchmarkNote: "Benchmarked against EUR 0.12 per word.",
          resetsOn: "Resets",
          healthy: "Healthy",
          limited: "Watch",
          projectsSection: "Projects",
          projectsAttention: "Projects needing attention",
          viewAll: "View all",
          noAttention: "No other projects need attention.",
          noAttentionCta: "Open all projects →",
          processing: "processing",
          review: "review",
          failed: "failed",
          operatingState: "Operating state",
          activeProjects: "Active projects",
          filesInProgress: "Files in progress",
          reviewQueue: "Review queue",
          averageQuality: "Avg. quality",
          noDataYet: "No data yet",
          recentActivity: "Recent activity",
          noActivity: "No workspace activity yet.",
          noActivityCta: "Open projects →",
          languagesSection: "Languages",
          targetLanguages: "Target languages by volume",
          noLanguages: "No target language volume yet.",
          noLanguagesCta: "Upload a file to get started →",
          filesLabel: "files",
          translationsSection: "Translations",
          latestTranslations: "Latest translations",
          noTranslations: "No completed translations this month.",
          noTranslationsCta: "Upload a file to get started →"
        };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b-[0.5px] border-[var(--border)] bg-[var(--background)] px-6">
        <p className="text-[11px] text-[var(--muted-soft)]">{copy.breadcrumb}</p>
        <div className="flex items-center gap-2">
          <TopbarAction href="/usage">{copy.usageAction}</TopbarAction>
          <TopbarAction href="/billing">{copy.billingAction}</TopbarAction>
          <TopbarAction href="/projects" tone="primary">
            {copy.newProjectAction}
          </TopbarAction>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
        <section>
          <h1 className="text-[20px] font-medium tracking-[-0.03em] text-[var(--foreground)]">
            {copy.heading}
          </h1>
          <p className="mt-1 truncate text-[12px] text-[var(--muted)]">{copy.intro}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricSurface
            title={copy.wordsTranslated}
            value={formatCompactNumber(home.wordsThisMonth, locale)}
            detail={cycleRange}
          />
          <MetricSurface
            title={copy.costThisMonth}
            value={formatCurrency(home.costThisMonthCents / 100, locale)}
            detail={`${copy.agencyBaseline} ${formatCurrency(home.agencyCostThisMonthCents / 100, locale)}`}
          />
          <MetricSurface
            title={copy.savingsVsAgency}
            value={formatCurrency(home.savingsVsAgencyCents / 100, locale)}
            detail={copy.benchmarkNote}
          />
          <CreditsMetricSurface
            title={copy.creditsRemaining}
            value={`${formatCompactNumber(home.creditsRemaining, locale)} / ${formatCompactNumber(home.creditsLimit, locale)}`}
            progress={usagePercent}
            resetLabel={`${copy.resetsOn} ${formatProjectDate(home.cycleEnd, locale)}`}
            badgeLabel={usagePercent >= 80 ? copy.limited : copy.healthy}
            badgeTone={usagePercent >= 80 ? "warning" : "healthy"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <SectionLabel>{copy.projectsSection}</SectionLabel>
            <Card>
              <CardHeader
                title={copy.projectsAttention}
                action={
                  <Link href="/projects" className="text-[12px] font-medium text-[var(--processing)] transition hover:opacity-80">
                    {copy.viewAll}
                  </Link>
                }
              />
              <div className="px-4 py-1">
                {insights.attentionProjects.length > 0 ? (
                  insights.attentionProjects.map(({ project, summary, processingFiles, reviewFiles, failedFiles }) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="grid gap-4 border-b-[0.5px] border-[var(--border-light)] py-4 transition hover:opacity-85 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.9fr)] md:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                          {project.name}
                        </p>
                        <p className="mt-1 text-[12px] text-[var(--muted)]">
                          {processingFiles} {copy.processing} · {reviewFiles} {copy.review} · {failedFiles} {copy.failed}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <div className="min-w-[110px] flex-1 md:max-w-[160px]">
                          <div className="h-1 overflow-hidden rounded-full bg-[var(--border-light)]">
                            <div
                              className={["h-full rounded-full", getAttentionProgressTone(project.status, failedFiles, reviewFiles)].join(" ")}
                              style={{ width: `${Math.max(0, Math.min(summary.overallProgress, 100))}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right text-[12px] font-medium text-[var(--foreground)]">
                          {summary.overallProgress}%
                        </span>
                        <StatusBadge status={project.status} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState href="/projects" message={copy.noAttention} cta={copy.noAttentionCta} />
                )}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader title={copy.operatingState} />
              <div className="px-4 py-1">
                <StateRow
                  label={copy.activeProjects}
                  value={insights.activeProjects > 0 ? formatCompactNumber(insights.activeProjects, locale) : null}
                  emptyLabel={copy.noDataYet}
                />
                <StateRow
                  label={copy.filesInProgress}
                  value={insights.filesInProgress > 0 ? formatCompactNumber(insights.filesInProgress, locale) : null}
                  emptyLabel={copy.noDataYet}
                />
                <StateRow
                  label={copy.reviewQueue}
                  value={insights.reviewQueue > 0 ? formatCompactNumber(insights.reviewQueue, locale) : null}
                  emptyLabel={copy.noDataYet}
                />
                <StateRow
                  label={copy.averageQuality}
                  value={insights.averageQualityScore > 0 ? `${insights.averageQualityScore}/100` : null}
                  emptyLabel={copy.noDataYet}
                />
              </div>
            </Card>

            <Card>
              <CardHeader title={copy.recentActivity} />
              <div className="px-4 py-1">
                {insights.recentActivity.length > 0 ? (
                  insights.recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/projects/${activity.projectId}`}
                      className="flex gap-3 border-b-[0.5px] border-[var(--border-light)] py-4 transition hover:opacity-85 last:border-b-0"
                    >
                      <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-[var(--success)]" />
                      <div className="min-w-0">
                        <p className="text-[12.5px] text-[var(--foreground)]">
                          {activity.title} · {activity.projectName} · {activity.detail}
                        </p>
                        <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">
                          {formatProjectDate(activity.timestamp, locale)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState href="/projects" message={copy.noActivity} cta={copy.noActivityCta} />
                )}
              </div>
            </Card>
          </div>
        </section>

        <section>
          <SectionLabel>{copy.languagesSection}</SectionLabel>
          <Card>
            <CardHeader title={copy.targetLanguages} />
            <div className="px-4 py-1">
              {insights.topLanguages.length > 0 ? (
                insights.topLanguages.map((language) => {
                  const sharePercent = home.wordsThisMonth > 0 ? (language.words / home.wordsThisMonth) * 100 : 0;

                  return (
                    <div
                      key={language.code}
                      className="grid gap-4 border-b-[0.5px] border-[var(--border-light)] py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_110px]"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-[var(--foreground)]">
                          {getLanguageLabel(language.code, locale)}
                        </p>
                        <p className="mt-1 text-[12px] text-[var(--muted)]">
                          {formatCompactNumber(language.files, locale)} {copy.filesLabel}
                        </p>
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--border-light)]">
                          <div
                            className="h-full rounded-full bg-[var(--processing)]"
                            style={{ width: `${Math.max(0, Math.min(sharePercent, 100))}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[12.5px] font-medium text-[var(--foreground)]">
                          {formatCompactNumber(language.words, locale)}
                        </p>
                        <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">
                          {formatPercent(sharePercent)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState href="/projects" message={copy.noLanguages} cta={copy.noLanguagesCta} />
              )}
            </div>
          </Card>
        </section>

        <section>
          <SectionLabel>{copy.translationsSection}</SectionLabel>
          <Card>
            <CardHeader title={copy.latestTranslations} />
            <div className="px-4 py-1">
              {home.recentTranslations.length > 0 ? (
                home.recentTranslations.map((translation) => (
                  <Link
                    key={translation.id}
                    href={`/projects/${translation.projectId}`}
                    className="flex items-start justify-between gap-4 border-b-[0.5px] border-[var(--border-light)] py-4 transition hover:opacity-85 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                        {translation.fileName}
                      </p>
                      <p className="mt-1 text-[12px] text-[var(--muted)]">
                        {translation.projectName} · {translation.sourceLanguage.toUpperCase()} →{" "}
                        {translation.targetLanguage.toUpperCase()}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[12.5px] font-medium text-[var(--foreground)]">
                        {formatCompactNumber(translation.wordsUsed, locale)}
                      </p>
                      <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">
                        {formatProjectDate(translation.timestamp, locale)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState href="/projects" message={copy.noTranslations} cta={copy.noTranslationsCta} />
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function TopbarAction({
  href,
  children,
  tone = "ghost"
}: {
  href: string;
  children: ReactNode;
  tone?: "ghost" | "primary";
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-8 items-center justify-center rounded-[8px] px-3 text-[12px] font-medium transition-colors",
        tone === "primary"
          ? "bg-[var(--foreground)] !text-white hover:opacity-90 hover:!text-white"
          : "border border-[0.5px] border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)]"
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]">
      {children}
    </p>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden rounded-[10px] border-[0.5px] border-[var(--border)] bg-white">{children}</section>;
}

function CardHeader({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-[0.5px] border-[var(--border-light)] px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]">
        {title}
      </p>
      {action}
    </div>
  );
}

function MetricSurface({
  title,
  value,
  detail
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[8px] bg-[var(--background-strong)] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]">
        {title}
      </p>
      <p className="mt-3 text-[30px] font-medium leading-none tracking-[-0.05em] text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-[12px] text-[var(--muted)]">{detail}</p>
    </article>
  );
}

function CreditsMetricSurface({
  title,
  value,
  progress,
  resetLabel,
  badgeLabel,
  badgeTone
}: {
  title: string;
  value: string;
  progress: number;
  resetLabel: string;
  badgeLabel: string;
  badgeTone: "healthy" | "warning";
}) {
  return (
    <article className="rounded-[8px] bg-[var(--background-strong)] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]">
        {title}
      </p>
      <p className="mt-3 text-[30px] font-medium leading-none tracking-[-0.05em] text-[var(--foreground)]">
        {value}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--border)]">
        <div className="h-full rounded-full bg-[var(--processing)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[12px] text-[var(--muted)]">{resetLabel}</p>
        <span
          className={[
            "inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium",
            badgeTone === "healthy"
              ? "bg-[var(--success-bg)] text-[var(--success)]"
              : "bg-[var(--review-bg)] text-[var(--review)]"
          ].join(" ")}
        >
          {badgeLabel}
        </span>
      </div>
    </article>
  );
}

function StateRow({
  label,
  value,
  emptyLabel
}: {
  label: string;
  value: string | null;
  emptyLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-[0.5px] border-[var(--border-light)] py-3 last:border-b-0">
      <span className="text-[12.5px] text-[var(--foreground)]">{label}</span>
      {value ? (
        <span className="text-[12.5px] font-medium text-[var(--foreground)]">{value}</span>
      ) : (
        <span className="text-[12px] text-[var(--muted-soft)]">{emptyLabel}</span>
      )}
    </div>
  );
}

function EmptyState({
  href,
  message,
  cta
}: {
  href: string;
  message: string;
  cta: string;
}) {
  return (
    <div className="px-2 py-8 text-center text-[12px] text-[var(--muted-soft)]">
      <span>{message} </span>
      <Link href={href} className="font-medium text-[var(--processing)] transition hover:opacity-80">
        {cta}
      </Link>
    </div>
  );
}

function getAttentionProgressTone(status: string, failedFiles: number, reviewFiles: number) {
  if (status === "Error" || failedFiles > 0) {
    return "bg-[var(--danger)]";
  }

  if (status === "In Review" || reviewFiles > 0) {
    return "bg-[var(--review)]";
  }

  return "bg-[var(--processing)]";
}

function formatCycleRange(cycleStart: string, cycleEnd: string, locale: string) {
  const start = new Date(cycleStart);
  const end = new Date(cycleEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }

  if (locale === "de") {
    const formatter = new Intl.DateTimeFormat("de-AT", {
      day: "numeric",
      month: "short"
    });

    return `${formatter.format(start)}–${formatter.format(end)}`;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  });

  return `${formatter.format(start)}–${formatter.format(end)}`;
}
