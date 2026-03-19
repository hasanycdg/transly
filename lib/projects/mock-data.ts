import type { NewProjectInput, ProjectFileRecord, ProjectFilter, ProjectRecord, ProjectSummary } from "@/types/projects";

export const PROJECT_FILTERS: ProjectFilter[] = [
  "All",
  "Active",
  "Review",
  "Done"
];

const seedProjects: ProjectRecord[] = [
  {
    id: "wpml-platform-refresh",
    name: "WPML Platform Refresh",
    description:
      "Core website strings, checkout flows, and product pages for the next multilingual release cycle.",
    sourceLanguage: "en",
    targetLanguages: ["de", "fr", "nl"],
    status: "Active",
    lastUpdated: "2026-03-18T14:20:00.000Z",
    glossaryEnabled: true,
    creditsUsed: 182400,
    qualityScore: 96,
    latestExport: {
      label: "Release candidate bundle",
      timestamp: "2026-03-18T09:10:00.000Z",
      format: "XLIFF"
    },
    recentActivity: [
      {
        id: "activity-1",
        title: "French checkout flow moved to review",
        detail: "7 files passed placeholder validation and were promoted for final QA.",
        timestamp: "2026-03-18T14:20:00.000Z"
      },
      {
        id: "activity-2",
        title: "Glossary terms synced",
        detail: "Brand tone and checkout-specific protected phrases were refreshed.",
        timestamp: "2026-03-18T11:35:00.000Z"
      },
      {
        id: "activity-3",
        title: "German resource export generated",
        detail: "Export bundle prepared for agency delivery and WordPress import.",
        timestamp: "2026-03-17T16:10:00.000Z"
      }
    ],
    files: [
      buildFile("file-1", "checkout-flow.xliff", "en", "de", "Processing", 72, "2026-03-18T14:20:00.000Z", 18400),
      buildFile("file-2", "product-pages.xliff", "en", "fr", "Review", 100, "2026-03-18T13:10:00.000Z", 12950),
      buildFile("file-3", "account-settings.po", "en", "de", "Done", 100, "2026-03-18T09:50:00.000Z", 8920),
      buildFile("file-4", "marketing-homepage.strings", "en", "nl", "Queued", 0, "2026-03-18T08:20:00.000Z", 6240),
      buildFile("file-5", "campaign-banner.resx", "en", "fr", "Error", 38, "2026-03-17T18:15:00.000Z", 2140),
      buildFile("file-6", "navigation-shell.xliff", "en", "de", "Done", 100, "2026-03-17T12:05:00.000Z", 3020)
    ],
    origin: "seed"
  },
  {
    id: "developer-docs-sync",
    name: "Developer Docs Sync",
    description:
      "Localization workspace for API docs, onboarding guides, and changelog snippets across EU markets.",
    sourceLanguage: "en",
    targetLanguages: ["de", "es"],
    status: "In Review",
    lastUpdated: "2026-03-17T15:45:00.000Z",
    glossaryEnabled: true,
    creditsUsed: 94300,
    qualityScore: 98,
    latestExport: {
      label: "Docs package 3.4",
      timestamp: "2026-03-17T15:00:00.000Z",
      format: "PO"
    },
    recentActivity: [
      {
        id: "activity-4",
        title: "Spanish onboarding docs approved",
        detail: "Legal placeholders and code blocks were verified without manual corrections.",
        timestamp: "2026-03-17T15:45:00.000Z"
      },
      {
        id: "activity-5",
        title: "Glossary boost enabled",
        detail: "Developer terminology and command line fragments were pinned.",
        timestamp: "2026-03-17T09:25:00.000Z"
      }
    ],
    files: [
      buildFile("file-7", "api-reference.xliff", "en", "de", "Review", 100, "2026-03-17T15:45:00.000Z", 22400),
      buildFile("file-8", "quickstart.po", "en", "es", "Done", 100, "2026-03-17T14:12:00.000Z", 6800),
      buildFile("file-9", "release-notes.strings", "en", "de", "Done", 100, "2026-03-17T13:00:00.000Z", 3540)
    ],
    origin: "seed"
  },
  {
    id: "shopify-launch-kit",
    name: "Shopify Launch Kit",
    description:
      "Storefront localization package for app listings, transactional emails, and merchant onboarding flows.",
    sourceLanguage: "en",
    targetLanguages: ["fr", "it"],
    status: "Completed",
    lastUpdated: "2026-03-15T10:15:00.000Z",
    glossaryEnabled: false,
    creditsUsed: 61320,
    qualityScore: 99,
    latestExport: {
      label: "Merchant handoff",
      timestamp: "2026-03-15T10:15:00.000Z",
      format: "XLIFF"
    },
    recentActivity: [
      {
        id: "activity-6",
        title: "All deliverables exported",
        detail: "Final translated packages were downloaded by the delivery team.",
        timestamp: "2026-03-15T10:15:00.000Z"
      }
    ],
    files: [
      buildFile("file-10", "app-listing.xliff", "en", "fr", "Done", 100, "2026-03-15T09:10:00.000Z", 4100),
      buildFile("file-11", "merchant-onboarding.resx", "en", "it", "Done", 100, "2026-03-15T08:44:00.000Z", 7620),
      buildFile("file-12", "transactional-emails.po", "en", "fr", "Done", 100, "2026-03-14T16:20:00.000Z", 5820)
    ],
    origin: "seed"
  },
  {
    id: "help-center-migration",
    name: "Help Center Migration",
    description:
      "Support center migration from legacy content with mixed XML fragments and historical glossary drift.",
    sourceLanguage: "en",
    targetLanguages: ["de"],
    status: "Error",
    lastUpdated: "2026-03-16T18:05:00.000Z",
    glossaryEnabled: true,
    creditsUsed: 28740,
    qualityScore: 88,
    latestExport: undefined,
    recentActivity: [
      {
        id: "activity-7",
        title: "Inline tag validation failed",
        detail: "Two legacy files include malformed nested placeholders that require manual cleanup.",
        timestamp: "2026-03-16T18:05:00.000Z"
      }
    ],
    files: [
      buildFile("file-13", "faq-import.xliff", "en", "de", "Error", 54, "2026-03-16T18:05:00.000Z", 11420),
      buildFile("file-14", "support-navigation.strings", "en", "de", "Processing", 62, "2026-03-16T17:10:00.000Z", 2450),
      buildFile("file-15", "ticket-macros.po", "en", "de", "Queued", 0, "2026-03-16T14:40:00.000Z", 3120)
    ],
    origin: "seed"
  }
];

export function getSeedProjects(): ProjectRecord[] {
  return seedProjects;
}

export function getProjectById(projectId: string, additionalProjects: ProjectRecord[] = []): ProjectRecord | undefined {
  return mergeProjects(seedProjects, additionalProjects).find((project) => project.id === projectId);
}

export function mergeProjects(...projectCollections: ProjectRecord[][]): ProjectRecord[] {
  const merged = new Map<string, ProjectRecord>();

  for (const collection of projectCollections) {
    for (const project of collection) {
      merged.set(project.id, project);
    }
  }

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime()
  );
}

export function createProjectRecord(input: NewProjectInput): ProjectRecord {
  const timestamp = new Date().toISOString();
  const id = slugify(input.name);

  return {
    id,
    name: input.name,
    description: input.description,
    sourceLanguage: input.sourceLanguage,
    targetLanguages: input.targetLanguages,
    status: "Active",
    lastUpdated: timestamp,
    files: [],
    glossaryEnabled: true,
    creditsUsed: 0,
    qualityScore: 0,
    latestExport: undefined,
    recentActivity: [
      {
        id: `${id}-activity-created`,
        title: "Project created",
        detail: "Ready for file uploads and translation setup.",
        timestamp
      }
    ],
    origin: "custom"
  };
}

export function getProjectSummary(project: ProjectRecord): ProjectSummary {
  const totalFiles = project.files.length;
  const completedFiles = project.files.filter((file) => file.status === "Done").length;
  const reviewFiles = project.files.filter((file) => file.status === "Review").length;
  const failedFiles = project.files.filter((file) => file.status === "Error").length;
  const totalWords = project.files.reduce((sum, file) => sum + file.words, 0);
  const overallProgress =
    totalFiles === 0
      ? 0
      : Math.round(project.files.reduce((sum, file) => sum + file.progress, 0) / totalFiles);

  return {
    totalFiles,
    completedFiles,
    reviewFiles,
    failedFiles,
    totalWords,
    overallProgress
  };
}

export function matchesProjectFilter(project: ProjectRecord, filter: ProjectFilter): boolean {
  if (filter === "All") {
    return true;
  }

  if (filter === "Review") {
    return project.status === "In Review";
  }

  if (filter === "Done") {
    return project.status === "Completed";
  }

  return project.status === filter;
}

function buildFile(
  id: string,
  name: string,
  sourceLanguage: string,
  targetLanguage: string,
  status: ProjectFileRecord["status"],
  progress: number,
  lastUpdated: string,
  words: number
): ProjectFileRecord {
  return {
    id,
    name,
    sourceLanguage,
    targetLanguage,
    status,
    progress,
    lastUpdated,
    words
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
