import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { formatCompactNumber, getLanguageLabel } from "@/lib/projects/formatters";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type {
  NewProjectInput,
  ProjectActivityRecord,
  ProjectExportRecord,
  ProjectFileRecord,
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
  source_language: string;
  target_language: string;
  status: "queued" | "processing" | "review" | "done" | "error";
  progress_percent: number;
  word_count: number;
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
        .order("usage_date", { ascending: false })
        .limit(10),
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

  const creditsLimit = billingCycle?.credits_limit ?? workspace.credits_limit ?? DEFAULT_CREDITS_LIMIT;
  const creditsUsed = billingCycle?.credits_used ?? workspace.credits_used ?? 0;
  const cycleConsumedPercent = creditsLimit > 0 ? Math.round((creditsUsed / creditsLimit) * 100) : 0;
  const totalApiRequests = usageRows.reduce((sum, row) => sum + row.api_requests, 0);
  const totalUploads = usageRows.reduce((sum, row) => sum + row.upload_count, 0);
  const totalExports = usageRows.reduce((sum, row) => sum + row.export_count, 0);
  const totalReviews = usageRows.reduce((sum, row) => sum + row.review_sessions, 0);
  const today = formatDateKey(now);
  const todayRow = usageRows.find((row) => row.usage_date === today);
  const yesterdayRow = usageRows.find((row) => row.usage_date !== today) ?? null;
  const activeProjects = projects.filter((project) => project.status !== "Completed").length;
  const reviewProjects = projects.filter((project) => project.status === "In Review").length;
  const trend = usageRows.length > 0 ? usageRows.map(mapUsageTrendPoint) : buildEmptyUsageTrend(now);
  const breakdown = breakdownRows.length > 0 ? mapUsageBreakdownRows(breakdownRows) : buildFallbackUsageBreakdown(totalUploads, totalExports, totalReviews, creditsUsed);
  const projectedSpend = billingCycle ? billingCycle.projected_spend_cents : 0;
  const updatedLabel = usageRows.length > 0
    ? `Updated ${formatTimeLabel(new Date(`${usageRows.at(-1)?.usage_date}T18:00:00.000Z`))}`
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
      .select("id, project_id, name, source_language, target_language, status, progress_percent, word_count, updated_at")
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
