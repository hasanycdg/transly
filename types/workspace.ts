import type { ProjectRecord } from "@/types/projects";

export interface DashboardProjectLink {
  id: string;
  name: string;
}

export interface DashboardShellData {
  workspaceName: string;
  workspacePlanName: string;
  workspaceAvatarLabel: string;
  projects: DashboardProjectLink[];
}

export interface UsageMetricItem {
  value: string;
  label: string;
  meta: string;
  tone?: "default" | "positive";
}

export interface UsageTrendPoint {
  label: string;
  value: number;
}

export interface UsageSnapshotItem {
  label: string;
  value: string;
  detail: string;
}

export interface UsageBreakdownItem {
  label: string;
  value: string;
  percent: number;
}

export interface UsageScreenData {
  metrics: UsageMetricItem[];
  trend: UsageTrendPoint[];
  snapshots: UsageSnapshotItem[];
  breakdown: UsageBreakdownItem[];
  updatedLabel: string;
  planValue: string;
  planMeta: string;
  planPercent: number;
}

export interface GlossaryMetricItem {
  label: string;
  value: string;
  meta: string;
}

export interface GlossaryTermItem {
  source: string;
  translations: string;
  status: string;
  project: string;
}

export interface GlossaryCollectionItem {
  name: string;
  count: string;
  detail: string;
}

export interface GlossaryScreenData {
  metrics: GlossaryMetricItem[];
  terms: GlossaryTermItem[];
  collections: GlossaryCollectionItem[];
}

export interface SettingsValueItem {
  label: string;
  value: string;
}

export interface SettingsGroupData {
  title: string;
  items: SettingsValueItem[];
}

export interface SettingsPreferenceItem {
  label: string;
  enabled: boolean;
}

export interface SettingsScreenData {
  groups: SettingsGroupData[];
  preferences: SettingsPreferenceItem[];
  apiSettings: SettingsValueItem[];
  securityNotes: string[];
  workspacePlan: string;
  workspacePlanMeta: string;
  teamSummary: string;
}

export interface ProjectsOverviewData {
  projects: ProjectRecord[];
}
