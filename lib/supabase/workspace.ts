import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { User } from "@supabase/supabase-js";

import { mergeGlossaryTranslations, parseGlossaryCsv } from "@/lib/glossary/csv";
import {
  BILLING_PLANS,
  DEFAULT_WORKSPACE_PLAN_ID,
  getBillingPlanDefinition,
  type BillingPlanDefinition
} from "@/lib/billing/plans";
import { DEFAULT_APP_LOCALE, getIntlLocale, normalizeAppLocale } from "@/lib/i18n";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { formatCompactNumber, getLanguageLabel } from "@/lib/projects/formatters";
import { createServerSupabaseAdminClient, createServerSupabaseClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { estimateTranslationFileWordCount } from "@/lib/translation/word-count";
import type { AppLocale } from "@/types/i18n";
import type {
  GlossaryCollectionItem,
  GlossaryMetricItem,
  NewGlossaryCollectionInput,
  GlossaryProjectOption,
  GlossaryScreenData,
  GlossaryStatus,
  GlossaryTermItem,
  ImportGlossaryCsvResult,
  NewGlossaryTermInput
} from "@/types/glossary";
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
import { TranslationPipelineError, type InsufficientCreditsErrorDetails } from "@/types/translation";
import type {
  BillingInvoiceItem,
  BillingPlanOption,
  BillingScreenData,
  DashboardShellData,
  SettingsFilenameFormat,
  SettingsQualityPreset,
  SettingsScreenData,
  SettingsToneStyle,
  UsageActivityFeedItem,
  UsageBreakdownItem,
  UsageLanguageInsightItem,
  UsageMetricItem,
  UsageProjectInsightItem,
  UsageScreenData,
  UsageSummaryOverview,
  UsageSnapshotItem,
  UsageTopFileItem,
  UsageTrendPoint,
  WorkspaceMemberInviteResult,
  WorkspaceMemberListItem,
  WorkspaceMemberRole,
  WorkspaceMembersResponse,
  WorkspaceMemberStatus
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
  metadata: Record<string, unknown> | null;
};

type WorkspaceMemberRow = {
  id: string;
  workspace_id: string;
  email: string;
  display_name: string | null;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceSettingsMetadata = {
  profileName?: string;
  profileEmail?: string;
  company?: string;
  billingAddress?: string;
  preferredLocale?: AppLocale;
  preferredSourceLanguage?: string;
  toneStyle?: SettingsToneStyle;
  strictGlossaryMode?: boolean;
  aiBehavior?: SettingsQualityPreset;
  defaultFilenameFormat?: SettingsFilenameFormat;
  invoiceCreatedEmail?: boolean;
  paymentFailedEmail?: boolean;
  spendingLimitEmail?: boolean;
  inAppNotifications?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: string;
};

export type TranslationRuntimeSettings = {
  workspaceSlug: string;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  sourceLanguageMode: "auto" | "manual";
  toneStyle: SettingsToneStyle;
  strictTagProtection: boolean;
  failOnTagMismatch: boolean;
  useGlossaryAutomatically: boolean;
  strictGlossaryMode: boolean;
  aiBehavior: SettingsQualityPreset;
  defaultFilenameFormat: SettingsFilenameFormat;
  autoDownloadAfterTranslation: boolean;
  translationBatchSize: number;
  translationModel: string;
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
  file_format?: "xliff" | "xlf" | "po" | "strings" | "resx" | "xml" | "csv" | "txt" | "docx" | "pptx";
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
  updated_at: string;
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

type GlossaryProjectRow = {
  id: string;
  slug: string;
  name: string;
};

type GlossaryCollectionLookupRow = {
  id: string;
  slug: string;
  name: string;
};

type GlossaryTermLookupRow = {
  id: string;
  source_term: string;
  source_language: string;
};

type GlossaryWriteContext = {
  collectionsById: Map<string, GlossaryCollectionLookupRow>;
  collectionIdByName: Map<string, string>;
  collectionSlugs: Set<string>;
  projectsByReference: Map<string, GlossaryProjectRow>;
  termsByKey: Map<string, GlossaryTermLookupRow>;
};

const DEFAULT_WORKSPACE_SLUG = "workspace";
const DEFAULT_WORKSPACE_PLAN = getBillingPlanDefinition(DEFAULT_WORKSPACE_PLAN_ID).name;
const DEFAULT_WORKSPACE_AVATAR_LABEL = "W";
const DEFAULT_CREDITS_LIMIT = getBillingPlanDefinition(DEFAULT_WORKSPACE_PLAN_ID).creditsLimit;
const SUPPORTED_LANGUAGE_CODES = new Set(LANGUAGE_OPTIONS.map((option) => option.code));

export async function getDashboardShellData(): Promise<DashboardShellData> {
  noStore();

  const { supabase, workspace, settings } = await getWorkspaceContext();
  const metadata = parseWorkspaceSettingsMetadata(settings.metadata);
  const shellName = metadata.profileName?.trim() || workspace.name;
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
    workspaceName: shellName,
    workspacePlanName: workspace.plan_name,
    workspaceAvatarLabel: buildAvatarLabel(shellName) || workspace.avatar_label,
    projects
  };
}

export async function getCurrentAppLocale(): Promise<AppLocale> {
  noStore();

  try {
    const { settings } = await getWorkspaceContext();

    return parseWorkspaceSettingsMetadata(settings.metadata).preferredLocale ?? DEFAULT_APP_LOCALE;
  } catch {
    return DEFAULT_APP_LOCALE;
  }
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
    const wordCount = await resolveProjectFileWordCount(file);
    const nextStatus = mapFileStatusToDatabase(file.status);

    // The background "queued" sync after upload must never overwrite a file that
    // already progressed to a real translation state.
    if (existing && nextStatus === "queued" && countsTowardUsage(existing.status)) {
      continue;
    }

    const values = {
      project_id: project.id,
      name: file.name,
      file_format: getFileFormat(file.name),
      source_language: file.sourceLanguage,
      target_language: file.targetLanguage,
      status: nextStatus,
      progress_percent: file.progress,
      word_count: wordCount,
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
  const projectCreditsUsed = getProjectCreditsUsedFromRows(refreshedFiles);
  const { error: projectUpdateError } = await supabase
    .from("projects")
    .update({
      status: projectStatus,
      credits_used: projectCreditsUsed,
      updated_at: now
    })
    .eq("id", project.id);

  if (projectUpdateError) {
    throw new Error(`Failed to update project status: ${projectUpdateError.message}`);
  }

  return refreshedFiles.map(mapProjectFileRecord);
}

export async function recordTextTranslationUsage(wordCount: number) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) {
    return;
  }

  const { supabase, workspace } = await getWorkspaceContext();

  await recordWorkspaceUsageDelta(supabase, workspace, {
    occurredAt: new Date(),
    creditsUsed: Math.max(0, Math.round(wordCount)),
    apiRequests: 1
  });
}

export async function recordFileTranslationUsage(wordCount: number) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) {
    return;
  }

  const { supabase, workspace } = await getWorkspaceContext();

  await recordWorkspaceUsageDelta(supabase, workspace, {
    occurredAt: new Date(),
    creditsUsed: Math.max(0, Math.round(wordCount)),
    apiRequests: 1,
    exportCount: 1
  });
}

export async function assertWorkspaceHasCredits(requiredCredits: number) {
  if (!Number.isFinite(requiredCredits) || requiredCredits <= 0) {
    return;
  }

  const { supabase, workspace } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("workspace_billing_cycles")
    .select("credits_limit, credits_used")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load active billing cycle for credit validation: ${error.message}`);
  }

  const activeCycle = data as Pick<BillingCycleRow, "credits_limit" | "credits_used"> | null;
  const planCreditsLimit = getBillingPlanDefinition(workspace.plan_name).creditsLimit;
  const creditsLimit = activeCycle?.credits_limit ?? workspace.credits_limit ?? planCreditsLimit ?? DEFAULT_CREDITS_LIMIT;
  const creditsUsed = Math.max(activeCycle?.credits_used ?? 0, workspace.credits_used ?? 0);
  const remainingCredits = Math.max(creditsLimit - creditsUsed, 0);

  if (requiredCredits > remainingCredits) {
    const details: InsufficientCreditsErrorDetails = {
      requiredCredits: Math.round(requiredCredits),
      remainingCredits,
      creditsLimit,
      creditsUsed,
      billingPath: "/billing",
      upgradePath: "/billing?intent=credits"
    };

    throw new TranslationPipelineError(
      "insufficient_credits",
      `This translation needs ${details.requiredCredits} credits but only ${remainingCredits} remain in the current billing cycle.`,
      402,
      { ...details }
    );
  }
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

export async function updateProjectIdentity(
  projectSlug: string,
  input: {
    name: string;
  }
): Promise<{ slug: string; previousSlug: string; name: string }> {
  const { supabase, workspace } = await getWorkspaceContext();
  const project = await getProjectRowBySlug(supabase, workspace.id, projectSlug);
  const name = input.name.trim();

  if (!project) {
    throw new Error("Project not found.");
  }

  if (!name) {
    throw new Error("Project name is required.");
  }

  let nextSlug = project.slug;

  if (name !== project.name) {
    const { data, error } = await supabase
      .from("projects")
      .select("slug")
      .eq("workspace_id", workspace.id)
      .neq("id", project.id);

    if (error) {
      throw new Error(`Failed to validate project slug: ${error.message}`);
    }

    const existingSlugs = new Set((((data as { slug: string }[] | null) ?? [])).map((row) => row.slug));
    nextSlug = buildUniqueSlugFromSet(slugify(name), existingSlugs);
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("projects")
    .update({
      name,
      slug: nextSlug,
      updated_at: now
    })
    .eq("id", project.id);

  if (updateError) {
    throw new Error(`Failed to update project: ${updateError.message}`);
  }

  if (name !== project.name) {
    const { error: activityError } = await supabase.from("project_activities").insert({
      project_id: project.id,
      kind: "project_updated",
      title: "Project renamed",
      detail: `Renamed project from "${project.name}" to "${name}".`,
      occurred_at: now
    });

    if (activityError) {
      console.error(`Project activity logging failed: ${activityError.message}`);
    }
  }

  return {
    slug: nextSlug,
    previousSlug: project.slug,
    name
  };
}

export async function getUsageScreenData(): Promise<UsageScreenData> {
  noStore();

  const { supabase, workspace, settings } = await getWorkspaceContext();
  const metadata = parseWorkspaceSettingsMetadata(settings.metadata);
  const locale = metadata.preferredLocale ?? DEFAULT_APP_LOCALE;
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
  const trend = effectiveUsageRows.length > 0 ? effectiveUsageRows.map((row) => mapUsageTrendPoint(row, locale)) : buildEmptyUsageTrend(now, locale);
  const breakdown = breakdownRows.length > 0 ? mapUsageBreakdownRows(breakdownRows, locale) : buildFallbackUsageBreakdown(totalUploads, totalExports, totalReviews, creditsUsed, locale);
  const projectedSpend = billingCycle ? billingCycle.projected_spend_cents : 0;
  const cycleStart = billingCycle?.period_start
    ? new Date(`${billingCycle.period_start}T00:00:00.000Z`)
    : startOfCurrentMonth(now);
  const cycleEnd = billingCycle?.period_end
    ? new Date(`${billingCycle.period_end}T00:00:00.000Z`)
    : endOfCurrentMonth(now);
  const updatedLabel = derivedUsage.lastUpdatedAt
    ? formatUpdatedLabel(derivedUsage.lastUpdatedAt, locale)
    : effectiveUsageRows.length > 0
      ? formatUpdatedLabel(new Date(`${effectiveUsageRows.at(-1)?.usage_date}T18:00:00.000Z`), locale)
      : formatUpdatedLabel(now, locale);
  const planValue = locale === "de"
    ? `${formatCompactNumber(creditsUsed, locale)} / ${formatCompactNumber(creditsLimit, locale)} Credits`
    : `${formatCompactNumber(creditsUsed, locale)} / ${formatCompactNumber(creditsLimit, locale)} credits`;
  const planMeta =
    locale === "de"
      ? `${formatCompactNumber(Math.max(creditsLimit - creditsUsed, 0), locale)} Credits verbleiben bis ${formatLongDate(cycleEnd, locale)}.`
      : `${formatCompactNumber(Math.max(creditsLimit - creditsUsed, 0), locale)} credits remaining before ${formatLongDate(cycleEnd, locale)}.`;
  const summary: UsageSummaryOverview = {
    wordsUsed: creditsUsed,
    totalWords: creditsLimit,
    creditsUsed,
    remainingUsage: Math.max(creditsLimit - creditsUsed, 0),
    percentConsumed: cycleConsumedPercent,
    cycleLabel: `${formatShortDate(cycleStart, locale)} - ${formatShortDate(cycleEnd, locale)}`,
    resetDateLabel: formatLongDate(cycleEnd, locale),
    resetRelativeLabel: describeResetDate(cycleEnd, now, locale)
  };
  const projectUsage = buildUsageProjectInsights(projects, creditsUsed, locale);
  const languageUsage = buildUsageLanguageInsights(projects, creditsUsed, locale);
  const topFiles = buildUsageTopFiles(projects, locale);
  const activity = buildUsageActivityFeed(projects, locale);
  const numberFormat = new Intl.NumberFormat(getIntlLocale(locale));

  const metrics: UsageMetricItem[] = [
    {
      value: `${cycleConsumedPercent}%`,
      label: locale === "de" ? "Zyklus verbraucht" : "Cycle consumed",
      meta:
        locale === "de"
          ? `${Math.max(100 - cycleConsumedPercent, 0)}% verbleiben im aktuellen Zyklus`
          : `${Math.max(100 - cycleConsumedPercent, 0)}% remaining in current cycle`,
      tone: "positive"
    },
    {
      value: formatCompactNumber(creditsUsed, locale),
      label: locale === "de" ? "Verbrauchte Credits" : "Credits used",
      meta: billingCycle
        ? locale === "de"
          ? "Aktueller Abrechnungszeitraum"
          : "Current billing cycle"
        : locale === "de"
          ? "Aus Workspace-Summen abgeleitet"
          : "Derived from workspace totals"
    },
    {
      value: numberFormat.format(totalApiRequests),
      label: locale === "de" ? "API-Anfragen" : "API requests",
      meta:
        locale === "de"
          ? `${numberFormat.format(totalUploads)} Upload-Sitzungen`
          : `${numberFormat.format(totalUploads)} upload sessions`
    },
    {
      value: formatCurrency(projectedSpend / 100, locale),
      label: locale === "de" ? "Prognostizierte Kosten" : "Projected spend",
      meta: locale === "de" ? "Basierend auf der aktuellen Rate" : "Based on current run-rate"
    }
  ];

  const snapshots: UsageSnapshotItem[] = [
    {
      label: locale === "de" ? "Heute verbrauchte Credits" : "Credits used today",
      value: numberFormat.format(todayRow?.credits_used ?? 0),
      detail:
        locale === "de"
          ? `Über ${numberFormat.format(todayRow?.upload_count ?? 0)} Uploads`
          : `Across ${numberFormat.format(todayRow?.upload_count ?? 0)} uploads`
    },
    {
      label: locale === "de" ? "API-Anfragen" : "API requests",
      value: numberFormat.format(totalApiRequests),
      detail: yesterdayRow
        ? locale === "de"
          ? `${formatDelta(totalApiRequests - yesterdayRow.api_requests, locale)} gegenüber dem zuvor erfassten Tag`
          : `${formatDelta(totalApiRequests - yesterdayRow.api_requests, locale)} vs. previous recorded day`
        : locale === "de"
          ? "Kein vorheriger Nutzungstag verfügbar"
          : "No previous usage day available"
    },
    {
      label: locale === "de" ? "Aktive Projekte" : "Active projects",
      value: String(activeProjects),
      detail: locale === "de" ? `${reviewProjects} in Prüfung` : `${reviewProjects} in review`
    },
    {
      label: locale === "de" ? "Aktueller Zyklus" : "Current cycle",
      value: `${formatShortDate(cycleStart, locale)} - ${formatShortDate(cycleEnd, locale)}`,
      detail: locale === "de" ? `${cycleConsumedPercent}% verbraucht` : `${cycleConsumedPercent}% consumed`
    }
  ];

  return {
    summary,
    metrics,
    trend,
    snapshots,
    breakdown,
    projectUsage,
    languageUsage,
    topFiles,
    activity,
    updatedLabel,
    planValue,
    planMeta,
    planPercent: cycleConsumedPercent
  };
}

export async function getBillingScreenData(): Promise<BillingScreenData> {
  noStore();

  const now = new Date();
  const { supabase, workspace, settings } = await getWorkspaceContext();
  const metadata = parseWorkspaceSettingsMetadata(settings.metadata);
  const locale = metadata.preferredLocale ?? DEFAULT_APP_LOCALE;
  const currentPlan = getBillingPlanDefinition(workspace.plan_name);
  const [{ data: billingCyclesData, error: billingError }, projects] = await Promise.all([
    supabase
      .from("workspace_billing_cycles")
      .select("id, period_start, period_end, credits_limit, credits_used, projected_spend_cents, status")
      .eq("workspace_id", workspace.id)
      .order("period_start", { ascending: false })
      .limit(6),
    getProjectRecords()
  ]);

  if (billingError) {
    throw new Error(`Failed to load billing cycles: ${billingError.message}`);
  }

  const billingCycles = (billingCyclesData as BillingCycleRow[] | null) ?? [];
  const activeCycle = billingCycles.find((cycle) => cycle.status === "active") ?? billingCycles[0] ?? null;
  const derivedUsage = deriveUsageFromProjects(projects, now);
  const creditsLimit = activeCycle?.credits_limit ?? workspace.credits_limit ?? currentPlan.creditsLimit;
  const creditsUsed = Math.max(activeCycle?.credits_used ?? 0, workspace.credits_used ?? 0, derivedUsage.creditsUsed);
  const creditsRemaining = Math.max(creditsLimit - creditsUsed, 0);
  const usagePercent = creditsLimit > 0 ? Math.min(100, Math.round((creditsUsed / creditsLimit) * 100)) : 0;
  const projectedSpendCents = Math.max(activeCycle?.projected_spend_cents ?? 0, currentPlan.basePriceCents);
  const cycleStart = activeCycle?.period_start
    ? new Date(`${activeCycle.period_start}T00:00:00.000Z`)
    : startOfCurrentMonth(now);
  const cycleEnd = activeCycle?.period_end
    ? new Date(`${activeCycle.period_end}T00:00:00.000Z`)
    : endOfCurrentMonth(now);
  const activeProjects = projects.filter((project) => project.status !== "Completed").length;
  const reviewProjects = projects.filter((project) => project.status === "In Review").length;
  const billingEmail = metadata.profileEmail ?? `${workspace.slug}@translayr.app`;
  const manageBillingAvailable = Boolean(metadata.stripeCustomerId);
  const subscriptionStatusLabel = metadata.stripeSubscriptionStatus
    ? formatStripeStatusLabel(metadata.stripeSubscriptionStatus, locale)
    : null;
  const subscriptionPeriodEnd = metadata.stripeCurrentPeriodEnd
    ? safeParseDate(metadata.stripeCurrentPeriodEnd)
    : null;

  const metrics: UsageMetricItem[] = [
    {
      value: currentPlan.name,
      label: locale === "de" ? "Aktueller Plan" : "Current plan",
      meta:
        locale === "de"
          ? `${formatCompactNumber(currentPlan.creditsLimit, locale)} enthaltene Credits`
          : `${formatCompactNumber(currentPlan.creditsLimit, locale)} included credits`,
      tone: "positive"
    },
    {
      value: formatCompactNumber(creditsRemaining, locale),
      label: locale === "de" ? "Verbleibende Credits" : "Credits remaining",
      meta:
        locale === "de"
          ? `${usagePercent}% dieses Zyklus bereits verbraucht`
          : `${usagePercent}% of this cycle already consumed`
    },
    {
      value: String(activeProjects),
      label: locale === "de" ? "Aktive Projekte" : "Active projects",
      meta: locale === "de" ? `${reviewProjects} aktuell in Prüfung` : `${reviewProjects} currently in review`
    },
    {
      value: formatCurrency(projectedSpendCents / 100, locale),
      label: locale === "de" ? "Prognostizierte Rechnung" : "Projected invoice",
      meta: activeCycle
        ? locale === "de"
          ? "Prognose für den aktuellen Zyklus"
          : "Current cycle projection"
        : locale === "de"
          ? "Basis-Schätzung des Abos"
          : "Base subscription estimate"
    }
  ];

  const plans: BillingPlanOption[] = BILLING_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: formatCurrency(plan.basePriceCents / 100, locale),
    priceMeta: plan.basePriceCents > 0
      ? locale === "de"
        ? "pro Monat exkl. USt."
        : "per month excl. VAT"
      : locale === "de"
        ? "monatliches Limit"
        : "monthly limit",
    credits:
      locale === "de"
        ? `${formatCompactNumber(plan.creditsLimit, locale)} Credits`
        : `${formatCompactNumber(plan.creditsLimit, locale)} credits`,
    description: getLocalizedPlanDescription(plan, locale),
    features: getLocalizedPlanFeatures(plan, locale),
    current: plan.name.toLowerCase() === currentPlan.name.toLowerCase()
  }));

  const invoices = (billingCycles.length > 0 ? billingCycles : [buildFallbackBillingCycle(now, currentPlan, creditsUsed)])
    .map((cycle) => mapBillingInvoiceItem(cycle, currentPlan, locale))
    .slice(0, 6);

  return {
    metrics,
    currentPlanName: currentPlan.name,
    planDescription: getLocalizedPlanDescription(currentPlan, locale),
    cycleLabel: `${formatShortDate(cycleStart, locale)} - ${formatShortDate(cycleEnd, locale)}`,
    renewalLabel: locale === "de" ? `Verlängert sich am ${formatLongDate(cycleEnd, locale)}` : `Renews on ${formatLongDate(cycleEnd, locale)}`,
    usageValue:
      locale === "de"
        ? `${formatCompactNumber(creditsUsed, locale)} / ${formatCompactNumber(creditsLimit, locale)} Credits`
        : `${formatCompactNumber(creditsUsed, locale)} / ${formatCompactNumber(creditsLimit, locale)} credits`,
    usageMeta:
      locale === "de"
        ? `${formatCompactNumber(creditsRemaining, locale)} Credits verbleiben im aktuellen Zyklus.`
        : `${formatCompactNumber(creditsRemaining, locale)} credits remaining in the current cycle.`,
    usagePercent,
    projectedSpendValue: formatCurrency(projectedSpendCents / 100, locale),
    creditsRemainingValue: formatCompactNumber(creditsRemaining, locale),
    billingEmail,
    paymentMethodLabel: manageBillingAvailable
      ? locale === "de"
        ? "In Stripe verwaltet"
        : "Managed in Stripe"
      : locale === "de"
        ? "Noch keine Stripe-Abrechnung"
        : "No Stripe billing session yet",
    paymentMethodMeta: manageBillingAvailable
      ? subscriptionStatusLabel && subscriptionPeriodEnd
        ? locale === "de"
          ? `${subscriptionStatusLabel} bis ${formatLongDate(subscriptionPeriodEnd, locale)}.`
          : `${subscriptionStatusLabel} until ${formatLongDate(subscriptionPeriodEnd, locale)}.`
        : subscriptionStatusLabel
          ? `${subscriptionStatusLabel}.`
          : locale === "de"
            ? `Die Abrechnung ist mit ${billingEmail} verknüpft.`
            : `Billing is linked to ${billingEmail}.`
      : locale === "de"
        ? `Die Auswahl eines kostenpflichtigen Plans öffnet Stripe Checkout für ${billingEmail}.`
        : `Selecting a paid plan opens Stripe Checkout for ${billingEmail}.`,
    paymentNotice: manageBillingAvailable
      ? locale === "de"
        ? "Nutze das Stripe-Kundenportal für Rechnungen, Zahlungsmethoden und Kündigungen."
        : "Use the Stripe customer portal for invoices, payment methods, and cancellations."
      : locale === "de"
        ? "Preise werden monatlich berechnet und exkl. USt. angezeigt."
        : "Prices are billed monthly and shown excl. VAT.",
    manageBillingAvailable,
    plans,
    invoices
  };
}

export async function updateBillingPlan(planId: string): Promise<BillingScreenData> {
  const plan = BILLING_PLANS.find((entry) => entry.id === planId.trim().toLowerCase());

  if (!plan) {
    throw new Error("Select a supported billing plan.");
  }

  const { supabase, workspace } = await getWorkspaceContext();
  const { data: activeCycleData, error: activeCycleError } = await supabase
    .from("workspace_billing_cycles")
    .select("id, projected_spend_cents")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeCycleError) {
    throw new Error(`Failed to load active billing cycle: ${activeCycleError.message}`);
  }

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({
      plan_name: plan.name,
      credits_limit: plan.creditsLimit
    })
    .eq("id", workspace.id);

  if (workspaceError) {
    throw new Error(`Failed to update subscription plan: ${workspaceError.message}`);
  }

  if (activeCycleData) {
    const activeCycle = activeCycleData as Pick<BillingCycleRow, "id" | "projected_spend_cents">;
    const { error: cycleError } = await supabase
      .from("workspace_billing_cycles")
      .update({
        credits_limit: plan.creditsLimit,
        projected_spend_cents: Math.max(activeCycle.projected_spend_cents, plan.basePriceCents)
      })
      .eq("id", activeCycle.id);

    if (cycleError) {
      throw new Error(`Failed to update billing cycle limit: ${cycleError.message}`);
    }
  }

  return getBillingScreenData();
}

export async function getGlossaryScreenData(): Promise<GlossaryScreenData> {
  noStore();

  const { supabase, workspace, settings } = await getWorkspaceContext();
  const locale = parseWorkspaceSettingsMetadata(settings.metadata).preferredLocale ?? DEFAULT_APP_LOCALE;

  const [
    { data: collectionsData, error: collectionsError },
    { data: termsData, error: termsError },
    { data: projectsData, error: projectsError }
  ] = await Promise.all([
    supabase
      .from("glossary_collections")
      .select("id, name, description")
      .eq("workspace_id", workspace.id)
      .order("name", { ascending: true }),
    supabase
      .from("glossary_terms")
      .select("id, collection_id, source_term, source_language, status, is_protected, updated_at")
      .eq("workspace_id", workspace.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, slug, name")
      .eq("workspace_id", workspace.id)
      .order("name", { ascending: true })
  ]);

  if (collectionsError) {
    throw new Error(`Failed to load glossary collections: ${collectionsError.message}`);
  }

  if (termsError) {
    throw new Error(`Failed to load glossary terms: ${termsError.message}`);
  }

  if (projectsError) {
    throw new Error(`Failed to load glossary projects: ${projectsError.message}`);
  }

  const collectionRows = (collectionsData as GlossaryCollectionRow[] | null) ?? [];
  const termRows = (termsData as GlossaryTermRow[] | null) ?? [];
  const projectRows = (projectsData as GlossaryProjectRow[] | null) ?? [];
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

  const translationsByTermId = groupBy(
    (translationsData as GlossaryTranslationRow[] | null) ?? [],
    (translation) => translation.term_id
  );
  const projectLinksByTermId = groupBy(
    (projectTermLinksData as ProjectGlossaryTermRow[] | null) ?? [],
    (link) => link.term_id
  );
  const projectById = new Map(projectRows.map((project) => [project.id, project]));
  const collectionById = new Map(collectionRows.map((collection) => [collection.id, collection]));

  const distinctLocales = new Set(
    ((translationsData as GlossaryTranslationRow[] | null) ?? []).map((translation) =>
      translation.locale_code.toUpperCase()
    )
  );
  const metrics: GlossaryMetricItem[] = [
    {
      label: locale === "de" ? "Begriffe gesamt" : "Total terms",
      value: String(termRows.length),
      meta: locale === "de" ? "Über alle synchronisierten Sammlungen" : "Across all synced collections"
    },
    {
      label: locale === "de" ? "Geschützte Begriffe" : "Protected phrases",
      value: String(termRows.filter((term) => term.is_protected).length),
      meta: locale === "de" ? "Niemals übersetzen" : "Never translate"
    },
    {
      label: locale === "de" ? "Abgedeckte Sprachen" : "Locales covered",
      value: String(distinctLocales.size),
      meta: distinctLocales.size > 0
        ? formatLocaleSummary(Array.from(distinctLocales))
        : locale === "de"
          ? "Noch keine Sprachübersetzungen"
          : "No locale translations yet"
    },
    {
      label: locale === "de" ? "Offene Prüfungen" : "Pending reviews",
      value: String(termRows.filter((term) => term.status === "review").length),
      meta: locale === "de" ? "Benötigt Freigabe" : "Needs approval"
    }
  ];

  const terms: GlossaryTermItem[] = termRows.map((term) => {
    const translations = (translationsByTermId.get(term.id) ?? [])
      .slice()
      .sort((left, right) => left.locale_code.localeCompare(right.locale_code))
      .map((translation) => ({
        locale: translation.locale_code.toLowerCase(),
        term: translation.translated_term
      }));
    const linkedProjects = (projectLinksByTermId.get(term.id) ?? [])
      .map((link) => projectById.get(link.project_id))
      .filter((project): project is GlossaryProjectRow => Boolean(project));
    const collection = term.collection_id ? collectionById.get(term.collection_id) ?? null : null;

    return {
      id: term.id,
      source: term.source_term,
      sourceLanguage: term.source_language,
      translations,
      translationsLabel:
        translations.length > 0
          ? translations
              .map((translation) => `${translation.locale.toUpperCase()} ${translation.term}`)
              .join(" · ")
          : locale === "de"
            ? "Noch keine Übersetzungen"
            : "No translations yet",
      status: mapGlossaryStatus(term.status),
      project: linkedProjects.length > 0
        ? linkedProjects.map((project) => project.name).join(", ")
        : locale === "de"
          ? "Geteilt"
          : "Shared",
      projectSlugs: linkedProjects.map((project) => project.slug),
      collectionId: collection?.id ?? null,
      collectionName: collection?.name ?? null,
      isProtected: term.is_protected
    };
  });

  const termCountByCollectionId = new Map<string, number>();
  for (const term of termRows) {
    if (term.collection_id) {
      termCountByCollectionId.set(term.collection_id, (termCountByCollectionId.get(term.collection_id) ?? 0) + 1);
    }
  }

  const collections: GlossaryCollectionItem[] = collectionRows.map((collection) => ({
    id: collection.id,
    name: collection.name,
    count:
      locale === "de"
        ? `${termCountByCollectionId.get(collection.id) ?? 0} Begriffe`
        : `${termCountByCollectionId.get(collection.id) ?? 0} terms`,
    detail: collection.description ?? (locale === "de" ? "Noch keine Beschreibung für diese Sammlung." : "No collection description yet.")
  }));

  const projects: GlossaryProjectOption[] = projectRows.map((project) => ({
    id: project.id,
    slug: project.slug,
    name: project.name
  }));

  return {
    metrics,
    terms,
    collections,
    projects
  };
}

export async function getSettingsScreenData(): Promise<SettingsScreenData> {
  noStore();

  const { workspace, settings } = await getWorkspaceContext();
  const metadata = parseWorkspaceSettingsMetadata(settings.metadata);
  const locale = metadata.preferredLocale ?? DEFAULT_APP_LOCALE;

  return {
    profile: {
      name: metadata.profileName ?? workspace.name,
      email: metadata.profileEmail ?? `${workspace.slug}@translayr.app`,
      company: metadata.company ?? "",
      billingAddress: metadata.billingAddress ?? ""
    },
    translation: {
      sourceLanguageMode: settings.default_source_language ? "manual" : "auto",
      sourceLanguage: settings.default_source_language ?? metadata.preferredSourceLanguage ?? "en",
      targetLanguage: settings.default_target_language ?? "de",
      toneStyle: metadata.toneStyle ?? "Neutral",
      strictTagProtection: settings.inline_tag_validation_mode !== "off" && settings.inline_tag_validation_mode !== "warn",
      failOnTagMismatch: settings.block_export_on_validation_failure,
      useGlossaryAutomatically: settings.glossary_prompt_injection,
      strictGlossaryMode: metadata.strictGlossaryMode ?? false,
      aiBehavior: metadata.aiBehavior ?? getAiBehaviorFromSettings(settings)
    },
    preferences: {
      locale,
      autoDownloadAfterTranslation: settings.auto_export_after_completion,
      defaultFilenameFormat: metadata.defaultFilenameFormat ?? "Original + target locale"
    },
    notifications: {
      translationCompleteEmail: settings.email_notifications,
      invoiceCreatedEmail: metadata.invoiceCreatedEmail ?? true,
      paymentFailedEmail: metadata.paymentFailedEmail ?? true,
      spendingLimitEmail: metadata.spendingLimitEmail ?? true,
      reviewReminders: settings.review_reminders,
      inAppNotifications: metadata.inAppNotifications ?? true
    },
    dangerZone: {
      title: locale === "de" ? "Konto löschen" : "Delete account",
      description: locale === "de"
        ? "Entferne dein Translayr-Konto, den Workspace-Zugriff und persönliche Einstellungen dauerhaft."
        : "Permanently remove your Translayr account, workspace access, and personal settings.",
      actionLabel: locale === "de" ? "Konto löschen" : "Delete account"
    }
  };
}

export async function updateSettings(input: SettingsScreenData): Promise<SettingsScreenData> {
  const { supabase, workspace, settings } = await getWorkspaceContext();
  const currentMetadata = parseWorkspaceSettingsMetadata(settings.metadata);
  const rawMetadata =
    settings.metadata && typeof settings.metadata === "object" ? settings.metadata : {};

  const profileName = input.profile.name.trim();
  const profileEmail = input.profile.email.trim().toLowerCase();
  const company = input.profile.company.trim();
  const billingAddress = input.profile.billingAddress.trim();

  if (!profileName) {
    throw new Error("Name is required.");
  }

  if (!isValidEmail(profileEmail)) {
    throw new Error("Enter a valid email address.");
  }

  const sourceLanguageMode = input.translation.sourceLanguageMode === "manual" ? "manual" : "auto";
  const sourceLanguage = validateLanguageCode(input.translation.sourceLanguage, "source language");
  const targetLanguage = validateLanguageCode(input.translation.targetLanguage, "target language");

  if (sourceLanguageMode === "manual" && sourceLanguage === targetLanguage) {
    throw new Error("Source and target language should not be identical for the default translation setup.");
  }

  const toneStyle = normalizeToneStyle(input.translation.toneStyle);
  const aiBehavior = normalizeAiBehavior(input.translation.aiBehavior);
  const defaultFilenameFormat = normalizeFilenameFormat(input.preferences.defaultFilenameFormat);
  const preferredLocale = normalizeAppLocale(input.preferences.locale);
  const translationBatchSize = getBatchSizeForAiBehavior(aiBehavior);
  const inlineTagValidationMode = input.translation.strictTagProtection ? "strict" : "warn";

  const nextMetadata: WorkspaceSettingsMetadata = {
    ...rawMetadata,
    ...currentMetadata,
    profileName,
    profileEmail,
    company,
    billingAddress,
    preferredLocale,
    preferredSourceLanguage: sourceLanguage,
    toneStyle,
    strictGlossaryMode: Boolean(input.translation.strictGlossaryMode),
    aiBehavior,
    defaultFilenameFormat,
    invoiceCreatedEmail: Boolean(input.notifications.invoiceCreatedEmail),
    paymentFailedEmail: Boolean(input.notifications.paymentFailedEmail),
    spendingLimitEmail: Boolean(input.notifications.spendingLimitEmail),
    inAppNotifications: Boolean(input.notifications.inAppNotifications)
  };

  const avatarLabel = buildAvatarLabel(profileName);

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({
      name: profileName,
      avatar_label: avatarLabel || workspace.avatar_label
    })
    .eq("id", workspace.id);

  if (workspaceError) {
    throw new Error(`Failed to save workspace identity: ${workspaceError.message}`);
  }

  const { error } = await supabase
    .from("workspace_settings")
    .update({
      default_source_language: sourceLanguageMode === "manual" ? sourceLanguage : null,
      default_target_language: targetLanguage,
      inline_tag_validation_mode: inlineTagValidationMode,
      block_export_on_validation_failure: Boolean(input.translation.failOnTagMismatch),
      email_notifications: Boolean(input.notifications.translationCompleteEmail),
      review_reminders: Boolean(input.notifications.reviewReminders),
      auto_export_after_completion: Boolean(input.preferences.autoDownloadAfterTranslation),
      glossary_prompt_injection: Boolean(input.translation.useGlossaryAutomatically),
      translation_batch_size: translationBatchSize,
      metadata: nextMetadata
    })
    .eq("workspace_id", workspace.id);

  if (error) {
    throw new Error(`Failed to save settings: ${error.message}`);
  }

  return {
    profile: {
      name: profileName,
      email: profileEmail,
      company,
      billingAddress
    },
    translation: {
      sourceLanguageMode,
      sourceLanguage,
      targetLanguage,
      toneStyle,
      strictTagProtection: Boolean(input.translation.strictTagProtection),
      failOnTagMismatch: Boolean(input.translation.failOnTagMismatch),
      useGlossaryAutomatically: Boolean(input.translation.useGlossaryAutomatically),
      strictGlossaryMode: Boolean(input.translation.strictGlossaryMode),
      aiBehavior
    },
    preferences: {
      locale: preferredLocale,
      autoDownloadAfterTranslation: Boolean(input.preferences.autoDownloadAfterTranslation),
      defaultFilenameFormat
    },
    notifications: {
      translationCompleteEmail: Boolean(input.notifications.translationCompleteEmail),
      invoiceCreatedEmail: Boolean(input.notifications.invoiceCreatedEmail),
      paymentFailedEmail: Boolean(input.notifications.paymentFailedEmail),
      spendingLimitEmail: Boolean(input.notifications.spendingLimitEmail),
      reviewReminders: Boolean(input.notifications.reviewReminders),
      inAppNotifications: Boolean(input.notifications.inAppNotifications)
    },
    dangerZone: {
      title: input.dangerZone.title,
      description: input.dangerZone.description,
      actionLabel: input.dangerZone.actionLabel
    }
  };
}

export async function getWorkspaceMembers(): Promise<WorkspaceMembersResponse> {
  noStore();

  const { supabase, workspace, member } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, email, display_name, role, status, metadata, created_at, updated_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load workspace members: ${error.message}`);
  }

  return {
    members: ((data as WorkspaceMemberRow[] | null) ?? []).map(mapWorkspaceMemberListItem),
    canInvite: canManageWorkspaceMembers(member.role)
  };
}

export async function inviteWorkspaceMember(input: {
  email: string;
  role: WorkspaceMemberRole;
}): Promise<WorkspaceMemberInviteResult> {
  const { supabase, workspace, member, user } = await getWorkspaceContext();
  const email = normalizeMemberEmail(input.email);

  if (!canManageWorkspaceMembers(member.role)) {
    throw new Error("You do not have permission to invite users to this workspace.");
  }

  if (!email || !isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!isWorkspaceMemberRole(input.role)) {
    throw new Error("Select a supported workspace role.");
  }

  if (email === normalizeMemberEmail(user.email)) {
    throw new Error("You are already part of this workspace.");
  }

  const { data: existingMemberData, error: existingMemberError } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, email, display_name, role, status, metadata, created_at, updated_at")
    .eq("workspace_id", workspace.id)
    .eq("email", email)
    .maybeSingle();

  if (existingMemberError) {
    throw new Error(`Failed to validate existing workspace access: ${existingMemberError.message}`);
  }

  const existingMember = existingMemberData as WorkspaceMemberRow | null;

  if (existingMember?.status === "active") {
    throw new Error("This user already has active access to the workspace.");
  }

  const previousMemberSnapshot = existingMember ? { ...existingMember } : null;
  const nextMetadata =
    existingMember?.metadata && typeof existingMember.metadata === "object" ? { ...existingMember.metadata } : {};
  const { data: upsertedMemberData, error: upsertMemberError } = await supabase
    .from("workspace_members")
    .upsert(
      {
        workspace_id: workspace.id,
        email,
        display_name: existingMember?.display_name ?? null,
        role: input.role,
        status: "invited",
        metadata: {
          ...nextMetadata,
          invited_by_user_id: user.id,
          invited_by_email: normalizeMemberEmail(user.email),
          invited_at: new Date().toISOString()
        }
      },
      { onConflict: "workspace_id,email" }
    )
    .select("id, workspace_id, email, display_name, role, status, metadata, created_at, updated_at")
    .single();

  if (upsertMemberError) {
    throw new Error(`Failed to store workspace invitation: ${upsertMemberError.message}`);
  }

  const upsertedMember = upsertedMemberData as WorkspaceMemberRow;
  const redirectTo = `${getAppUrl()}/auth/accept-invite?next=${encodeURIComponent("/projects")}`;
  const supabaseAdmin = createServerSupabaseAdminClient();
  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      invited_workspace_id: workspace.id,
      invited_workspace_name: workspace.name,
      invited_role: input.role
    }
  });

  if (inviteError) {
    await rollbackWorkspaceInvitation(supabase, workspace.id, email, previousMemberSnapshot);
    throw new Error(`Supabase invite could not be sent: ${inviteError.message}`);
  }

  return {
    member: mapWorkspaceMemberListItem(upsertedMember),
    message: "Invitation sent."
  };
}

export async function getTranslationRuntimeSettings(): Promise<TranslationRuntimeSettings> {
  noStore();

  const { workspace, settings } = await getWorkspaceContext();
  const metadata = parseWorkspaceSettingsMetadata(settings.metadata);

  return {
    workspaceSlug: workspace.slug,
    defaultSourceLanguage: settings.default_source_language ?? undefined,
    defaultTargetLanguage: settings.default_target_language ?? undefined,
    sourceLanguageMode: settings.default_source_language ? "manual" : "auto",
    toneStyle: metadata.toneStyle ?? "Neutral",
    strictTagProtection: settings.inline_tag_validation_mode === "strict",
    failOnTagMismatch: settings.block_export_on_validation_failure,
    useGlossaryAutomatically: settings.glossary_prompt_injection,
    strictGlossaryMode: metadata.strictGlossaryMode ?? false,
    aiBehavior: metadata.aiBehavior ?? getAiBehaviorFromSettings(settings),
    defaultFilenameFormat: metadata.defaultFilenameFormat ?? "Original + target locale",
    autoDownloadAfterTranslation: settings.auto_export_after_completion,
    translationBatchSize: Math.max(1, settings.translation_batch_size),
    translationModel: settings.translation_model
  };
}

export async function createGlossaryTerm(input: NewGlossaryTermInput): Promise<{ id: string }> {
  const { supabase, workspace } = await getWorkspaceContext();
  const glossaryContext = await getGlossaryWriteContext(supabase, workspace.id);
  const source = input.source.trim();
  const sourceLanguage = input.sourceLanguage.trim().toLowerCase() || "en";

  if (!source) {
    throw new Error("Source term is required.");
  }

  const translations = mergeGlossaryTranslations(input.translations);
  const existingTerm = glossaryContext.termsByKey.get(getGlossaryTermKey(sourceLanguage, source));

  if (existingTerm) {
    throw new Error("A glossary term with this source text and language already exists.");
  }

  const collectionId = resolveGlossaryCollectionId(
    input.collectionId ?? null,
    glossaryContext.collectionsById
  );
  const project = resolveGlossaryProject(input.projectSlug ?? null, glossaryContext.projectsByReference);
  const now = new Date().toISOString();
  const { data: termData, error: termError } = await supabase
    .from("glossary_terms")
    .insert({
      workspace_id: workspace.id,
      collection_id: collectionId,
      source_term: source,
      source_language: sourceLanguage,
      status: mapGlossaryStatusToDatabase(input.status),
      is_protected: input.isProtected,
      updated_at: now
    })
    .select("id")
    .single();

  if (termError) {
    throw new Error(`Failed to create glossary term: ${termError.message}`);
  }

  const termId = (termData as { id: string }).id;

  if (translations.length > 0) {
    const { error: translationError } = await supabase
      .from("glossary_term_translations")
      .insert(
        translations.map((translation) => ({
          term_id: termId,
          locale_code: translation.locale,
          translated_term: translation.term
        }))
      );

    if (translationError) {
      await supabase.from("glossary_terms").delete().eq("id", termId);
      throw new Error(`Failed to save glossary translations: ${translationError.message}`);
    }
  }

  if (project) {
    const { error: projectLinkError } = await supabase.from("project_glossary_terms").upsert(
      {
        project_id: project.id,
        term_id: termId
      },
      {
        onConflict: "project_id,term_id"
      }
    );

    if (projectLinkError) {
      await supabase.from("glossary_terms").delete().eq("id", termId);
      throw new Error(`Failed to link glossary term to project: ${projectLinkError.message}`);
    }

    await insertGlossaryActivities(supabase, [
      {
        projectId: project.id,
        title: "Glossary updated",
        detail: `Added glossary term "${source}".`
      }
    ]);
  }

  return { id: termId };
}

export async function updateGlossaryTerm(
  termId: string,
  input: NewGlossaryTermInput
): Promise<{ id: string }> {
  const { supabase, workspace } = await getWorkspaceContext();
  const glossaryContext = await getGlossaryWriteContext(supabase, workspace.id);
  const source = input.source.trim();
  const sourceLanguage = input.sourceLanguage.trim().toLowerCase() || "en";

  if (!source) {
    throw new Error("Source term is required.");
  }

  const { data: existingTermData, error: existingTermError } = await supabase
    .from("glossary_terms")
    .select("id, source_term, source_language")
    .eq("workspace_id", workspace.id)
    .eq("id", termId)
    .maybeSingle();

  if (existingTermError) {
    throw new Error(`Failed to load glossary term: ${existingTermError.message}`);
  }

  if (!existingTermData) {
    throw new Error("Glossary term could not be found.");
  }

  const translations = mergeGlossaryTranslations(input.translations);
  const duplicateTerm = glossaryContext.termsByKey.get(getGlossaryTermKey(sourceLanguage, source));

  if (duplicateTerm && duplicateTerm.id !== termId) {
    throw new Error("A glossary term with this source text and language already exists.");
  }

  const collectionId = resolveGlossaryCollectionId(
    input.collectionId ?? null,
    glossaryContext.collectionsById
  );
  const project = resolveGlossaryProject(input.projectSlug ?? null, glossaryContext.projectsByReference);
  const now = new Date().toISOString();

  const { error: updateTermError } = await supabase
    .from("glossary_terms")
    .update({
      collection_id: collectionId,
      source_term: source,
      source_language: sourceLanguage,
      status: mapGlossaryStatusToDatabase(input.status),
      is_protected: input.isProtected,
      updated_at: now
    })
    .eq("workspace_id", workspace.id)
    .eq("id", termId);

  if (updateTermError) {
    throw new Error(`Failed to update glossary term: ${updateTermError.message}`);
  }

  const { error: deleteTranslationsError } = await supabase
    .from("glossary_term_translations")
    .delete()
    .eq("term_id", termId);

  if (deleteTranslationsError) {
    throw new Error(`Failed to replace glossary translations: ${deleteTranslationsError.message}`);
  }

  if (translations.length > 0) {
    const { error: insertTranslationsError } = await supabase
      .from("glossary_term_translations")
      .insert(
        translations.map((translation) => ({
          term_id: termId,
          locale_code: translation.locale,
          translated_term: translation.term
        }))
      );

    if (insertTranslationsError) {
      throw new Error(`Failed to save glossary translations: ${insertTranslationsError.message}`);
    }
  }

  const { error: deleteProjectLinksError } = await supabase
    .from("project_glossary_terms")
    .delete()
    .eq("term_id", termId);

  if (deleteProjectLinksError) {
    throw new Error(`Failed to update glossary project links: ${deleteProjectLinksError.message}`);
  }

  if (project) {
    const { error: insertProjectLinkError } = await supabase.from("project_glossary_terms").insert({
      project_id: project.id,
      term_id: termId
    });

    if (insertProjectLinkError) {
      throw new Error(`Failed to link glossary term to project: ${insertProjectLinkError.message}`);
    }

    await insertGlossaryActivities(supabase, [
      {
        projectId: project.id,
        title: "Glossary updated",
        detail: `Updated glossary term "${source}".`
      }
    ]);
  }

  glossaryContext.termsByKey.delete(
    getGlossaryTermKey(
      (existingTermData as GlossaryTermLookupRow).source_language,
      (existingTermData as GlossaryTermLookupRow).source_term
    )
  );
  glossaryContext.termsByKey.set(getGlossaryTermKey(sourceLanguage, source), {
    id: termId,
    source_term: source,
    source_language: sourceLanguage
  });

  return { id: termId };
}

export async function createGlossaryCollection(
  input: NewGlossaryCollectionInput
): Promise<{ id: string }> {
  const { supabase, workspace } = await getWorkspaceContext();
  const glossaryContext = await getGlossaryWriteContext(supabase, workspace.id);
  const name = input.name.trim();

  if (!name) {
    throw new Error("Collection name is required.");
  }

  const existingId = glossaryContext.collectionIdByName.get(normalizeLookupKey(name));

  if (existingId) {
    throw new Error("A glossary collection with this name already exists.");
  }

  const result = await ensureGlossaryCollection(
    supabase,
    workspace.id,
    name,
    glossaryContext,
    input.detail ?? null
  );

  return { id: result.id };
}

export async function deleteGlossaryTerm(termId: string): Promise<void> {
  const { supabase, workspace } = await getWorkspaceContext();
  const { data: termData, error: termError } = await supabase
    .from("glossary_terms")
    .select("id, source_term")
    .eq("workspace_id", workspace.id)
    .eq("id", termId)
    .maybeSingle();

  if (termError) {
    throw new Error(`Failed to load glossary term: ${termError.message}`);
  }

  if (!termData) {
    throw new Error("Glossary term could not be found.");
  }

  const { data: projectLinksData, error: projectLinksError } = await supabase
    .from("project_glossary_terms")
    .select("project_id")
    .eq("term_id", termId);

  if (projectLinksError) {
    throw new Error(`Failed to load glossary term links: ${projectLinksError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("glossary_terms")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", termId);

  if (deleteError) {
    throw new Error(`Failed to delete glossary term: ${deleteError.message}`);
  }

  const linkedProjectIds = Array.from(
    new Set(((projectLinksData as Array<{ project_id: string }> | null) ?? []).map((row) => row.project_id))
  );

  if (linkedProjectIds.length > 0) {
    await insertGlossaryActivities(
      supabase,
      linkedProjectIds.map((projectId) => ({
        projectId,
        title: "Glossary updated",
        detail: `Deleted glossary term "${(termData as { source_term: string }).source_term}".`
      }))
    );
  }
}

export async function importGlossaryCsv(csv: string): Promise<ImportGlossaryCsvResult> {
  const rows = parseGlossaryCsv(csv);
  const { supabase, workspace } = await getWorkspaceContext();
  const glossaryContext = await getGlossaryWriteContext(supabase, workspace.id);
  const createdCollectionIds = new Set<string>();
  const linkedProjectPairs = new Set<string>();
  const projectImportCounts = new Map<string, number>();
  const importedTerms: ImportGlossaryCsvResult["importedTerms"] = [];

  for (const row of rows) {
    const collectionResult = row.collectionName
      ? await ensureGlossaryCollection(supabase, workspace.id, row.collectionName, glossaryContext)
      : null;
    const collectionId = collectionResult?.id ?? null;

    if (collectionId && !glossaryContext.collectionsById.has(collectionId)) {
      throw new Error("Glossary collection could not be resolved after creation.");
    }

    if (collectionResult?.created) {
      createdCollectionIds.add(collectionResult.id);
    }

    const project = resolveGlossaryProject(row.projectRef, glossaryContext.projectsByReference);
    const termKey = getGlossaryTermKey(row.sourceLanguage, row.source);
    const existingTerm = glossaryContext.termsByKey.get(termKey);
    const now = new Date().toISOString();
    let termId = existingTerm?.id;

    if (termId) {
      const { error: updateError } = await supabase
        .from("glossary_terms")
        .update({
          collection_id: collectionId,
          source_term: row.source.trim(),
          source_language: row.sourceLanguage.trim().toLowerCase(),
          status: mapGlossaryStatusToDatabase(row.status),
          is_protected: row.isProtected,
          updated_at: now
        })
        .eq("id", termId);

      if (updateError) {
        throw new Error(`Failed to update glossary term "${row.source}": ${updateError.message}`);
      }
    } else {
      const { data: termData, error: createError } = await supabase
        .from("glossary_terms")
        .insert({
          workspace_id: workspace.id,
          collection_id: collectionId,
          source_term: row.source.trim(),
          source_language: row.sourceLanguage.trim().toLowerCase(),
          status: mapGlossaryStatusToDatabase(row.status),
          is_protected: row.isProtected,
          updated_at: now
        })
        .select("id")
        .single();

      if (createError) {
        throw new Error(`Failed to import glossary term "${row.source}": ${createError.message}`);
      }

      termId = (termData as { id: string }).id;
      glossaryContext.termsByKey.set(termKey, {
        id: termId,
        source_term: row.source.trim(),
        source_language: row.sourceLanguage.trim().toLowerCase()
      });
    }

    if (row.translations.length > 0) {
      const { error: translationError } = await supabase.from("glossary_term_translations").upsert(
        row.translations.map((translation) => ({
          term_id: termId,
          locale_code: translation.locale,
          translated_term: translation.term
        })),
        {
          onConflict: "term_id,locale_code"
        }
      );

      if (translationError) {
        throw new Error(`Failed to import translations for "${row.source}": ${translationError.message}`);
      }
    }

    if (project) {
      const { error: projectLinkError } = await supabase.from("project_glossary_terms").upsert(
        {
          project_id: project.id,
          term_id: termId
        },
        {
          onConflict: "project_id,term_id"
        }
      );

      if (projectLinkError) {
        throw new Error(`Failed to link imported term "${row.source}" to project: ${projectLinkError.message}`);
      }

      linkedProjectPairs.add(`${project.id}::${termId}`);
      projectImportCounts.set(project.id, (projectImportCounts.get(project.id) ?? 0) + 1);
    }

    importedTerms.push({
      source: row.source.trim(),
      sourceLanguage: row.sourceLanguage.trim().toLowerCase()
    });
  }

  if (projectImportCounts.size > 0) {
    await insertGlossaryActivities(
      supabase,
      Array.from(projectImportCounts.entries()).map(([projectId, count]) => ({
        projectId,
        title: "Glossary updated",
        detail:
          count === 1
            ? "Imported 1 glossary term from CSV."
            : `Imported ${count} glossary terms from CSV.`
      }))
    );
  }

  return {
    importedCount: importedTerms.length,
    collectionCount: createdCollectionIds.size,
    projectLinkCount: linkedProjectPairs.size,
    importedTerms
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
  const user = await getAuthenticatedUser();
  const normalizedEmail = normalizeMemberEmail(user?.email);

  if (!user || !normalizedEmail) {
    throw new Error("Authentication required.");
  }

  const supabase = createServerSupabaseClient();
  let member = await selectWorkspaceMemberForUser(supabase, normalizedEmail);

  if (!member) {
    member = await bootstrapWorkspaceForUser(supabase, user, normalizedEmail);
  }

  if (!member) {
    throw new Error("No workspace access was found for this account.");
  }

  if (member.status === "disabled") {
    throw new Error("Workspace access is disabled for this account.");
  }

  if (member.status === "invited") {
    member = await activateWorkspaceMember(supabase, member, user);
  }

  const workspace = await selectWorkspaceById(supabase, member.workspace_id);

  if (!workspace) {
    throw new Error("Assigned workspace could not be loaded.");
  }

  const settings = await ensureWorkspaceSettings(supabase, workspace.id);

  return {
    supabase,
    user,
    member,
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
    .select("workspace_id, default_source_language, default_target_language, translation_provider, translation_model, translation_batch_size, placeholder_validation_mode, inline_tag_validation_mode, block_export_on_validation_failure, email_notifications, review_reminders, auto_export_after_completion, glossary_prompt_injection, metadata")
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

async function selectWorkspaceById(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string
) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, slug, name, plan_name, avatar_label, credits_limit, credits_used, quality_score_avg, created_at, updated_at")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load assigned workspace: ${error.message}`);
  }

  return data as WorkspaceRow | null;
}

async function selectWorkspaceMemberForUser(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  email: string
) {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, email, display_name, role, status, metadata, created_at, updated_at")
    .eq("email", email)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load workspace access: ${error.message}`);
  }

  const members = (data as WorkspaceMemberRow[] | null) ?? [];
  const activeMember = members.find((member) => member.status === "active");

  if (activeMember) {
    return activeMember;
  }

  return members.find((member) => member.status === "invited") ?? null;
}

async function bootstrapWorkspaceForUser(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  user: User,
  normalizedEmail: string
) {
  const requestedWorkspaceName = getRequestedWorkspaceName(user);

  if (!requestedWorkspaceName) {
    return null;
  }

  const workspaceSlug = await buildUniqueWorkspaceSlug(supabase, requestedWorkspaceName);
  const avatarLabel = buildAvatarLabel(requestedWorkspaceName);
  const { data: insertedWorkspace, error: insertWorkspaceError } = await supabase
    .from("workspaces")
    .insert({
      slug: workspaceSlug,
      name: requestedWorkspaceName,
      plan_name: DEFAULT_WORKSPACE_PLAN,
      avatar_label: avatarLabel || DEFAULT_WORKSPACE_AVATAR_LABEL,
      credits_limit: DEFAULT_CREDITS_LIMIT,
      credits_used: 0
    })
    .select("id, slug, name, plan_name, avatar_label, credits_limit, credits_used, quality_score_avg, created_at, updated_at")
    .single();

  if (insertWorkspaceError) {
    throw new Error(`Failed to bootstrap workspace: ${insertWorkspaceError.message}`);
  }

  const workspace = insertedWorkspace as WorkspaceRow;
  const displayName = getUserDisplayName(user) ?? requestedWorkspaceName;
  const { data: insertedMember, error: insertMemberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      email: normalizedEmail,
      display_name: displayName,
      role: "owner",
      status: "active",
      metadata: {
        auth_user_id: user.id,
        source: "signup"
      }
    })
    .select("id, workspace_id, email, display_name, role, status, metadata, created_at, updated_at")
    .single();

  if (insertMemberError) {
    throw new Error(`Failed to create the initial workspace access: ${insertMemberError.message}`);
  }

  return insertedMember as WorkspaceMemberRow;
}

async function activateWorkspaceMember(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  member: WorkspaceMemberRow,
  user: User
) {
  const currentMetadata =
    member.metadata && typeof member.metadata === "object" ? member.metadata : {};
  const { data, error } = await supabase
    .from("workspace_members")
    .update({
      status: "active",
      display_name: member.display_name ?? getUserDisplayName(user),
      metadata: {
        ...currentMetadata,
        auth_user_id: user.id,
        accepted_at: new Date().toISOString()
      }
    })
    .eq("id", member.id)
    .select("id, workspace_id, email, display_name, role, status, metadata, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(`Failed to activate workspace access: ${error.message}`);
  }

  return data as WorkspaceMemberRow;
}

async function buildUniqueWorkspaceSlug(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceName: string
) {
  const baseSlug = slugify(workspaceName || DEFAULT_WORKSPACE_SLUG);
  const { data, error } = await supabase
    .from("workspaces")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(`Failed to validate workspace slug: ${error.message}`);
  }

  const existingSlugs = new Set((((data as { slug: string }[] | null) ?? [])).map((row) => row.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function selectWorkspaceSettings(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string
) {
  return supabase
    .from("workspace_settings")
    .select("workspace_id, default_source_language, default_target_language, translation_provider, translation_model, translation_batch_size, placeholder_validation_mode, inline_tag_validation_mode, block_export_on_validation_failure, email_notifications, review_reminders, auto_export_after_completion, glossary_prompt_injection, metadata")
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

  if (/\.xml$/i.test(fileName)) {
    return "xml";
  }

  if (/\.csv$/i.test(fileName)) {
    return "csv";
  }

  if (/\.docx$/i.test(fileName)) {
    return "docx";
  }

  if (/\.pptx$/i.test(fileName)) {
    return "pptx";
  }

  if (/\.txt$/i.test(fileName)) {
    return "txt";
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

async function resolveProjectFileWordCount(file: ProjectFileSyncInput) {
  if (!file.content) {
    return file.words;
  }

  return estimateTranslationFileWordCount(file.name, file.content);
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

function mapGlossaryStatusToDatabase(status: GlossaryStatus): GlossaryTermRow["status"] {
  switch (status) {
    case "Approved":
      return "approved";
    case "Review":
      return "review";
    case "Archived":
      return "archived";
    case "Draft":
    default:
      return "draft";
  }
}

function mapUsageTrendPoint(
  row: DailyUsageRow,
  locale: AppLocale = DEFAULT_APP_LOCALE
): UsageTrendPoint {
  return {
    label: formatShortDate(new Date(`${row.usage_date}T00:00:00.000Z`), locale),
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

async function recordWorkspaceUsageDelta(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspace: Pick<WorkspaceRow, "id" | "credits_used">,
  delta: {
    occurredAt: Date;
    creditsUsed: number;
    apiRequests?: number;
    uploadCount?: number;
    exportCount?: number;
    reviewSessions?: number;
  }
) {
  const creditsUsed = Math.max(0, Math.round(delta.creditsUsed));
  const apiRequests = Math.max(0, Math.round(delta.apiRequests ?? 0));
  const uploadCount = Math.max(0, Math.round(delta.uploadCount ?? 0));
  const exportCount = Math.max(0, Math.round(delta.exportCount ?? 0));
  const reviewSessions = Math.max(0, Math.round(delta.reviewSessions ?? 0));

  if (creditsUsed === 0 && apiRequests === 0 && uploadCount === 0 && exportCount === 0 && reviewSessions === 0) {
    return;
  }

  const usageDate = formatDateKey(delta.occurredAt);
  const [{ data: activeCycleData, error: activeCycleError }, { data: dailyUsageData, error: dailyUsageError }, { data: projectRows, error: projectRowsError }] =
    await Promise.all([
      supabase
        .from("workspace_billing_cycles")
        .select("id, credits_used")
        .eq("workspace_id", workspace.id)
        .eq("status", "active")
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workspace_daily_usage")
        .select("usage_date, credits_used, api_requests, upload_count, export_count, review_sessions, active_projects")
        .eq("workspace_id", workspace.id)
        .eq("usage_date", usageDate)
        .maybeSingle(),
      supabase
        .from("projects")
        .select("status")
        .eq("workspace_id", workspace.id)
    ]);

  if (activeCycleError) {
    throw new Error(`Failed to load active billing cycle: ${activeCycleError.message}`);
  }

  if (dailyUsageError) {
    throw new Error(`Failed to load daily usage row: ${dailyUsageError.message}`);
  }

  if (projectRowsError) {
    throw new Error(`Failed to load projects for usage sync: ${projectRowsError.message}`);
  }

  const activeCycle = activeCycleData as Pick<BillingCycleRow, "id" | "credits_used"> | null;
  const existingDailyRow = dailyUsageData as DailyUsageRow | null;
  const activeProjects = (((projectRows as Array<{ status: ProjectRow["status"] }> | null) ?? [])).filter(
    (project) => project.status !== "completed"
  ).length;

  const { error: usageUpsertError } = await supabase
    .from("workspace_daily_usage")
    .upsert(
      {
        workspace_id: workspace.id,
        billing_cycle_id: activeCycle?.id ?? null,
        usage_date: usageDate,
        credits_used: (existingDailyRow?.credits_used ?? 0) + creditsUsed,
        api_requests: (existingDailyRow?.api_requests ?? 0) + apiRequests,
        upload_count: (existingDailyRow?.upload_count ?? 0) + uploadCount,
        export_count: (existingDailyRow?.export_count ?? 0) + exportCount,
        review_sessions: (existingDailyRow?.review_sessions ?? 0) + reviewSessions,
        active_projects: Math.max(existingDailyRow?.active_projects ?? 0, activeProjects)
      },
      { onConflict: "workspace_id,usage_date" }
    );

  if (usageUpsertError) {
    throw new Error(`Failed to update daily usage: ${usageUpsertError.message}`);
  }

  const nextWorkspaceCreditsUsed = workspace.credits_used + creditsUsed;
  const { error: workspaceUpdateError } = await supabase
    .from("workspaces")
    .update({ credits_used: nextWorkspaceCreditsUsed })
    .eq("id", workspace.id);

  if (workspaceUpdateError) {
    throw new Error(`Failed to update workspace credits: ${workspaceUpdateError.message}`);
  }

  if (activeCycle) {
    const { error: billingUpdateError } = await supabase
      .from("workspace_billing_cycles")
      .update({ credits_used: activeCycle.credits_used + creditsUsed })
      .eq("id", activeCycle.id);

    if (billingUpdateError) {
      throw new Error(`Failed to update billing cycle usage: ${billingUpdateError.message}`);
    }
  }

  await syncWorkspaceUsageBreakdown(supabase, workspace.id);
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

  return getCreditsUsedFromFiles(((filesData as Pick<ProjectFileRow, "word_count" | "status">[] | null) ?? []));
}

function getProjectCreditsUsedFromRows(files: ProjectFileRow[]) {
  return getCreditsUsedFromFiles(files);
}

function getCreditsUsedFromFiles(files: Array<Pick<ProjectFileRow, "word_count" | "status">>) {
  return files.reduce((sum, file) => {
    if (file.status === "queued") {
      return sum;
    }

    return sum + file.word_count;
  }, 0);
}

async function syncWorkspaceUsageBreakdown(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string
) {
  const { data, error } = await supabase
    .from("workspace_daily_usage")
    .select("credits_used, upload_count, export_count, review_sessions")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to load usage rows for breakdown sync: ${error.message}`);
  }

  const rows = (data as Pick<DailyUsageRow, "credits_used" | "upload_count" | "export_count" | "review_sessions">[] | null) ?? [];
  const totals = rows.reduce(
    (sum, row) => ({
      creditsUsed: sum.creditsUsed + row.credits_used,
      uploads: sum.uploads + row.upload_count,
      exports: sum.exports + row.export_count,
      reviews: sum.reviews + row.review_sessions
    }),
    {
      creditsUsed: 0,
      uploads: 0,
      exports: 0,
      reviews: 0
    }
  );
  const maxValue = Math.max(totals.creditsUsed, totals.uploads, totals.exports, totals.reviews, 1);
  const nextRows = [
    {
      workspace_id: workspaceId,
      metric_key: "credits_consumed",
      metric_label: "Credits consumed",
      metric_value: totals.creditsUsed,
      share_percent: Math.round((totals.creditsUsed / maxValue) * 100),
      sort_order: 1
    },
    {
      workspace_id: workspaceId,
      metric_key: "uploads",
      metric_label: "Uploads",
      metric_value: totals.uploads,
      share_percent: Math.round((totals.uploads / maxValue) * 100),
      sort_order: 2
    },
    {
      workspace_id: workspaceId,
      metric_key: "exports_generated",
      metric_label: "Exports generated",
      metric_value: totals.exports,
      share_percent: Math.round((totals.exports / maxValue) * 100),
      sort_order: 3
    },
    {
      workspace_id: workspaceId,
      metric_key: "review_sessions",
      metric_label: "Review sessions",
      metric_value: totals.reviews,
      share_percent: Math.round((totals.reviews / maxValue) * 100),
      sort_order: 4
    }
  ];

  const { error: deleteError } = await supabase
    .from("workspace_usage_breakdown")
    .delete()
    .eq("workspace_id", workspaceId);

  if (deleteError) {
    throw new Error(`Failed to clear usage breakdown: ${deleteError.message}`);
  }

  const { error: insertError } = await supabase
    .from("workspace_usage_breakdown")
    .insert(nextRows);

  if (insertError) {
    throw new Error(`Failed to update usage breakdown: ${insertError.message}`);
  }
}

function countsTowardUsage(status: ProjectFileRow["status"]) {
  return status !== "queued";
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

function mapUsageBreakdownRows(
  rows: UsageBreakdownRow[],
  locale: AppLocale = DEFAULT_APP_LOCALE
): UsageBreakdownItem[] {
  return rows.map((row) => ({
    label: translateUsageBreakdownLabel(row.metric_label, locale),
    value: formatCompactNumber(row.metric_value, locale),
    percent: Math.max(0, Math.min(100, Math.round(row.share_percent ?? 0)))
  }));
}

function buildFallbackUsageBreakdown(
  totalUploads: number,
  totalExports: number,
  totalReviews: number,
  creditsUsed: number,
  locale: AppLocale
): UsageBreakdownItem[] {
  const maxValue = Math.max(totalUploads, totalExports, totalReviews, creditsUsed, 1);

  return [
    {
      label: locale === "de" ? "Verbrauchte Credits" : "Credits consumed",
      value: formatCompactNumber(creditsUsed, locale),
      percent: Math.round((creditsUsed / maxValue) * 100)
    },
    {
      label: locale === "de" ? "Uploads" : "Uploads",
      value: formatCompactNumber(totalUploads, locale),
      percent: Math.round((totalUploads / maxValue) * 100)
    },
    {
      label: locale === "de" ? "Erstellte Exporte" : "Exports generated",
      value: formatCompactNumber(totalExports, locale),
      percent: Math.round((totalExports / maxValue) * 100)
    },
    {
      label: locale === "de" ? "Prüf-Sitzungen" : "Review sessions",
      value: formatCompactNumber(totalReviews, locale),
      percent: Math.round((totalReviews / maxValue) * 100)
    }
  ];
}

function buildEmptyUsageTrend(now: Date, locale: AppLocale): UsageTrendPoint[] {
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (9 - index));

    return {
      label: formatShortDate(date, locale),
      value: 0
    };
  });
}

function buildUsageProjectInsights(
  projects: ProjectRecord[],
  totalUsed: number,
  locale: AppLocale
): UsageProjectInsightItem[] {
  return projects
    .map((project) => {
      const translatedFiles = project.files.filter((file) => file.status !== "Queued");
      const wordsUsed = translatedFiles.reduce((sum, file) => sum + file.words, 0);

      return {
        id: project.id,
        name: project.name,
        languages: project.targetLanguages.map((targetLanguage) => getLanguageLabel(targetLanguage, locale)).join(", "),
        fileCount: translatedFiles.length,
        wordsUsed,
        sharePercent: totalUsed > 0 ? Math.round((wordsUsed / totalUsed) * 100) : 0,
        status: project.status
      };
    })
    .filter((project) => project.wordsUsed > 0)
    .sort((left, right) => right.wordsUsed - left.wordsUsed);
}

function buildUsageLanguageInsights(
  projects: ProjectRecord[],
  totalUsed: number,
  locale: AppLocale
): UsageLanguageInsightItem[] {
  const aggregated = new Map<string, UsageLanguageInsightItem>();

  for (const project of projects) {
    for (const file of project.files) {
      if (file.status === "Queued") {
        continue;
      }

      const existing = aggregated.get(file.targetLanguage) ?? {
        code: file.targetLanguage,
        label: getLanguageLabel(file.targetLanguage, locale),
        fileCount: 0,
        wordsUsed: 0,
        sharePercent: 0
      };

      existing.fileCount += 1;
      existing.wordsUsed += file.words;
      aggregated.set(file.targetLanguage, existing);
    }
  }

  return Array.from(aggregated.values())
    .map((language) => ({
      ...language,
      sharePercent: totalUsed > 0 ? Math.round((language.wordsUsed / totalUsed) * 100) : 0
    }))
    .sort((left, right) => right.wordsUsed - left.wordsUsed);
}

function buildUsageTopFiles(projects: ProjectRecord[], locale: AppLocale): UsageTopFileItem[] {
  return projects
    .flatMap((project) =>
      project.files
        .filter((file) => file.status !== "Queued")
        .map((file) => ({
          id: file.id,
          name: file.name,
          projectName: project.name,
          languagePair: `${getLanguageLabel(file.sourceLanguage, locale)} -> ${getLanguageLabel(file.targetLanguage, locale)}`,
          wordsUsed: file.words,
          status: file.status,
          updatedLabel: formatShortDate(new Date(file.lastUpdated), locale)
        }))
    )
    .sort((left, right) => right.wordsUsed - left.wordsUsed)
    .slice(0, 8);
}

function buildUsageActivityFeed(projects: ProjectRecord[], locale: AppLocale): UsageActivityFeedItem[] {
  return projects
    .flatMap((project) =>
      project.recentActivity.map((activity) => ({
        id: `${project.id}-${activity.id}`,
        kind: classifyUsageActivityKind(activity.title, activity.detail),
        title: activity.title,
        detail: activity.detail,
        projectName: project.name,
        timestampLabel: formatActivityTimestamp(new Date(activity.timestamp), locale),
        timestamp: activity.timestamp
      }))
    )
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 12);
}

function classifyUsageActivityKind(
  title: string,
  detail: string
): UsageActivityFeedItem["kind"] {
  const normalized = `${title} ${detail}`.toLowerCase();

  if (normalized.includes("export") || normalized.includes("handoff") || normalized.includes("bundle")) {
    return "export";
  }

  if (normalized.includes("upload") || normalized.includes("import") || normalized.includes("sync")) {
    return "upload";
  }

  return "translation";
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(date: Date, locale: AppLocale = DEFAULT_APP_LOCALE) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatLongDate(date: Date, locale: AppLocale = DEFAULT_APP_LOCALE) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatActivityTimestamp(date: Date, locale: AppLocale = DEFAULT_APP_LOCALE) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatTimeLabel(date: Date, locale: AppLocale = DEFAULT_APP_LOCALE) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function describeResetDate(resetDate: Date, now: Date, locale: AppLocale = DEFAULT_APP_LOCALE) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const normalizedNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const normalizedReset = Date.UTC(resetDate.getUTCFullYear(), resetDate.getUTCMonth(), resetDate.getUTCDate());
  const dayDiff = Math.max(0, Math.ceil((normalizedReset - normalizedNow) / millisecondsPerDay));

  if (dayDiff === 0) {
    return locale === "de" ? "Wird heute zurückgesetzt" : "Resets today";
  }

  if (dayDiff === 1) {
    return locale === "de" ? "Reset in 1 Tag" : "Resets in 1 day";
  }

  return locale === "de" ? `Reset in ${dayDiff} Tagen` : `Resets in ${dayDiff} days`;
}

function formatDelta(value: number, locale: AppLocale = DEFAULT_APP_LOCALE) {
  if (value === 0) {
    return locale === "de" ? "Keine Änderung" : "No change";
  }

  const formatted = new Intl.NumberFormat(getIntlLocale(locale)).format(Math.abs(value));

  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

function formatCurrency(value: number, locale: AppLocale = DEFAULT_APP_LOCALE) {
  return new Intl.NumberFormat(getIntlLocale(locale), {
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

async function getGlossaryWriteContext(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string
): Promise<GlossaryWriteContext> {
  const [
    { data: collectionsData, error: collectionsError },
    { data: projectsData, error: projectsError },
    { data: termsData, error: termsError }
  ] = await Promise.all([
    supabase
      .from("glossary_collections")
      .select("id, slug, name")
      .eq("workspace_id", workspaceId),
    supabase
      .from("projects")
      .select("id, slug, name")
      .eq("workspace_id", workspaceId),
    supabase
      .from("glossary_terms")
      .select("id, source_term, source_language")
      .eq("workspace_id", workspaceId)
  ]);

  if (collectionsError) {
    throw new Error(`Failed to load glossary collections for write: ${collectionsError.message}`);
  }

  if (projectsError) {
    throw new Error(`Failed to load glossary projects for write: ${projectsError.message}`);
  }

  if (termsError) {
    throw new Error(`Failed to load glossary terms for write: ${termsError.message}`);
  }

  const collections = (collectionsData as GlossaryCollectionLookupRow[] | null) ?? [];
  const projects = (projectsData as GlossaryProjectRow[] | null) ?? [];
  const terms = (termsData as GlossaryTermLookupRow[] | null) ?? [];
  const projectsByReference = new Map<string, GlossaryProjectRow>();

  for (const project of projects) {
    projectsByReference.set(normalizeLookupKey(project.slug), project);
    projectsByReference.set(normalizeLookupKey(project.name), project);
  }

  return {
    collectionsById: new Map(collections.map((collection) => [collection.id, collection])),
    collectionIdByName: new Map(
      collections.map((collection) => [normalizeLookupKey(collection.name), collection.id])
    ),
    collectionSlugs: new Set(collections.map((collection) => collection.slug)),
    projectsByReference,
    termsByKey: new Map(
      terms.map((term) => [getGlossaryTermKey(term.source_language, term.source_term), term])
    )
  };
}

async function ensureGlossaryCollection(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string,
  name: string,
  glossaryContext: GlossaryWriteContext,
  detail?: string | null
): Promise<{ id: string; created: boolean }> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Glossary collection name cannot be empty.");
  }

  const existingId = glossaryContext.collectionIdByName.get(normalizeLookupKey(trimmedName));

  if (existingId) {
    return { id: existingId, created: false };
  }

  const slug = buildUniqueSlugFromSet(slugify(trimmedName), glossaryContext.collectionSlugs);
  const { data, error } = await supabase
    .from("glossary_collections")
    .insert({
      workspace_id: workspaceId,
      slug,
      name: trimmedName,
      description: detail?.trim() || null
    })
    .select("id, slug, name")
    .single();

  if (error) {
    throw new Error(`Failed to create glossary collection "${trimmedName}": ${error.message}`);
  }

  const collection = data as GlossaryCollectionLookupRow;

  glossaryContext.collectionsById.set(collection.id, collection);
  glossaryContext.collectionIdByName.set(normalizeLookupKey(collection.name), collection.id);
  glossaryContext.collectionSlugs.add(collection.slug);

  return {
    id: collection.id,
    created: true
  };
}

function resolveGlossaryCollectionId(
  collectionId: string | null,
  collectionsById: Map<string, GlossaryCollectionLookupRow>
) {
  if (!collectionId) {
    return null;
  }

  if (!collectionsById.has(collectionId)) {
    throw new Error("Selected glossary collection no longer exists.");
  }

  return collectionId;
}

function resolveGlossaryProject(
  projectRef: string | null,
  projectsByReference: Map<string, GlossaryProjectRow>
) {
  if (!projectRef) {
    return null;
  }

  const project = projectsByReference.get(normalizeLookupKey(projectRef));

  if (!project) {
    throw new Error(`Glossary project "${projectRef}" could not be found.`);
  }

  return project;
}

async function insertGlossaryActivities(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  activities: Array<{ projectId: string; title: string; detail: string }>
) {
  if (activities.length === 0) {
    return;
  }

  const occurredAt = new Date().toISOString();
  const { error } = await supabase.from("project_activities").insert(
    activities.map((activity) => ({
      project_id: activity.projectId,
      kind: "glossary_updated",
      title: activity.title,
      detail: activity.detail,
      occurred_at: occurredAt
    }))
  );

  if (error) {
    console.error(`Glossary activity logging failed: ${error.message}`);
  }
}

function buildUniqueSlugFromSet(baseSlug: string, existingSlugs: Set<string>) {
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function getGlossaryTermKey(sourceLanguage: string, source: string) {
  return `${sourceLanguage.trim().toLowerCase()}::${source.trim().toLowerCase()}`;
}

function normalizeLookupKey(value: string) {
  return value.trim().toLowerCase();
}

function formatLocaleSummary(locales: string[]) {
  if (locales.length <= 4) {
    return locales.join(", ");
  }

  return `${locales.slice(0, 4).join(", ")} +${locales.length - 4}`;
}

export async function getExactGlossaryTranslations(
  sourceLanguage: string,
  targetLanguage: string,
  sourceTexts: string[]
): Promise<Map<string, string>> {
  noStore();

  if (sourceTexts.length === 0) {
    return new Map();
  }

  const { supabase, workspace } = await getWorkspaceContext();
  const normalizedSourceLanguage = sourceLanguage.trim().toLowerCase();
  const normalizedTargetLanguage = targetLanguage.trim().toLowerCase();
  const normalizedSourceTexts = Array.from(
    new Set(
      sourceTexts
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );

  if (normalizedSourceTexts.length === 0) {
    return new Map();
  }

  const { data: glossaryRows, error } = await supabase
    .from("glossary_terms")
    .select("source_term, status, glossary_term_translations(locale_code, translated_term)")
    .eq("workspace_id", workspace.id)
    .eq("source_language", normalizedSourceLanguage)
    .in("source_term", normalizedSourceTexts)
    .in("status", ["approved", "review"]);

  if (error) {
    throw new Error(`Failed to load glossary translations: ${error.message}`);
  }

  const result = new Map<string, string>();

  for (const row of (glossaryRows as Array<{
    source_term: string;
    status: string;
    glossary_term_translations: Array<{ locale_code: string; translated_term: string }> | null;
  }> | null) ?? []) {
    const exactMatch = row.glossary_term_translations?.find(
      (translation) => translation.locale_code.toLowerCase() === normalizedTargetLanguage
    );

    if (exactMatch?.translated_term?.trim()) {
      result.set(row.source_term.trim(), exactMatch.translated_term.trim());
    }
  }

  return result;
}

function parseWorkspaceSettingsMetadata(value: Record<string, unknown> | null | undefined): WorkspaceSettingsMetadata {
  const metadata = value && typeof value === "object" ? value : {};

  return {
    profileName: typeof metadata.profileName === "string" ? metadata.profileName : undefined,
    profileEmail: typeof metadata.profileEmail === "string" ? metadata.profileEmail : undefined,
    company: typeof metadata.company === "string" ? metadata.company : undefined,
    billingAddress: typeof metadata.billingAddress === "string" ? metadata.billingAddress : undefined,
    preferredLocale: normalizeAppLocale(typeof metadata.preferredLocale === "string" ? metadata.preferredLocale : undefined),
    preferredSourceLanguage:
      typeof metadata.preferredSourceLanguage === "string" &&
      SUPPORTED_LANGUAGE_CODES.has(metadata.preferredSourceLanguage)
        ? metadata.preferredSourceLanguage
        : undefined,
    toneStyle: isToneStyle(metadata.toneStyle) ? metadata.toneStyle : undefined,
    strictGlossaryMode:
      typeof metadata.strictGlossaryMode === "boolean" ? metadata.strictGlossaryMode : undefined,
    aiBehavior: isAiBehavior(metadata.aiBehavior) ? metadata.aiBehavior : undefined,
    defaultFilenameFormat: isFilenameFormat(metadata.defaultFilenameFormat)
      ? metadata.defaultFilenameFormat
      : undefined,
    invoiceCreatedEmail:
      typeof metadata.invoiceCreatedEmail === "boolean" ? metadata.invoiceCreatedEmail : undefined,
    paymentFailedEmail:
      typeof metadata.paymentFailedEmail === "boolean" ? metadata.paymentFailedEmail : undefined,
    spendingLimitEmail:
      typeof metadata.spendingLimitEmail === "boolean" ? metadata.spendingLimitEmail : undefined,
    inAppNotifications:
      typeof metadata.inAppNotifications === "boolean" ? metadata.inAppNotifications : undefined,
    stripeCustomerId:
      typeof metadata.stripeCustomerId === "string" ? metadata.stripeCustomerId : undefined,
    stripeSubscriptionId:
      typeof metadata.stripeSubscriptionId === "string" ? metadata.stripeSubscriptionId : undefined,
    stripeSubscriptionStatus:
      typeof metadata.stripeSubscriptionStatus === "string"
        ? metadata.stripeSubscriptionStatus
        : undefined,
    stripePriceId: typeof metadata.stripePriceId === "string" ? metadata.stripePriceId : undefined,
    stripeCurrentPeriodEnd:
      typeof metadata.stripeCurrentPeriodEnd === "string"
        ? metadata.stripeCurrentPeriodEnd
        : undefined
  };
}

function validateLanguageCode(value: string, label: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (!SUPPORTED_LANGUAGE_CODES.has(normalizedValue)) {
    throw new Error(`Select a supported ${label}.`);
  }

  return normalizedValue;
}

function normalizeToneStyle(value: string): SettingsToneStyle {
  if (isToneStyle(value)) {
    return value;
  }

  throw new Error("Select a supported tone setting.");
}

function normalizeAiBehavior(value: string): SettingsQualityPreset {
  if (isAiBehavior(value)) {
    return value;
  }

  throw new Error("Select a supported AI behavior.");
}

function normalizeFilenameFormat(value: string): SettingsFilenameFormat {
  if (isFilenameFormat(value)) {
    return value;
  }

  throw new Error("Select a supported filename format.");
}

function getAiBehaviorFromSettings(settings: Pick<WorkspaceSettingsRow, "translation_batch_size">): SettingsQualityPreset {
  if (settings.translation_batch_size >= 35) {
    return "Fast";
  }

  if (settings.translation_batch_size <= 12) {
    return "High Quality";
  }

  return "Balanced";
}

function getBatchSizeForAiBehavior(aiBehavior: SettingsQualityPreset) {
  if (aiBehavior === "Fast") {
    return 40;
  }

  if (aiBehavior === "High Quality") {
    return 10;
  }

  return 25;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isToneStyle(value: unknown): value is SettingsToneStyle {
  return value === "Neutral" || value === "Formal" || value === "Informal" || value === "Marketing" || value === "Technical";
}

function isAiBehavior(value: unknown): value is SettingsQualityPreset {
  return value === "Fast" || value === "Balanced" || value === "High Quality";
}

function isFilenameFormat(value: unknown): value is SettingsFilenameFormat {
  return value === "Original + target locale" || value === "Original + source + target" || value === "Project slug + locale";
}

function buildAvatarLabel(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || DEFAULT_WORKSPACE_AVATAR_LABEL;
}

function normalizeMemberEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function getRequestedWorkspaceName(user: User) {
  const metadata = user.user_metadata && typeof user.user_metadata === "object" ? user.user_metadata : {};
  const value =
    typeof metadata.workspace_name === "string" && metadata.workspace_name.trim()
      ? metadata.workspace_name.trim()
      : "";

  return value || null;
}

function getUserDisplayName(user: User) {
  const metadata = user.user_metadata && typeof user.user_metadata === "object" ? user.user_metadata : {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : typeof metadata.name === "string" && metadata.name.trim()
        ? metadata.name.trim()
        : "";

  return fullName || null;
}

function mapWorkspaceMemberListItem(member: WorkspaceMemberRow): WorkspaceMemberListItem {
  return {
    id: member.id,
    email: member.email,
    displayName: member.display_name,
    role: member.role,
    status: member.status
  };
}

function canManageWorkspaceMembers(role: WorkspaceMemberRole) {
  return role === "owner" || role === "admin";
}

function isWorkspaceMemberRole(value: string): value is WorkspaceMemberRole {
  return value === "owner" || value === "admin" || value === "editor" || value === "reviewer" || value === "viewer";
}

async function rollbackWorkspaceInvitation(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  workspaceId: string,
  email: string,
  previousMemberSnapshot: WorkspaceMemberRow | null
) {
  if (previousMemberSnapshot) {
    await supabase
      .from("workspace_members")
      .update({
        display_name: previousMemberSnapshot.display_name,
        role: previousMemberSnapshot.role,
        status: previousMemberSnapshot.status,
        metadata: previousMemberSnapshot.metadata
      })
      .eq("id", previousMemberSnapshot.id);

    return;
  }

  await supabase.from("workspace_members").delete().eq("workspace_id", workspaceId).eq("email", email);
}

function buildFallbackBillingCycle(
  now: Date,
  plan: BillingPlanDefinition,
  creditsUsed: number
): BillingCycleRow {
  return {
    id: "fallback-cycle",
    period_start: formatDateKey(startOfCurrentMonth(now)),
    period_end: formatDateKey(endOfCurrentMonth(now)),
    credits_limit: plan.creditsLimit,
    credits_used: creditsUsed,
    projected_spend_cents: plan.basePriceCents,
    status: "active"
  };
}

function mapBillingInvoiceItem(
  cycle: BillingCycleRow,
  currentPlan: BillingPlanDefinition,
  locale: AppLocale
): BillingInvoiceItem {
  const periodStart = new Date(`${cycle.period_start}T00:00:00.000Z`);
  const periodEnd = new Date(`${cycle.period_end}T00:00:00.000Z`);
  const amountCents = Math.max(cycle.projected_spend_cents, currentPlan.basePriceCents);

  return {
    id: cycle.id,
    periodLabel: `${formatShortDate(periodStart, locale)} - ${formatShortDate(periodEnd, locale)}`,
    issuedOnLabel: formatLongDate(periodEnd, locale),
    amountLabel: formatCurrency(amountCents / 100, locale),
    statusLabel:
      cycle.status === "active"
        ? locale === "de"
          ? "Offen"
          : "Open"
        : cycle.status === "closed"
          ? locale === "de"
            ? "Bezahlt"
            : "Paid"
          : locale === "de"
            ? "Prognose"
            : "Projected",
    creditsLabel: `${formatCompactNumber(cycle.credits_used, locale)} / ${formatCompactNumber(cycle.credits_limit, locale)}`
  };
}

function formatStripeStatusLabel(status: string, locale: AppLocale) {
  const label = status
    .split("_")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

  if (locale !== "de") {
    return label;
  }

  switch (status) {
    case "active":
      return "Aktiv";
    case "trialing":
      return "Testphase";
    case "past_due":
      return "Überfällig";
    case "canceled":
      return "Gekündigt";
    case "unpaid":
      return "Unbezahlt";
    case "incomplete":
      return "Unvollständig";
    default:
      return label;
  }
}

function formatUpdatedLabel(date: Date, locale: AppLocale) {
  return locale === "de" ? `Aktualisiert ${formatTimeLabel(date, locale)}` : `Updated ${formatTimeLabel(date, locale)}`;
}

function getLocalizedPlanDescription(plan: BillingPlanDefinition, locale: AppLocale) {
  if (locale !== "de") {
    return plan.description;
  }

  switch (plan.id) {
    case "free":
      return "Zum Ausprobieren des Produkts, für kleinere Dateipakete und geringes Lokalisierungsvolumen.";
    case "starter":
      return "Für kleinere Lokalisierungs-Workloads und leichte wöchentliche Release-Zyklen.";
    case "pro":
      return "Für Produktteams, die kontinuierlich in mehreren Sprachen ausliefern.";
    case "scale":
      return "Für größere Teams, die Launches, QA und Exporte in höherem Volumen koordinieren.";
    default:
      return plan.description;
  }
}

function getLocalizedPlanFeatures(plan: BillingPlanDefinition, locale: AppLocale) {
  if (locale !== "de") {
    return plan.features;
  }

  switch (plan.id) {
    case "free":
      return ["1k Wörter pro Monat", "XLIFF-Kernübersetzung", "Glossar-Basisfunktionen"];
    case "starter":
      return ["25k Wörter pro Monat", "Projekt-Workspaces", "Glossar-Unterstützung"];
    case "pro":
      return ["150k Wörter pro Monat", "Review-Workflow", "Priorisierte Glossar-Injektion"];
    case "scale":
      return ["400k Wörter pro Monat", "Höherer Durchsatz", "Geteilte Team-Abläufe"];
    default:
      return plan.features;
  }
}

function translateUsageBreakdownLabel(label: string, locale: AppLocale) {
  if (locale !== "de") {
    return label;
  }

  switch (label.trim().toLowerCase()) {
    case "credits consumed":
      return "Verbrauchte Credits";
    case "uploads":
      return "Uploads";
    case "exports generated":
      return "Erstellte Exporte";
    case "review sessions":
      return "Prüf-Sitzungen";
    default:
      return label;
  }
}

function safeParseDate(value: string) {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
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
