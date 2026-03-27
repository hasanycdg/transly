"use client";

import Link from "next/link";
import { useMemo } from "react";

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
        .slice(0, 4);

    const projectSummaries = projects.map((project) => {
      const summary = getProjectSummary(project);
      const processingFiles = project.files.filter((file) => file.status === "Processing" || file.status === "Queued").length;
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
    const completedFiles = projectSummaries.reduce((sum, item) => sum + item.summary.completedFiles, 0);
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
          project.status !== "Completed" || processingFiles > 0 || reviewFiles > 0 || failedFiles > 0
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
      completedFiles,
      averageQualityScore,
      attentionProjects,
      topLanguages,
      recentActivity
    };
  }, [home.recentTranslations, home.wordsThisMonth, projects]);
  const usagePercent = Math.max(0, Math.min(home.planPercent, 100));
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Dashboard",
          heading: "Workspace Dashboard",
          intro:
            "Monatsverbrauch, Projektzustand und die zuletzt bewegten Übersetzungen auf einer operativen Startseite.",
          currentCycle: "/ Aktueller Zyklus",
          currentCycleIntro: "Verbrauch und Bewegung im laufenden Abrechnungszyklus.",
          wordsThisMonth: "Wörter diesen Monat",
          costThisMonth: "Kosten diesen Monat",
          savingsVsAgency: "Eingesparte Kosten vs. klassische Agentur",
          savingsMeta: "Verglichen mit einer Agentur-Basis von 0,12 € pro Wort.",
          agencyBaseline: "Klassische Agentur",
          usedOfLimit: "Verbrauch im aktuellen Limit",
          remainingCredits: "Verbleibende Credits",
          resetOn: "Reset am",
          quickActions: "/ Schnellzugriffe",
          quickActionsIntro: "Direkte Wege in die häufigsten Arbeitsflächen.",
          createProject: "Projekt anlegen",
          openUsage: "Nutzung öffnen",
          openBilling: "Abrechnung öffnen",
          dashboardHealth: "/ Operativer Zustand",
          activeProjects: "Aktive Projekte",
          activeProjectsMeta: (total: number) => `Von ${formatCompactNumber(total, locale)} insgesamt`,
          filesInProgress: "Dateien in Bearbeitung",
          filesInProgressMeta: (completed: number) => `${formatCompactNumber(completed, locale)} abgeschlossen`,
          reviewQueue: "Review-Warteschlange",
          reviewQueueMeta: (percent: number) => `${formatPercent(percent)} des Limits verbraucht`,
          qualityAverage: "Ø Qualität",
          qualityAverageMeta: "Über Projekte mit Score",
          watchlist: "/ Projekte mit Aufmerksamkeit",
          watchlistIntro: "Projekte mit offener Übersetzung, Review oder Fehlern.",
          noWatchlist: "Aktuell ist kein Projekt mit offener Aufmerksamkeit vorhanden.",
          processing: "In Bearbeitung",
          review: "Review",
          failed: "Fehler",
          progress: "Fortschritt",
          topLanguages: "/ Zielsprachen mit Volumen",
          topLanguagesIntro: "Welche Zielsprachen aktuell die meisten Credits binden.",
          noLanguages: "Noch keine Zielsprachen mit verbrauchtem Volumen.",
          filesLabel: "Dateien",
          recentActivity: "/ Letzte Aktivität",
          recentActivityIntro: "Die jüngsten Bewegungen quer durch den Workspace.",
          noActivity: "Noch keine Aktivität im Workspace.",
          latestTranslations: "/ Letzte Übersetzungen",
          latestTranslationsIntro: "Die zuletzt fertig gewordenen Übersetzungen im Workspace.",
          noRecentTranslations: "Noch keine fertigen Übersetzungen in diesem Monat.",
          goToProjects: "Zu Projekten",
          translateText: "Text übersetzen",
          utilizationHealthy: "Gesunder Bereich",
          utilizationWarning: "Begrenzt verfügbar"
        }
      : {
          eyebrow: "/ Dashboard",
          heading: "Workspace Dashboard",
          intro:
            "Monthly usage, project state, and recently moved translations on one operational home screen.",
          currentCycle: "/ Current cycle",
          currentCycleIntro: "Consumption and movement inside the active billing cycle.",
          wordsThisMonth: "Words this month",
          costThisMonth: "Cost this month",
          savingsVsAgency: "Savings vs. a traditional agency",
          savingsMeta: "Benchmarked against a EUR 0.12 per-word agency baseline.",
          agencyBaseline: "Traditional agency",
          usedOfLimit: "Used of current limit",
          remainingCredits: "Credits remaining",
          resetOn: "Resets on",
          quickActions: "/ Quick actions",
          quickActionsIntro: "Direct routes into the surfaces used most often.",
          createProject: "Create project",
          openUsage: "Open usage",
          openBilling: "Open billing",
          dashboardHealth: "/ Operating state",
          activeProjects: "Active projects",
          activeProjectsMeta: (total: number) => `Of ${formatCompactNumber(total, locale)} total`,
          filesInProgress: "Files in progress",
          filesInProgressMeta: (completed: number) => `${formatCompactNumber(completed, locale)} completed`,
          reviewQueue: "Review queue",
          reviewQueueMeta: (percent: number) => `${formatPercent(percent)} of plan consumed`,
          qualityAverage: "Avg. quality",
          qualityAverageMeta: "Across scored projects",
          watchlist: "/ Projects needing attention",
          watchlistIntro: "Projects with open translation, review, or failures.",
          noWatchlist: "No project currently needs attention.",
          processing: "Processing",
          review: "Review",
          failed: "Failed",
          progress: "Progress",
          topLanguages: "/ Target languages by volume",
          topLanguagesIntro: "Which target languages currently consume the most credits.",
          noLanguages: "No target languages have consumed volume yet.",
          filesLabel: "files",
          recentActivity: "/ Recent activity",
          recentActivityIntro: "The latest movement across the workspace.",
          noActivity: "No workspace activity yet.",
          latestTranslations: "/ Latest translations",
          latestTranslationsIntro: "The most recently finished translations across the workspace.",
          noRecentTranslations: "No completed translations yet this month.",
          goToProjects: "Go to projects",
          translateText: "Translate text",
          utilizationHealthy: "Healthy range",
          utilizationWarning: "Limited headroom"
        };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[820px]">
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

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
            >
              {copy.goToProjects}
            </Link>
            <Link
              href="/translate"
              className="inline-flex items-center justify-center rounded-[10px] bg-[var(--foreground)] px-4 py-2.5 text-[12.5px] font-medium text-white transition hover:opacity-90"
            >
              {copy.translateText}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.85fr)]">
          <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-white">
            <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    {copy.currentCycle}
                  </p>
                  <h2 className="mt-2 text-[34px] font-semibold tracking-[-0.08em] text-[var(--foreground)]">
                    {formatCompactNumber(home.wordsThisMonth, locale)}
                  </h2>
                  <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">
                    {copy.currentCycleIntro}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DashboardMetricPanel
                    label={copy.wordsThisMonth}
                    value={formatCompactNumber(home.wordsThisMonth, locale)}
                  />
                  <DashboardMetricPanel
                    label={copy.costThisMonth}
                    value={formatCurrency(home.costThisMonthCents / 100, locale)}
                  />
                  <DashboardMetricPanel
                    label={copy.savingsVsAgency}
                    value={formatCurrency(home.savingsVsAgencyCents / 100, locale)}
                    meta={copy.savingsMeta}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 text-[12px]">
                    <span className="text-[var(--muted)]">{copy.usedOfLimit}</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatCompactNumber(home.creditsUsed, locale)} / {formatCompactNumber(home.creditsLimit, locale)}
                    </span>
                  </div>
                  <div className="mt-3 h-[8px] overflow-hidden rounded-full bg-[var(--border-light)]">
                    <div
                      className={[
                        "h-full rounded-full transition-[width]",
                        usagePercent >= 80 ? "bg-[var(--review)]" : "bg-[var(--processing)]"
                      ].join(" ")}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[16px] border border-[var(--border)] bg-[var(--background)] p-5">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                      {copy.remainingCredits}
                    </p>
                    <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--foreground)]">
                      {usagePercent >= 80 ? copy.utilizationWarning : copy.utilizationHealthy}
                    </span>
                  </div>
                  <div className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.08em] text-[var(--foreground)]">
                    {formatCompactNumber(home.creditsRemaining, locale)}
                  </div>
                  <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                    {copy.resetOn} {formatProjectDate(home.cycleEnd, locale)}
                  </p>
                </div>

                <dl className="mt-8 space-y-3 border-t border-[var(--border)] pt-4 text-[12px]">
                  <MetricRow
                    label={copy.agencyBaseline}
                    value={formatCurrency(home.agencyCostThisMonthCents / 100, locale)}
                  />
                  <MetricRow
                    label={copy.costThisMonth}
                    value={formatCurrency(home.costThisMonthCents / 100, locale)}
                  />
                  <MetricRow
                    label={copy.usedOfLimit}
                    value={formatPercent(home.planPercent)}
                  />
                </dl>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.quickActions}
              </p>
              <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                {copy.quickActionsIntro}
              </p>
            </div>
            <div className="flex flex-col gap-3 px-5 py-5">
              <QuickActionLink href="/translate" label={copy.translateText} />
              <QuickActionLink href="/projects" label={copy.createProject} />
              <QuickActionLink href="/usage" label={copy.openUsage} />
              <QuickActionLink href="/billing" label={copy.openBilling} />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border-light)] px-6 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.dashboardHealth}
            </p>
          </div>
          <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
            <OperationalStat
              label={copy.activeProjects}
              value={formatCompactNumber(insights.activeProjects, locale)}
              meta={copy.activeProjectsMeta(projects.length)}
            />
            <OperationalStat
              label={copy.filesInProgress}
              value={formatCompactNumber(insights.filesInProgress, locale)}
              meta={copy.filesInProgressMeta(insights.completedFiles)}
            />
            <OperationalStat
              label={copy.reviewQueue}
              value={formatCompactNumber(insights.reviewQueue, locale)}
              meta={copy.reviewQueueMeta(home.planPercent)}
            />
            <OperationalStat
              label={copy.qualityAverage}
              value={insights.averageQualityScore > 0 ? `${insights.averageQualityScore}/100` : "0"}
              meta={copy.qualityAverageMeta}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-6 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.watchlist}
              </p>
              <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                {copy.watchlistIntro}
              </p>
            </div>
            <div className="px-6 py-3">
              {insights.attentionProjects.length > 0 ? (
                insights.attentionProjects.map(({ project, summary, processingFiles, reviewFiles, failedFiles }) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="grid gap-4 border-b border-[var(--border-light)] py-4 transition hover:opacity-85 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                          {project.name}
                        </p>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                        {processingFiles} {copy.processing} · {reviewFiles} {copy.review} · {failedFiles} {copy.failed}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[12px] font-medium text-[var(--foreground)]">
                        {summary.overallProgress}%
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--muted-soft)]">
                        {copy.progress}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-[12px] text-[var(--muted-soft)]">
                  {copy.noWatchlist}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.topLanguages}
                </p>
                <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                  {copy.topLanguagesIntro}
                </p>
              </div>
              <div className="px-5 py-3">
                {insights.topLanguages.length > 0 ? (
                  insights.topLanguages.map((language) => (
                    <div
                      key={language.code}
                      className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] py-3 last:border-b-0"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-[var(--foreground)]">
                          {getLanguageLabel(language.code, locale)}
                        </p>
                        <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                          {formatCompactNumber(language.files, locale)} {copy.filesLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-medium text-[var(--foreground)]">
                          {formatCompactNumber(language.words, locale)}
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--muted-soft)]">
                          {formatPercent(home.wordsThisMonth > 0 ? (language.words / home.wordsThisMonth) * 100 : 0)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-[12px] text-[var(--muted-soft)]">
                    {copy.noLanguages}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.recentActivity}
                </p>
                <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                  {copy.recentActivityIntro}
                </p>
              </div>
              <div className="px-5 py-3">
                {insights.recentActivity.length > 0 ? (
                  insights.recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/projects/${activity.projectId}`}
                      className="block border-b border-[var(--border-light)] py-3 transition hover:opacity-85 last:border-b-0"
                    >
                      <p className="text-[13px] font-medium text-[var(--foreground)]">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">
                        {activity.projectName} · {activity.detail}
                      </p>
                      <p className="mt-2 text-[11px] text-[var(--muted-soft)]">
                        {formatProjectDate(activity.timestamp, locale)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-[12px] text-[var(--muted-soft)]">
                    {copy.noActivity}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border-light)] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.latestTranslations}
            </p>
            <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
              {copy.latestTranslationsIntro}
            </p>
          </div>

          <div className="px-5 py-3">
            {home.recentTranslations.length > 0 ? (
              home.recentTranslations.map((translation) => (
                <Link
                  key={translation.id}
                  href={`/projects/${translation.projectId}`}
                  className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] py-3 transition hover:opacity-80 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                      {translation.fileName}
                    </p>
                    <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                      {translation.projectName} · {translation.sourceLanguage.toUpperCase()} → {translation.targetLanguage.toUpperCase()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-medium text-[var(--foreground)]">
                      {formatCompactNumber(translation.wordsUsed, locale)}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--muted-soft)]">
                      {formatProjectDate(translation.timestamp, locale)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-[12px] text-[var(--muted-soft)]">
                {copy.noRecentTranslations}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardMetricPanel({
  label,
  value,
  meta
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--background)] px-5 py-5">
      <div className="text-[30px] font-semibold leading-none tracking-[-0.08em] text-[var(--foreground)]">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-[var(--muted-soft)]">{label}</div>
      {meta ? <div className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">{meta}</div> : null}
    </div>
  );
}

function OperationalStat({
  label,
  value,
  meta
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="border-b border-[var(--border-light)] px-6 py-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="text-[28px] font-semibold leading-none tracking-[-0.08em] text-[var(--foreground)]">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-[var(--muted-soft)]">{label}</div>
      <div className="mt-1 text-[11.5px] text-[var(--muted)]">{meta}</div>
    </div>
  );
}

function MetricRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--muted-soft)]">{label}</dt>
      <dd className="font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function QuickActionLink({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
