import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { formatCompactNumber, getLanguageLabel } from "@/lib/projects/formatters";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { countMeaningfulTextContent } from "@/lib/translation/word-count";
import { countXliffTranslationWords } from "@/lib/xliff/metrics";
import type {
  FileStatus,
  NewProjectInput,
  ProjectActivityRecord,
  ProjectExportRecord,
  ProjectFileRecord,
  ProjectFileSyncInput,
  ProjectRecord,
  ProjectStatus
} from "@/types/projects";
import type {
  DashboardShellData,
  GlossaryCollectionItem,
  GlossaryMetricItem,
  GlossaryScreenData,
  GlossaryTermItem,
  SettingsGroupData,
  SettingsPreferenceItem,
  SettingsScreenData,
  UsageBreakdownItem,
  UsageMetricItem,
  UsageScreenData,
  UsageSnapshotItem,
  UsageTrendPoint
} from "@/types/workspace";

type WorkspaceRow = {
  id: string;
  slug: string;
  name: string;
  plan_name: string;
  avatar_label: string;
  credits_limit: number | null;
  credits_used: number;
  quality_score_avg: number | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceSettingsRow = {
  workspace_id: string;
  default_source_language: string | null;
  default_target_language: string | null;
  translation_provider: string;
  translation_model: string;
  translation_batch_size: number;
  placeholder_validation_mode: string;
  inline_tag_validation_mode: string;
  block_export_on_validation_failure: boolean;
  email_notifications: boolean;
  review_reminders: boolean;
  auto_export_after_completion: boolean;
  glossary_prompt_injection: boolean;
};

type ProjectRow = {
  id: string;
  workspace_id: string;
  slug: string;
  name: string;
  description: string;
  source_language: string;
  status: "active" | "in_review" | "completed" | "error";
  glossary_enabled: boolean;
  credits_used: number;
  quality_score: number | null;
  origin: "seed" | "custom" | "imported";
  updated_at: string;
};

type ProjectTargetLocaleRow = {
  project_id: string;
  locale_code: string;
  sort_order: number;
};

type ProjectFileRow = {
  id: string;
  project_id: string;
  name: string;
  file_format?: "xliff" | "xlf" | "po" | "strings" | "resx";
  source_language: string;
  target_language: string;
  status: "queued" | "processing" | "review" | "done" | "error";
  progress_percent: number;
  word_count: number;
  source_storage_path?: string | null;
  xliff_version?: string | null;
  error_message?: string | null;
  uploaded_at?: string;
  created_at?: string;
  updated_at: string;
};

type ProjectExportRow = {
  project_id: string;
  label: string;
  format: string;
  exported_at: string;
};

type ProjectActivityRow = {
  id: string;
  project_id: string;
  title: string;
  detail: string;
  occurred_at: string;
};

type WorkspaceMemberRow = {
  role: "owner" | "admin" | "editor" | "reviewer" | "viewer";
  status: "invited" | "active" | "disabled";
};

type BillingCycleRow = {
  id: string;
  period_start: string;
  period_end: string;
  credits_limit: number;
  credits_used: number;
  projected_spend_cents: number;
  status: "active" | "closed" | "projected";
};

type DailyUsageRow = {
  usage_date: string;
  credits_used: number;
  api_requests: number;
  upload_count: number;
  export_count: number;
  review_sessions: number;
  active_projects: number;
};

type UsageBreakdownRow = {
  metric_key: string;
  metric_label: string;
  metric_value: number;
  share_percent: number | null;
  sort_order: number;
};

type ArchivedDailyUsageRow = {
  usage_date: string;
  credits_used: number;
  api_requests: number;
  upload_count: number;
  export_count: number;
  review_sessions: number;
  active_projects: number;
};

type WorkspaceDailyUsageSnapshotRow = ArchivedDailyUsageRow & {
  billing_cycle_id: string | null;
};

type DeletedProjectUsageArchive = {
  dailyRows: ArchivedDailyUsageRow[];
};

type UsageArchiveRollbackSnapshot = {
  previousDailyRows: WorkspaceDailyUsageSnapshotRow[];
  insertedDates: string[];
  workspaceCreditsUsed: number;
  billingCycle: {
    id: string;
    creditsUsed: number;
  } | null;
};

type GlossaryCollectionRow = {
  id: string;
  name: string;
  description: string | null;
};

type GlossaryTermRow = {
  id: string;
  collection_id: string | null;
  source_term: string;
  source_language: string;
  status: "draft" | "review" | "approved" | "archived";
  is_protected: boolean;
};

type GlossaryTranslationRow = {
  term_id: string;
  locale_code: string;
  translated_term: string;
};

type ProjectGlossaryTermRow = {
  project_id: string;
  term_id: string;
};

const DEFAULT_WORKSPACE_NAME = "Workspace";
const DEFAULT_WORKSPACE_SLUG = "workspace";
const DEFAULT_WORKSPACE_PLAN = "Pro";
const DEFAULT_WORKSPACE_AVATAR_LABEL = "W";
const DEFAULT_CREDITS_LIMIT = 100_000;

export async function getDashboardShellData(): Promise<DashboardShellData> {
  noStore();

  const { supabase, workspace } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("projects")
    .select("slug, name")
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load workspace projects: ${error.message}`);
  }

  const projects = (((data as { slug: string; name: string }[] | null) ?? [])).map((project) => ({
    id: project.slug,
    name: project.name
  }));

  return {
    workspaceName: workspace.name,
    workspacePlanName: workspace.plan_name,
    workspaceAvatarLabel: workspace.avatar_label,
    projects
  };
}

export async function getProjectsOverviewRecords(): Promise<ProjectRecord[]> {
  noStore();

  return getProjectRecords();
}

export async function getProjectRecordBySlug(projectSlug: string): Promise<ProjectRecord | null> {
  noStore();

  const projects = await getProjectRecords();

  return projects.find((project) => project.id === projectSlug) ?? null;
}

export async function syncProjectFiles(
  projectSlug: string,
  files: ProjectFileSyncInput[]
): Promise<ProjectFileRecord[]> {
  const { supabase, workspace } = await getWorkspaceContext();
  const project = await getProjectRowBySlug(supabase, workspace.id, projectSlug);

  if (!project) {
    throw new Error("Project not found.");
  }

  if (files.length === 0) {
    return [];
  }

  const now = new Date().toISOString();
  const targetLanguages = Array.from(new Set(files.map((file) => file.targetLanguage)));
  const fileNames = Array.from(new Set(files.map((file) => file.name)));
  const sourcePaths = Array.from(new Set(files.map((file) => buildLocalSourcePath(file.clientId))));

  const { data: existingData, error: existingError } = await supabase
    .from("project_files")
    .select(
      "id, project_id, name, file_format, source_language, target_language, status, progress_percent, word_count, source_storage_path, xliff_version, error_message, updated_at"
    )
    .eq("project_id", project.id)
    .in("target_language", targetLanguages)
    .in("name", fileNames);

  if (existingError) {
    throw new Error(`Failed to load project files: ${existingError.message}`);
  }

  const existingFiles = (existingData as ProjectFileRow[] | null) ?? [];
  const existingBySourceKey = new Map<string, ProjectFileRow>();
  const existingByFallbackKey = new Map<string, ProjectFileRow>();

  for (const file of existingFiles) {
    const sourcePath = file.source_storage_path ?? null;

    if (sourcePath && sourcePaths.includes(sourcePath)) {
      existingBySourceKey.set(getProjectFileSourceKey(file.name, file.target_language, sourcePath), file);
    }

    existingByFallbackKey.set(getProjectFileFallbackKey(file.name, file.target_language), file);
  }

  const inserts: Array<Record<string, unknown>> = [];
  const updates: Array<{ id: string; values: Record<string, unknown> }> = [];

  for (const file of files) {
    const sourceStoragePath = buildLocalSourcePath(file.clientId);
    const existing =
      existingBySourceKey.get(getProjectFileSourceKey(file.name, file.targetLanguage, sourceStoragePath)) ??
      existingByFallbackKey.get(getProjectFileFallbackKey(file.name, file.targetLanguage));

    const values = {
      project_id: project.id,
      name: file.name,
      file_format: getFileFormat(file.name),
      source_language: file.sourceLanguage,
      target_language: file.targetLanguage,
      status: mapFileStatusToDatabase(file.status),
      progress_percent: file.progress,
      word_count: resolveProjectFileWordCount(file),
      source_storage_path: sourceStoragePath,
      xliff_version: file.xliffVersion ?? null,
      error_message: file.errorMessage ?? null,
      updated_at: now
    } satisfies Record<string, unknown>;

    if (existing) {
      updates.push({
        id: existing.id,
        values
      });
    } else {
      inserts.push({
        ...values,
        uploaded_at: now
      });
    }
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from("project_files").insert(inserts);

    if (insertError) {
      throw new Error(`Failed to insert project files: ${insertError.message}`);
    }
  }

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("project_files")
      .update(update.values)
      .eq("id", update.id);

    if (updateError) {
      throw new Error(`Failed to update project file: ${updateError.message}`);
    }
  }

  const { data: refreshedData, error: refreshedError } = await supabase
    .from("project_files")
    .select(
      "id, project_id, name, file_format, source_language, target_language, status, progress_percent, word_count, source_storage_path, xliff_version, error_message, updated_at"
    )
    .eq("project_id", project.id)
    .order("updated_at", { ascending: false });

  if (refreshedError) {
    throw new Error(`Failed to reload project files: ${refreshedError.message}`);
  }

  const refreshedFiles = (refreshedData as ProjectFileRow[] | null) ?? [];
  const projectStatus = deriveProjectStatusFromRows(refreshedFiles);
  const { error: projectUpdateError } = await supabase
    .from("projects")
    .update({
      status: projectStatus,
      updated_at: now
    })
    .eq("id", project.id);

  if (projectUpdateError) {
    throw new Error(`Failed to update project status: ${projectUpdateError.message}`);
  }

  return refreshedFiles.map(mapProjectFileRecord);
}

export async function deleteProject(projectSlug: string): Promise<void> {
  const { supabase, workspace } = await getWorkspaceContext();
  const project = await getProjectRowBySlug(supabase, workspace.id, projectSlug);

  if (!project) {
    throw new Error("Project not found.");
  }

  const { data: filesData, error: filesError } = await supabase
    .from("project_files")
    .select(
      "id, project_id, name, file_format, source_language, target_language, status, progress_percent, word_count, source_storage_path, xliff_version, error_message, uploaded_at, created_at, updated_at"
    )
    .eq("project_id", project.id)
    .order("updated_at", { ascending: false });

  if (filesError) {
    throw new Error(`Failed to load project files for deletion: ${filesError.message}`);
  }

  const projectFiles = (filesData as ProjectFileRow[] | null) ?? [];
  const usageArchive = buildDeletedProjectUsageArchive(project, projectFiles);
  const rollbackSnapshot = await archiveDeletedProjectUsage(supabase, workspace.id, usageArchive, workspace.credits_used ?? 0);

  const { error: deleteError } = await supabase.from("projects").delete().eq("id", project.id);

  if (deleteError) {
    try {
      await rollbackArchivedProjectUsage(supabase, workspace.id, rollbackSnapshot);
    } catch (rollbackError) {
      throw new Error(
        `Failed to delete project: ${deleteError.message}. Rollback failed: ${
          rollbackError instanceof Error ? rollbackError.message : "Unknown rollback error."
        }`
      );
    }

    throw new Error(`Failed to delete project: ${deleteError.message}`);
  }
}

export async function getUsageScreenData(): Promise<UsageScreenData> {
  noStore();

  const { supabase, workspace } = await getWorkspaceContext();
  const now = new Date();

  const [{ data: billingCycleData, error: billingError }, { data: dailyUsageData, error: usageError }, { data: breakdownData, error: breakdownError }, projects] =
    await Promise.all([
      supabase
        .from("workspace_billing_cycles")
        .select("id, period_start, period_end, credits_limit, credits_used, projected_spend_cents, status")
        .eq("workspace_id", workspace.id)
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workspace_daily_usage")
        .select("usage_date, credits_used, api_requests, upload_count, export_count, review_sessions, active_projects")
        .eq("workspace_id", workspace.id)
        .order("usage_date", { ascending: false }),
      supabase
        .from("workspace_usage_breakdown")
        .select("metric_key, metric_label, metric_value, share_percent, sort_order")
        .eq("workspace_id", workspace.id)
        .order("sort_order", { ascending: true }),
      getProjectRecords()
    ]);

  if (billingError) {
    throw new Error(`Failed to load billing cycle data: ${billingError.message}`);
  }

  if (usageError) {
    throw new Error(`Failed to load usage history: ${usageError.message}`);
  }

  if (breakdownError) {
    throw new Error(`Failed to load usage breakdown: ${breakdownError.message}`);
  }

  const billingCycle = billingCycleData as BillingCycleRow | null;
  const usageRows = ((dailyUsageData as DailyUsageRow[] | null) ?? []).slice().reverse();
  const breakdownRows = (breakdownData as UsageBreakdownRow[] | null) ?? [];
  const derivedUsage = deriveUsageFromProjects(projects, now);
  const activeProjects = projects.filter((project) => project.status !== "Completed").length;
  const reviewProjects = projects.filter((project) => project.status === "In Review").length;
  const mergedUsageRows = mergeUsageRows(usageRows, derivedUsage.dailyRows, activeProjects);
  const effectiveUsageRows = normalizeUsageRows(mergedUsageRows, now, activeProjects);

  const creditsLimit = billingCycle?.credits_limit ?? workspace.credits_limit ?? DEFAULT_CREDITS_LIMIT;
  const creditsUsed = Math.max(
    billingCycle?.credits_used ?? 0,
    workspace.credits_used ?? 0,
    derivedUsage.creditsUsed,
    mergedUsageRows.reduce((sum, row) => sum + row.credits_used, 0)
  );
  const cycleConsumedPercent = creditsLimit > 0 ? Math.round((creditsUsed / creditsLimit) * 100) : 0;
  const totalApiRequests = Math.max(
    derivedUsage.totalApiRequests,
    mergedUsageRows.reduce((sum, row) => sum + row.api_requests, 0)
  );
  const totalUploads = Math.max(
    derivedUsage.totalUploads,
    mergedUsageRows.reduce((sum, row) => sum + row.upload_count, 0)
  );
  const totalExports = Math.max(
    derivedUsage.totalExports,
    mergedUsageRows.reduce((sum, row) => sum + row.export_count, 0)
  );
  const totalReviews = Math.max(
    derivedUsage.totalReviews,
    mergedUsageRows.reduce((sum, row) => sum + row.review_sessions, 0)
  );
  const today = formatDateKey(now);
  const todayRow = effectiveUsageRows.find((row) => row.usage_date === today);
  const yesterdayRow = effectiveUsageRows.find((row) => row.usage_date !== today) ?? null;
  const trend = effectiveUsageRows.length > 0 ? effectiveUsageRows.map(mapUsageTrendPoint) : buildEmptyUsageTrend(now);
  const breakdown = breakdownRows.length > 0 ? mapUsageBreakdownRows(breakdownRows) : buildFallbackUsageBreakdown(totalUploads, totalExports, totalReviews, creditsUsed);
  const projectedSpend = billingCycle ? billingCycle.projected_spend_cents : 0;
  const updatedLabel = derivedUsage.lastUpdatedAt
    ? `Updated ${formatTimeLabel(derivedUsage.lastUpdatedAt)}`
    : effectiveUsageRows.length > 0
      ? `Updated ${formatTimeLabel(new Date(`${effectiveUsageRows.at(-1)?.usage_date}T18:00:00.000Z`))}`
      : `Updated ${formatTimeLabel(now)}`;
  const planValue = `${formatCompactNumber(creditsUsed)} / ${formatCompactNumber(creditsLimit)} credits`;
  const planMeta = `${formatCompactNumber(Math.max(creditsLimit - creditsUsed, 0))} credits remaining before ${formatLongDate(
    billingCycle?.period_end ? new Date(`${billingCycle.period_end}T00:00:00.000Z`) : endOfCurrentMonth(now)
  )}.`;

  const metrics: UsageMetricItem[] = [
    {
      value: `${cycleConsumedPercent}%`,
      label: "Cycle consumed",
      meta: `${Math.max(100 - cycleConsumedPercent, 0)}% remaining in current cycle`,
      tone: "positive"
    },
    {
      value: formatCompactNumber(creditsUsed),
      label: "Credits used",
      meta: billingCycle ? "Current billing cycle" : "Derived from workspace totals"
    },
    {
      value: new Intl.NumberFormat("en").format(totalApiRequests),
      label: "API requests",
      meta: `${new Intl.NumberFormat("en").format(totalUploads)} upload sessions`
    },
    {
      value: formatCurrency(projectedSpend / 100),
      label: "Projected spend",
      meta: "Based on current run-rate"
    }
  ];

  const snapshots: UsageSnapshotItem[] = [
    {
      label: "Credits used today",
      value: new Intl.NumberFormat("en").format(todayRow?.credits_used ?? 0),
      detail: `Across ${new Intl.NumberFormat("en").format(todayRow?.upload_count ?? 0)} uploads`
    },
    {
      label: "API requests",
      value: new Intl.NumberFormat("en").format(totalApiRequests),
      detail: yesterdayRow
        ? `${formatDelta(totalApiRequests - yesterdayRow.api_requests)} vs. previous recorded day`
        : "No previous usage day available"
    },
    {
      label: "Active projects",
      value: String(activeProjects),
      detail: `${reviewProjects} in review`
    },
    {
      label: "Current cycle",
      value: `${formatShortDate(
        billingCycle?.period_start ? new Date(`${billingCycle.period_start}T00:00:00.000Z`) : startOfCurrentMonth(now)
      )} - ${formatShortDate(
        billingCycle?.period_end ? new Date(`${billingCycle.period_end}T00:00:00.000Z`) : endOfCurrentMonth(now)
      )}`,
      detail: `${cycleConsumedPercent}% consumed`
    }
  ];

  return {
    metrics,
    trend,
    snapshots,
    breakdown,
    updatedLabel,
    planValue,
    planMeta,
    planPercent: cycleConsumedPercent
  };
}

export async function getGlossaryScreenData(): Promise<GlossaryScreenData> {
  noStore();

  const { supabase, workspace } = await getWorkspaceContext();

  const [{ data: collectionsData, error: collectionsError }, { data: termsData, error: termsError }] = await Promise.all([
    supabase
      .from("glossary_collections")
      .select("id, name, description")
      .eq("workspace_id", workspace.id)
      .order("name", { ascending: true }),
    supabase
      .from("glossary_terms")
      .select("id, collection_id, source_term, source_language, status, is_protected")
      .eq("workspace_id", workspace.id)
      .order("updated_at", { ascending: false })
      .limit(24)
  ]);

  if (collectionsError) {
    throw new Error(`Failed to load glossary collections: ${collectionsError.message}`);
  }

  if (termsError) {
    throw new Error(`Failed to load glossary terms: ${termsError.message}`);
  }

  const collectionRows = (collectionsData as GlossaryCollectionRow[] | null) ?? [];
  const termRows = (termsData as GlossaryTermRow[] | null) ?? [];
  const termIds = termRows.map((term) => term.id);

  const [{ data: translationsData, error: translationsError }, { data: projectTermLinksData, error: projectTermLinksError }] =
    termIds.length > 0
      ? await Promise.all([
          supabase
            .from("glossary_term_translations")
            .select("term_id, locale_code, translated_term")
            .in("term_id", termIds),
          supabase
            .from("project_glossary_terms")
            .select("project_id, term_id")
            .in("term_id", termIds)
        ])
      : [
          { data: [], error: null },
          { data: [], error: null }
        ];

  if (translationsError) {
    throw new Error(`Failed to load glossary term translations: ${translationsError.message}`);
  }

  if (projectTermLinksError) {
    throw new Error(`Failed to load glossary project links: ${projectTermLinksError.message}`);
  }

  const projectIds = Array.from(
    new Set(((projectTermLinksData as ProjectGlossaryTermRow[] | null) ?? []).map((item) => item.project_id))
  );
  const { data: projectsData, error: projectsError } =
    projectIds.length > 0
      ? await supabase.from("projects").select("id, name").in("id", projectIds)
      : { data: [], error: null };

  if (projectsError) {
    throw new Error(`Failed to load glossary project names: ${projectsError.message}`);
  }

  const translationsByTermId = groupBy(
    (translationsData as GlossaryTranslationRow[] | null) ?? [],
    (translation) => translation.term_id
  );
  const projectNamesById = new Map<string, string>(
    (((projectsData as { id: string; name: string }[] | null) ?? [])).map((project) => [project.id, project.name])
  );
  const projectNameByTermId = new Map<string, string>();

  for (const link of (projectTermLinksData as ProjectGlossaryTermRow[] | null) ?? []) {
    if (!projectNameByTermId.has(link.term_id)) {
      projectNameByTermId.set(link.term_id, projectNamesById.get(link.project_id) ?? "Shared");
    }
  }

  const distinctLocales = new Set(
    ((translationsData as GlossaryTranslationRow[] | null) ?? []).map((translation) =>
      translation.locale_code.toUpperCase()
    )
  );
  const metrics: GlossaryMetricItem[] = [
    {
      label: "Total terms",
      value: String(termRows.length),
      meta: "Across all synced collections"
    },
    {
      label: "Protected phrases",
      value: String(termRows.filter((term) => term.is_protected).length),
      meta: "Never translate"
    },
    {
      label: "Locales covered",
      value: String(distinctLocales.size),
      meta: distinctLocales.size > 0 ? formatLocaleSummary(Array.from(distinctLocales)) : "No locale translations yet"
    },
    {
      label: "Pending reviews",
      value: String(termRows.filter((term) => term.status === "review").length),
      meta: "Needs approval"
    }
  ];

  const terms: GlossaryTermItem[] = termRows.map((term) => {
    const translations = (translationsByTermId.get(term.id) ?? [])
      .slice()
      .sort((left, right) => left.locale_code.localeCompare(right.locale_code))
      .map((translation) => `${translation.locale_code.toUpperCase()} ${translation.translated_term}`)
      .join(" · ");

    return {
      source: term.source_term,
      translations: translations || "No translations yet",
      status: mapGlossaryStatus(term.status),
      project: projectNameByTermId.get(term.id) ?? "Shared"
    };
  });

  const termCountByCollectionId = new Map<string, number>();
  for (const term of termRows) {
    if (term.collection_id) {
      termCountByCollectionId.set(term.collection_id, (termCountByCollectionId.get(term.collection_id) ?? 0) + 1);
    }
  }

  const collections: GlossaryCollectionItem[] = collectionRows.map((collection) => ({
    name: collection.name,
    count: `${termCountByCollectionId.get(collection.id) ?? 0} terms`,
    detail: collection.description ?? "No collection description yet."
  }));

  return {
    metrics,
    terms,
    collections
  };
}

export async function getSettingsScreenData(): Promise<SettingsScreenData> {
  noStore();

  const { supabase, workspace, settings } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, status")
    .eq("workspace_id", workspace.id);

  if (error) {
    throw new Error(`Failed to load workspace members: ${error.message}`);
  }

  const members = (data as WorkspaceMemberRow[] | null) ?? [];
  const activeMembers = members.filter((member) => member.status === "active");
  const editorCount = activeMembers.filter((member) =>
    member.role === "owner" || member.role === "admin" || member.role === "editor"
  ).length;
  const reviewerCount = activeMembers.filter((member) => member.role === "reviewer").length;

  const groups: SettingsGroupData[] = [
    {
      title: "Translation defaults",
      items: [
        {
          label: "Default source locale",
          value: settings.default_source_language ? getLanguageLabel(settings.default_source_language) : "Auto-detect"
        },
        {
          label: "Default target locale",
          value: settings.default_target_language ? getLanguageLabel(settings.default_target_language) : "Not set"
        },
        {
          label: "Model profile",
          value: `${settings.translation_provider} / ${settings.translation_model}`
        },
        {
          label: "Batch size",
          value: `${settings.translation_batch_size} strings`
        }
      ]
    },
    {
      title: "Validation",
      items: [
        {
          label: "Placeholder mismatch check",
          value: capitalize(settings.placeholder_validation_mode)
        },
        {
          label: "Inline tag parity",
          value: capitalize(settings.inline_tag_validation_mode)
        },
        {
          label: "Malformed XML fallback",
          value: settings.block_export_on_validation_failure ? "Block export" : "Allow export"
        }
      ]
    }
  ];

  const preferences: SettingsPreferenceItem[] = [
    { label: "Email notifications", enabled: settings.email_notifications },
    { label: "Review reminders", enabled: settings.review_reminders },
    { label: "Auto-export after completion", enabled: settings.auto_export_after_completion },
    { label: "Glossary prompt injection", enabled: settings.glossary_prompt_injection }
  ];

  const apiSettings = [
    {
      label: "Supabase project",
      value: getProjectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    },
    {
      label: "Translation provider",
      value: capitalize(settings.translation_provider)
    },
    {
      label: "API key status",
      value: process.env.OPENAI_API_KEY ? "Configured on server" : "Missing on server"
    }
  ];

  return {
    groups,
    preferences,
    apiSettings,
    securityNotes: [
      "API credentials stay server-side and are never exposed to the browser.",
      "Exports can be blocked automatically when placeholder or inline-tag validation fails.",
      "Uploaded files remain in-memory in the current MVP unless you add storage persistence."
    ],
    workspacePlan: `${workspace.plan_name} plan`,
    workspacePlanMeta: activeMembers.length > 0 ? `${activeMembers.length} active seats` : "No members configured yet",
    teamSummary: `${editorCount} editors · ${reviewerCount} reviewers`
  };
}

export async function createProject(input: NewProjectInput): Promise<{ slug: string }> {
  const { supabase, workspace } = await getWorkspaceContext();
  const slug = await buildUniqueProjectSlug(supabase, workspace.id, input.name);
  const now = new Date().toISOString();
  const targetLanguages = Array.from(new Set(input.targetLanguages.filter(Boolean)));

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspace.id,
      slug,
      name: input.name.trim(),
      description: input.description.trim(),
      source_language: input.sourceLanguage,
      status: "active",
      glossary_enabled: true,
      credits_used: 0,
      quality_score: null,
      origin: "custom",
      updated_at: now
    })
    .select("id")
    .single();

  if (projectError) {
    throw new Error(`Failed to create project: ${projectError.message}`);
  }

  const projectId = (projectData as { id: string }).id;

  if (targetLanguages.length > 0) {
    const { error: localeError } = await supabase.from("project_target_locales").insert(
      targetLanguages.map((locale, index) => ({
        project_id: projectId,
        locale_code: locale,
        sort_order: index
      }))
    );

    if (localeError) {
      await supabase.from("projects").delete().eq("id", projectId);
      throw new Error(`Failed to save target languages: ${localeError.message}`);
    }
  }

  const { error: activityError } = await supabase.from("project_activities").insert({
    project_id: projectId,
    kind: "project_created",
    title: "Project created",
    detail: "Ready for file uploads and translation setup.",
    occurred_at: now
  });

  if (activityError) {
    throw new Error(`Project created, but activity creation failed: ${activityError.message}`);
  }

  return { slug };
}

async function getProjectRecords(): Promise<ProjectRecord[]> {
  const { supabase, workspace } = await getWorkspaceContext();
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select("id, workspace_id, slug, name, description, source_language, status, glossary_enabled, credits_used, quality_score, origin, updated_at")
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false });

  if (projectsError) {
    throw new Error(`Failed to load projects: ${projectsError.message}`);
  }

  const projects = (projectsData as ProjectRow[] | null) ?? [];

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);
  const [
    { data: localesData, error: localesError },
    { data: filesData, error: filesError },
    { data: exportsData, error: exportsError },
    { data: activitiesData, error: activitiesError }
  ] = await Promise.all([
    supabase
      .from("project_target_locales")
      .select("project_id, locale_code, sort_order")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_files")
      .select("id, project_id, name, file_format, source_language, target_language, status, progress_percent, word_count, source_storage_path, xliff_version, error_message, updated_at")
      .in("project_id", projectIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("project_exports")
      .select("project_id, label, format, exported_at")
      .in("project_id", projectIds)
      .order("exported_at", { ascending: false }),
    supabase
      .from("project_activities")
      .select("id, project_id, title, detail, occurred_at")
      .in("project_id", projectIds)
      .order("occurred_at", { ascending: false })
  ]);

  if (localesError) {
    throw new Error(`Failed to load project locales: ${localesError.message}`);
  }

  if (filesError) {
    throw new Error(`Failed to load project files: ${filesError.message}`);
  }

  if (exportsError) {
    throw new Error(`Failed to load project exports: ${exportsError.message}`);
  }

  if (activitiesError) {
    throw new Error(`Failed to load project activities: ${activitiesError.message}`);
  }

  const localesByProjectId = groupBy(
    (localesData as ProjectTargetLocaleRow[] | null) ?? [],
    (locale) => locale.project_id
  );
  const filesByProjectId = groupBy(
    (filesData as ProjectFileRow[] | null) ?? [],
    (file) => file.project_id
  );
  const exportsByProjectId = groupBy(
    (exportsData as ProjectExportRow[] | null) ?? [],
    (projectExport) => projectExport.project_id
  );
  const activitiesByProjectId = groupBy(
    (activitiesData as ProjectActivityRow[] | null) ?? [],
    (activity) => activity.project_id
  );

  return projects.map((project) =>
    mapProjectRecord(
      project,
      localesByProjectId.get(project.id) ?? [],
      filesByProjectId.get(project.id) ?? [],
      exportsByProjectId.get(project.id) ?? [],
      activitiesByProjectId.get(project.id) ?? []
    )
  );
}

async function getWorkspaceContext() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await selectWorkspace(supabase);

  if (error) {
    throw new Error(`Failed to load workspace: ${error.message}`);
  }

  let workspace = data as WorkspaceRow | null;

  if (!workspace) {
    const { data: insertedWorkspace, error: insertError } = await supabase
      .from("workspaces")
      .insert({
        slug: DEFAULT_WORKSPACE_SLUG,
        name: DEFAULT_WORKSPACE_NAME,
        plan_name: DEFAULT_WORKSPACE_PLAN,
        avatar_label: DEFAULT_WORKSPACE_AVATAR_LABEL,
        credits_limit: DEFAULT_CREDITS_LIMIT,
        credits_used: 0
      })
      .select("id, slug, name, plan_name, avatar_label, credits_limit, credits_used, quality_score_avg, created_at, updated_at")
      .single();

    if (insertError) {
      if (isUniqueViolation(insertError)) {
        const { data: existingWorkspace, error: reloadError } = await supabase
          .from("workspaces")
          .select("id, slug, name, plan_name, avatar_label, credits_limit, credits_used, quality_score_avg, created_at, updated_at")
          .eq("slug", DEFAULT_WORKSPACE_SLUG)
          .maybeSingle();

        if (reloadError) {
          throw new Error(`Failed to reload bootstrapped workspace: ${reloadError.message}`);
        }

        if (!existingWorkspace) {
          throw new Error("Workspace bootstrap raced successfully, but the workspace could not be reloaded.");
        }

        workspace = existingWorkspace as WorkspaceRow;
      } else {
        throw new Error(`Failed to bootstrap workspace: ${insertError.message}`);
      }
    }

    if (!workspace) {
      workspace = insertedWorkspace as WorkspaceRow;
    }
  }

  const settings = await ensureWorkspaceSettings(supabase, workspace.id);

  return {
    supabase,
    workspace,
    settings
  };
}

async function ensureWorkspaceSettings(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string
) {
  const { data, error } = await selectWorkspaceSettings(supabase, workspaceId);

  if (error) {
    throw new Error(`Failed to load workspace settings: ${error.message}`);
  }

  if (data) {
    return data as WorkspaceSettingsRow;
  }

  const { data: insertedSettings, error: insertError } = await supabase
    .from("workspace_settings")
    .insert({
      workspace_id: workspaceId
    })
    .select("workspace_id, default_source_language, default_target_language, translation_provider, translation_model, translation_batch_size, placeholder_validation_mode, inline_tag_validation_mode, block_export_on_validation_failure, email_notifications, review_reminders, auto_export_after_completion, glossary_prompt_injection")
    .single();

  if (insertError) {
    if (isUniqueViolation(insertError)) {
      const { data: existingSettings, error: reloadError } = await selectWorkspaceSettings(
        supabase,
        workspaceId
      );

      if (reloadError) {
        throw new Error(`Failed to reload workspace settings: ${reloadError.message}`);
      }

      if (!existingSettings) {
        throw new Error("Workspace settings bootstrap raced successfully, but the row could not be reloaded.");
      }

      return existingSettings as WorkspaceSettingsRow;
    }

    throw new Error(`Failed to bootstrap workspace settings: ${insertError.message}`);
  }

  return insertedSettings as WorkspaceSettingsRow;
}

function selectWorkspace(supabase: ReturnType<typeof createServerSupabaseClient>) {
  return supabase
    .from("workspaces")
    .select("id, slug, name, plan_name, avatar_label, credits_limit, credits_used, quality_score_avg, created_at, updated_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
}

function selectWorkspaceSettings(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string
) {
  return supabase
    .from("workspace_settings")
    .select("workspace_id, default_source_language, default_target_language, translation_provider, translation_model, translation_batch_size, placeholder_validation_mode, inline_tag_validation_mode, block_export_on_validation_failure, email_notifications, review_reminders, auto_export_after_completion, glossary_prompt_injection")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
}

async function getProjectRowBySlug(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string,
  projectSlug: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, workspace_id, slug, name, description, source_language, status, glossary_enabled, credits_used, quality_score, origin, updated_at")
    .eq("workspace_id", workspaceId)
    .eq("slug", projectSlug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load project: ${error.message}`);
  }

  return data as ProjectRow | null;
}

function isUniqueViolation(error: { code?: string | null }) {
  return error.code === "23505";
}

async function buildUniqueProjectSlug(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string,
  name: string
) {
  const baseSlug = slugify(name);
  const { data, error } = await supabase
    .from("projects")
    .select("slug")
    .eq("workspace_id", workspaceId)
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(`Failed to validate project slug: ${error.message}`);
  }

  const existingSlugs = new Set(
    (((data as { slug: string }[] | null) ?? [])).map((row) => row.slug)
  );

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function mapProjectRecord(
  project: ProjectRow,
  localeRows: ProjectTargetLocaleRow[],
  fileRows: ProjectFileRow[],
  exportRows: ProjectExportRow[],
  activityRows: ProjectActivityRow[]
): ProjectRecord {
  const targetLanguages = localeRows.length > 0
    ? localeRows.map((locale) => locale.locale_code)
    : Array.from(new Set(fileRows.map((file) => file.target_language)));

  const files = fileRows.map(mapProjectFileRecord);
  const latestExport = exportRows.length > 0 ? mapProjectExportRecord(exportRows[0]) : undefined;
  const recentActivity = activityRows.slice(0, 6).map(mapProjectActivityRecord);

  return {
    id: project.slug,
    name: project.name,
    description: project.description,
    sourceLanguage: project.source_language,
    targetLanguages,
    status: mapProjectStatus(project.status),
    lastUpdated: project.updated_at,
    files,
    glossaryEnabled: project.glossary_enabled,
    creditsUsed: project.credits_used,
    qualityScore: project.quality_score ? Math.round(Number(project.quality_score)) : 0,
    latestExport,
    recentActivity,
    origin: project.origin
  };
}

function mapProjectFileRecord(file: ProjectFileRow): ProjectFileRecord {
  return {
    id: file.id,
    name: file.name,
    sourceLanguage: file.source_language,
    targetLanguage: file.target_language,
    status: mapFileStatus(file.status),
    progress: Math.round(Number(file.progress_percent)),
    lastUpdated: file.updated_at,
    words: file.word_count
  };
}

function getFileFormat(fileName: string): NonNullable<ProjectFileRow["file_format"]> {
  if (/\.xlf$/i.test(fileName)) {
    return "xlf";
  }

  if (/\.po$/i.test(fileName)) {
    return "po";
  }

  if (/\.strings$/i.test(fileName)) {
    return "strings";
  }

  if (/\.resx$/i.test(fileName)) {
    return "resx";
  }

  return "xliff";
}

function buildLocalSourcePath(clientId: string) {
  return `local:${clientId}`;
}

function getProjectFileSourceKey(name: string, targetLanguage: string, sourceStoragePath: string) {
  return `${name.toLowerCase()}::${targetLanguage.toLowerCase()}::${sourceStoragePath}`;
}

function getProjectFileFallbackKey(name: string, targetLanguage: string) {
  return `${name.toLowerCase()}::${targetLanguage.toLowerCase()}`;
}

function mapFileStatusToDatabase(status: FileStatus): ProjectFileRow["status"] {
  switch (status) {
    case "Processing":
      return "processing";
    case "Review":
      return "review";
    case "Done":
      return "done";
    case "Error":
      return "error";
    case "Queued":
    default:
      return "queued";
  }
}

function deriveProjectStatusFromRows(files: ProjectFileRow[]): ProjectRow["status"] {
  if (files.some((file) => file.status === "error")) {
    return "error";
  }

  if (files.length > 0 && files.every((file) => file.status === "done")) {
    return "completed";
  }

  if (files.some((file) => file.status === "review")) {
    return "in_review";
  }

  return "active";
}

function resolveProjectFileWordCount(file: ProjectFileSyncInput) {
  if (!file.content) {
    return file.words;
  }

  if (/\.(xliff|xlf)$/i.test(file.name)) {
    try {
      return countXliffTranslationWords(file.content);
    } catch {
      return countMeaningfulTextContent(file.content);
    }
  }

  return countMeaningfulTextContent(file.content);
}

function mapProjectExportRecord(projectExport: ProjectExportRow): ProjectExportRecord {
  return {
    label: projectExport.label,
    timestamp: projectExport.exported_at,
    format: projectExport.format.toUpperCase()
  };
}

function mapProjectActivityRecord(activity: ProjectActivityRow): ProjectActivityRecord {
  return {
    id: activity.id,
    title: activity.title,
    detail: activity.detail,
    timestamp: activity.occurred_at
  };
}

function mapProjectStatus(status: ProjectRow["status"]): ProjectStatus {
  switch (status) {
    case "in_review":
      return "In Review";
    case "completed":
      return "Completed";
    case "error":
      return "Error";
    case "active":
    default:
      return "Active";
  }
}

function mapFileStatus(status: ProjectFileRow["status"]): ProjectFileRecord["status"] {
  switch (status) {
    case "processing":
      return "Processing";
    case "review":
      return "Review";
    case "done":
      return "Done";
    case "error":
      return "Error";
    case "queued":
    default:
      return "Queued";
  }
}

function mapGlossaryStatus(status: GlossaryTermRow["status"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "review":
      return "Review";
    case "archived":
      return "Archived";
    case "draft":
    default:
      return "Draft";
  }
}

function mapUsageTrendPoint(row: DailyUsageRow): UsageTrendPoint {
  return {
    label: formatShortDate(new Date(`${row.usage_date}T00:00:00.000Z`)),
    value: row.credits_used
  };
}

function buildDeletedProjectUsageArchive(
  project: ProjectRow,
  projectFiles: ProjectFileRow[]
): DeletedProjectUsageArchive {
  const dailyRows = new Map<string, ArchivedDailyUsageRow>();
  const uploadKeys = new Set<string>();
  const activeProjects = project.status === "completed" ? 0 : 1;

  for (const file of projectFiles) {
    const fileDate = getProjectFileUsageDate(file);

    if (!fileDate) {
      continue;
    }

    const usageDate = formatDateKey(fileDate);
    const row = getOrCreateArchivedDailyUsageRow(dailyRows, usageDate, activeProjects);
    const uploadKey = `${project.id}::${file.name.toLowerCase()}::${file.source_language.toLowerCase()}`;
    const countsAsTranslation = file.status !== "queued";

    if (!uploadKeys.has(uploadKey)) {
      uploadKeys.add(uploadKey);
      row.upload_count += 1;
    }

    if (countsAsTranslation) {
      row.credits_used += file.word_count;
      row.api_requests += 1;
    }

    if (file.status === "done") {
      row.export_count += 1;
    }

    if (file.status === "review") {
      row.review_sessions += 1;
    }
  }

  return {
    dailyRows: Array.from(dailyRows.values()).sort((left, right) => left.usage_date.localeCompare(right.usage_date))
  };
}

async function archiveDeletedProjectUsage(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string,
  usageArchive: DeletedProjectUsageArchive,
  workspaceCreditsUsed: number
): Promise<UsageArchiveRollbackSnapshot> {
  const impactedDates = usageArchive.dailyRows.map((row) => row.usage_date);
  const [{ data: activeCycleData, error: activeCycleError }, { data: existingUsageData, error: existingUsageError }] =
    await Promise.all([
      supabase
        .from("workspace_billing_cycles")
        .select("id, period_start, period_end, credits_used")
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle(),
      impactedDates.length > 0
        ? supabase
            .from("workspace_daily_usage")
            .select(
              "usage_date, billing_cycle_id, credits_used, api_requests, upload_count, export_count, review_sessions, active_projects"
            )
            .eq("workspace_id", workspaceId)
            .in("usage_date", impactedDates)
        : Promise.resolve({ data: [], error: null })
    ]);

  if (activeCycleError) {
    throw new Error(`Failed to load active billing cycle: ${activeCycleError.message}`);
  }

  if (existingUsageError) {
    throw new Error(`Failed to load existing usage rows: ${existingUsageError.message}`);
  }

  const activeCycle = activeCycleData as Pick<BillingCycleRow, "id" | "period_start" | "period_end" | "credits_used"> | null;
  const existingRows = (existingUsageData as WorkspaceDailyUsageSnapshotRow[] | null) ?? [];
  const existingByDate = new Map(existingRows.map((row) => [row.usage_date, row]));

  if (usageArchive.dailyRows.length > 0) {
    const upsertRows = usageArchive.dailyRows.map((row) => {
      const existing = existingByDate.get(row.usage_date);

      return {
        workspace_id: workspaceId,
        billing_cycle_id: existing?.billing_cycle_id ?? activeCycle?.id ?? null,
        usage_date: row.usage_date,
        credits_used: (existing?.credits_used ?? 0) + row.credits_used,
        api_requests: (existing?.api_requests ?? 0) + row.api_requests,
        upload_count: (existing?.upload_count ?? 0) + row.upload_count,
        export_count: (existing?.export_count ?? 0) + row.export_count,
        review_sessions: (existing?.review_sessions ?? 0) + row.review_sessions,
        active_projects: Math.max(existing?.active_projects ?? 0, row.active_projects)
      };
    });

    const { error: upsertError } = await supabase
      .from("workspace_daily_usage")
      .upsert(upsertRows, { onConflict: "workspace_id,usage_date" });

    if (upsertError) {
      throw new Error(`Failed to archive project usage: ${upsertError.message}`);
    }
  }

  const nextWorkspaceCreditsUsed = Math.max(
    workspaceCreditsUsed,
    await getWorkspaceCurrentCreditsUsed(supabase, workspaceId)
  );

  if (nextWorkspaceCreditsUsed > workspaceCreditsUsed) {
    const { error: workspaceUpdateError } = await supabase
      .from("workspaces")
      .update({ credits_used: nextWorkspaceCreditsUsed })
      .eq("id", workspaceId);

    if (workspaceUpdateError) {
      throw new Error(`Failed to update workspace credits after archiving usage: ${workspaceUpdateError.message}`);
    }
  }

  if (activeCycle) {
    const cycleCreditsUsed = Math.max(activeCycle.credits_used, nextWorkspaceCreditsUsed);

    if (cycleCreditsUsed > activeCycle.credits_used) {
      const { error: billingUpdateError } = await supabase
        .from("workspace_billing_cycles")
        .update({ credits_used: cycleCreditsUsed })
        .eq("id", activeCycle.id);

      if (billingUpdateError) {
        throw new Error(`Failed to update billing cycle usage: ${billingUpdateError.message}`);
      }
    }
  }

  return {
    previousDailyRows: existingRows,
    insertedDates: impactedDates.filter((usageDate) => !existingByDate.has(usageDate)),
    workspaceCreditsUsed,
    billingCycle: activeCycle
      ? {
          id: activeCycle.id,
          creditsUsed: activeCycle.credits_used
        }
      : null
  };
}

async function rollbackArchivedProjectUsage(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string,
  rollbackSnapshot: UsageArchiveRollbackSnapshot
) {
  if (rollbackSnapshot.insertedDates.length > 0) {
    const { error: deleteError } = await supabase
      .from("workspace_daily_usage")
      .delete()
      .eq("workspace_id", workspaceId)
      .in("usage_date", rollbackSnapshot.insertedDates);

    if (deleteError) {
      throw new Error(`Failed to remove archived usage rows during rollback: ${deleteError.message}`);
    }
  }

  if (rollbackSnapshot.previousDailyRows.length > 0) {
    const restoreRows = rollbackSnapshot.previousDailyRows.map((row) => ({
      workspace_id: workspaceId,
      billing_cycle_id: row.billing_cycle_id,
      usage_date: row.usage_date,
      credits_used: row.credits_used,
      api_requests: row.api_requests,
      upload_count: row.upload_count,
      export_count: row.export_count,
      review_sessions: row.review_sessions,
      active_projects: row.active_projects
    }));

    const { error: restoreError } = await supabase
      .from("workspace_daily_usage")
      .upsert(restoreRows, { onConflict: "workspace_id,usage_date" });

    if (restoreError) {
      throw new Error(`Failed to restore usage rows during rollback: ${restoreError.message}`);
    }
  }

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({ credits_used: rollbackSnapshot.workspaceCreditsUsed })
    .eq("id", workspaceId);

  if (workspaceError) {
    throw new Error(`Failed to restore workspace credits during rollback: ${workspaceError.message}`);
  }

  if (rollbackSnapshot.billingCycle) {
    const { error: billingError } = await supabase
      .from("workspace_billing_cycles")
      .update({ credits_used: rollbackSnapshot.billingCycle.creditsUsed })
      .eq("id", rollbackSnapshot.billingCycle.id);

    if (billingError) {
      throw new Error(`Failed to restore billing cycle credits during rollback: ${billingError.message}`);
    }
  }
}

async function getWorkspaceCurrentCreditsUsed(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string,
): Promise<number> {
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspaceId);

  if (projectsError) {
    throw new Error(`Failed to load workspace projects while summarizing credits: ${projectsError.message}`);
  }

  const projectIds = (((projectsData as { id: string }[] | null) ?? [])).map((project) => project.id);

  if (projectIds.length === 0) {
    return 0;
  }

  const { data: filesData, error: filesError } = await supabase
    .from("project_files")
    .select("word_count, status")
    .in("project_id", projectIds);

  if (filesError) {
    throw new Error(`Failed to load project files while summarizing credits: ${filesError.message}`);
  }

  return (((filesData as Pick<ProjectFileRow, "word_count" | "status">[] | null) ?? [])).reduce((sum, file) => {
    if (file.status === "queued") {
      return sum;
    }

    return sum + file.word_count;
  }, 0);
}

function getProjectFileUsageDate(file: ProjectFileRow) {
  const candidates = [file.updated_at, file.uploaded_at, file.created_at];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const nextDate = new Date(candidate);

    if (!Number.isNaN(nextDate.getTime())) {
      return nextDate;
    }
  }

  return null;
}

function deriveUsageFromProjects(projects: ProjectRecord[], now: Date) {
  const dailyRows = new Map<string, DailyUsageRow>();
  const uploadKeys = new Set<string>();
  let creditsUsed = 0;
  let totalApiRequests = 0;
  let totalUploads = 0;
  let totalExports = 0;
  let totalReviews = 0;
  let lastUpdatedAt: Date | null = null;
  const activeProjects = projects.filter((project) => project.status !== "Completed").length;

  for (const project of projects) {
    for (const file of project.files) {
      const fileDate = new Date(file.lastUpdated);

      if (Number.isNaN(fileDate.getTime())) {
        continue;
      }

      const usageDate = formatDateKey(fileDate);
      const row = getOrCreateDailyUsageRow(dailyRows, usageDate, activeProjects);
      const uploadKey = `${project.id}::${file.name.toLowerCase()}::${file.sourceLanguage.toLowerCase()}`;
      const countsAsTranslation = file.status !== "Queued";
      const countsAsExport = file.status === "Done";
      const countsAsReview = file.status === "Review";

      if (!uploadKeys.has(uploadKey)) {
        uploadKeys.add(uploadKey);
        row.upload_count += 1;
        totalUploads += 1;
      }

      if (countsAsTranslation) {
        row.credits_used += file.words;
        row.api_requests += 1;
        creditsUsed += file.words;
        totalApiRequests += 1;
      }

      if (countsAsExport) {
        row.export_count += 1;
        totalExports += 1;
      }

      if (countsAsReview) {
        row.review_sessions += 1;
        totalReviews += 1;
      }

      row.active_projects = activeProjects;

      if (!lastUpdatedAt || fileDate > lastUpdatedAt) {
        lastUpdatedAt = fileDate;
      }
    }
  }

  return {
    dailyRows: Array.from(dailyRows.values()).sort((left, right) => left.usage_date.localeCompare(right.usage_date)),
    creditsUsed,
    totalApiRequests,
    totalUploads,
    totalExports,
    totalReviews,
    lastUpdatedAt: lastUpdatedAt ?? now
  };
}

function mergeUsageRows(
  recordedRows: DailyUsageRow[],
  derivedRows: DailyUsageRow[],
  activeProjects: number
) {
  const merged = new Map<string, DailyUsageRow>();

  for (const row of [...recordedRows, ...derivedRows]) {
    const existing = merged.get(row.usage_date);

    if (!existing) {
      merged.set(row.usage_date, {
        ...row,
        active_projects: Math.max(row.active_projects, activeProjects)
      });
      continue;
    }

    merged.set(row.usage_date, {
      usage_date: row.usage_date,
      credits_used: existing.credits_used + row.credits_used,
      api_requests: existing.api_requests + row.api_requests,
      upload_count: existing.upload_count + row.upload_count,
      export_count: existing.export_count + row.export_count,
      review_sessions: existing.review_sessions + row.review_sessions,
      active_projects: Math.max(existing.active_projects, row.active_projects, activeProjects)
    });
  }

  return Array.from(merged.values()).sort((left, right) => left.usage_date.localeCompare(right.usage_date));
}

function normalizeUsageRows(rows: DailyUsageRow[], now: Date, activeProjects: number) {
  const byDate = new Map(rows.map((row) => [row.usage_date, row]));

  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - (9 - index));
    const usageDate = formatDateKey(date);
    const row = byDate.get(usageDate);

    return (
      row ?? {
        usage_date: usageDate,
        credits_used: 0,
        api_requests: 0,
        upload_count: 0,
        export_count: 0,
        review_sessions: 0,
        active_projects: activeProjects
      }
    );
  });
}

function getOrCreateDailyUsageRow(
  rows: Map<string, DailyUsageRow>,
  usageDate: string,
  activeProjects: number
) {
  const existing = rows.get(usageDate);

  if (existing) {
    return existing;
  }

  const nextRow: DailyUsageRow = {
    usage_date: usageDate,
    credits_used: 0,
    api_requests: 0,
    upload_count: 0,
    export_count: 0,
    review_sessions: 0,
    active_projects: activeProjects
  };

  rows.set(usageDate, nextRow);

  return nextRow;
}

function getOrCreateArchivedDailyUsageRow(
  rows: Map<string, ArchivedDailyUsageRow>,
  usageDate: string,
  activeProjects: number
) {
  const existing = rows.get(usageDate);

  if (existing) {
    return existing;
  }

  const nextRow: ArchivedDailyUsageRow = {
    usage_date: usageDate,
    credits_used: 0,
    api_requests: 0,
    upload_count: 0,
    export_count: 0,
    review_sessions: 0,
    active_projects: activeProjects
  };

  rows.set(usageDate, nextRow);

  return nextRow;
}

function mapUsageBreakdownRows(rows: UsageBreakdownRow[]): UsageBreakdownItem[] {
  return rows.map((row) => ({
    label: row.metric_label,
    value: formatCompactNumber(row.metric_value),
    percent: Math.max(0, Math.min(100, Math.round(row.share_percent ?? 0)))
  }));
}

function buildFallbackUsageBreakdown(
  totalUploads: number,
  totalExports: number,
  totalReviews: number,
  creditsUsed: number
): UsageBreakdownItem[] {
  const maxValue = Math.max(totalUploads, totalExports, totalReviews, creditsUsed, 1);

  return [
    {
      label: "Credits consumed",
      value: formatCompactNumber(creditsUsed),
      percent: Math.round((creditsUsed / maxValue) * 100)
    },
    {
      label: "Uploads",
      value: formatCompactNumber(totalUploads),
      percent: Math.round((totalUploads / maxValue) * 100)
    },
    {
      label: "Exports generated",
      value: formatCompactNumber(totalExports),
      percent: Math.round((totalExports / maxValue) * 100)
    },
    {
      label: "Review sessions",
      value: formatCompactNumber(totalReviews),
      percent: Math.round((totalReviews / maxValue) * 100)
    }
  ];
}

function buildEmptyUsageTrend(now: Date): UsageTrendPoint[] {
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (9 - index));

    return {
      label: formatShortDate(date),
      value: 0
    };
  });
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatDelta(value: number) {
  if (value === 0) {
    return "No change";
  }

  const formatted = new Intl.NumberFormat("en").format(Math.abs(value));

  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function startOfCurrentMonth(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function endOfCurrentMonth(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
}

function formatLocaleSummary(locales: string[]) {
  if (locales.length <= 4) {
    return locales.join(", ");
  }

  return `${locales.slice(0, 4).join(", ")} +${locales.length - 4}`;
}

function getProjectRefFromUrl(urlValue: string | undefined) {
  if (!urlValue) {
    return "Not configured";
  }

  try {
    const url = new URL(urlValue);

    return url.hostname.replace(".supabase.co", "");
  } catch {
    return "Invalid URL";
  }
}

function capitalize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `project-${Date.now().toString(36)}`;
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return groups;
}
