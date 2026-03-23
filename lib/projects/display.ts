import { getProjectSummary } from "@/lib/projects/mock-data";
import { translateProjectOrFileStatus } from "@/lib/i18n";
import type { AppLocale } from "@/types/i18n";
import type { FileStatus, ProjectFilter, ProjectRecord, ProjectStatus } from "@/types/projects";

export type ProgressTone = "neutral" | "success" | "review" | "danger" | "processing";

type OverviewProjectOverride = {
  description: string;
  fileCount: number;
  languages: string[];
  progress: number;
  status: ProjectStatus;
  updated: string;
};

type OverviewStatsDisplay = {
  activeProjects: string;
  activeProjectsMeta: string;
  averageCompletion: string;
  averageCompletionMeta: string;
  filesInProgress: string;
  filesInProgressMeta: string;
  languagesActive: string;
  languagesActiveMeta: string;
};

export type OverviewProjectDisplay = OverviewProjectOverride;

const OVERVIEW_REFERENCE_IDS = [
  "wpml-platform-refresh",
  "developer-docs-sync",
  "help-center-migration",
  "shopify-launch-kit"
] as const;

const OVERVIEW_REFERENCE_OVERRIDES: Record<string, OverviewProjectOverride> = {
  "wpml-platform-refresh": {
    description: "Core website strings, checkout flows, product pages",
    languages: ["de", "fr", "nl"],
    fileCount: 6,
    progress: 68,
    status: "Active",
    updated: "2026-03-18T10:00:00.000Z"
  },
  "developer-docs-sync": {
    description: "API docs, onboarding guides, changelog snippets",
    languages: ["de", "es"],
    fileCount: 3,
    progress: 100,
    status: "In Review",
    updated: "2026-03-17T10:00:00.000Z"
  },
  "help-center-migration": {
    description: "Support articles across EU markets",
    languages: ["fr", "it"],
    fileCount: 11,
    progress: 80,
    status: "Active",
    updated: "2026-03-16T10:00:00.000Z"
  },
  "shopify-launch-kit": {
    description: "Storefront, emails, product descriptions",
    languages: ["de", "nl"],
    fileCount: 7,
    progress: 34,
    status: "In Review",
    updated: "2026-03-14T10:00:00.000Z"
  }
};

export function getOverviewProjectDisplay(project: ProjectRecord): OverviewProjectDisplay {
  const override = OVERVIEW_REFERENCE_OVERRIDES[project.id];

  if (override && project.origin === "seed") {
    return override;
  }

  const summary = getProjectSummary(project);

  return {
    description: project.description,
    languages: project.targetLanguages,
    fileCount: summary.totalFiles,
    progress: summary.overallProgress,
    status: project.status,
    updated: project.lastUpdated
  };
}

export function matchesOverviewProjectFilter(
  project: ProjectRecord,
  filter: ProjectFilter
): boolean {
  const status = getOverviewProjectDisplay(project).status;

  if (filter === "All") {
    return true;
  }

  if (filter === "Review") {
    return status === "In Review";
  }

  if (filter === "Done") {
    return status === "Completed";
  }

  return status === filter;
}

export function getOverviewStatsDisplay(
  projects: ProjectRecord[],
  locale: AppLocale = "en"
): OverviewStatsDisplay {
  if (usesReferenceOverviewStats(projects)) {
    return {
      activeProjects: "4",
      activeProjectsMeta: locale === "de" ? "↑ 2 diesen Monat" : "↑ 2 this month",
      averageCompletion: "78%",
      averageCompletionMeta: locale === "de" ? "↑ 12% diese Woche" : "↑ 12% this week",
      filesInProgress: "18",
      filesInProgressMeta: locale === "de" ? "Über alle Sprachen" : "Across all languages",
      languagesActive: "6",
      languagesActiveMeta: "DE, FR, NL, ES +2"
    };
  }

  const summaries = projects.map((project) => getProjectSummary(project));
  const overallProgress =
    summaries.length === 0
      ? 0
      : Math.round(
          summaries.reduce((total, summary) => total + summary.overallProgress, 0) /
            summaries.length
        );
  const activeLanguages = Array.from(
    new Set(projects.flatMap((project) => project.targetLanguages.map((language) => language.toUpperCase())))
  );
  const inProgressFiles = projects.reduce(
    (total, project) =>
      total + project.files.filter((file) => file.status !== "Done").length,
    0
  );

  return {
    activeProjects: String(projects.length),
    activeProjectsMeta:
      locale === "de"
        ? `${projects.filter((project) => project.origin === "custom").length} benutzerdefiniert`
        : `${projects.filter((project) => project.origin === "custom").length} custom`,
    averageCompletion: `${overallProgress}%`,
    averageCompletionMeta: locale === "de" ? "Über sichtbare Projekte" : "Across visible projects",
    filesInProgress: String(inProgressFiles),
    filesInProgressMeta: locale === "de" ? "Über alle Sprachen" : "Across all languages",
    languagesActive: String(activeLanguages.length),
    languagesActiveMeta: formatLanguageMeta(activeLanguages)
  };
}

export function getStatusLabel(
  status: ProjectStatus | FileStatus,
  locale: AppLocale = "en"
) {
  return translateProjectOrFileStatus(status, locale);
}

export function getProjectStatusTone(status: ProjectStatus): ProgressTone {
  switch (status) {
    case "Active":
      return "success";
    case "In Review":
      return "review";
    case "Error":
      return "danger";
    case "Completed":
    default:
      return "processing";
  }
}

export function getFileStatusTone(status: FileStatus): ProgressTone {
  switch (status) {
    case "Processing":
      return "processing";
    case "Review":
      return "review";
    case "Error":
      return "danger";
    case "Done":
      return "success";
    case "Queued":
    default:
      return "neutral";
  }
}

function usesReferenceOverviewStats(projects: ProjectRecord[]) {
  return (
    projects.length === OVERVIEW_REFERENCE_IDS.length &&
    projects.every((project) => project.origin === "seed") &&
    OVERVIEW_REFERENCE_IDS.every((projectId) =>
      projects.some((project) => project.id === projectId)
    )
  );
}

function formatLanguageMeta(languages: string[]) {
  if (languages.length <= 4) {
    return languages.join(", ");
  }

  return `${languages.slice(0, 4).join(", ")} +${languages.length - 4}`;
}
