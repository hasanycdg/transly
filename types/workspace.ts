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

export type SettingsSectionId = "profile" | "translation" | "preferences" | "danger";

export type SettingsToneStyle = "Neutral" | "Formal" | "Informal" | "Marketing" | "Technical";

export type SettingsQualityPreset = "Fast" | "Balanced" | "High Quality";

export type SettingsFilenameFormat =
  | "Original + target locale"
  | "Original + source + target"
  | "Project slug + locale";

export interface SettingsProfileData {
  name: string;
  email: string;
}

export interface SettingsTranslationData {
  sourceLanguageMode: "auto" | "manual";
  sourceLanguage: string;
  targetLanguage: string;
  toneStyle: SettingsToneStyle;
  strictTagProtection: boolean;
  failOnTagMismatch: boolean;
  useGlossaryAutomatically: boolean;
  strictGlossaryMode: boolean;
  aiBehavior: SettingsQualityPreset;
}

export interface SettingsPreferencesData {
  autoDownloadAfterTranslation: boolean;
  defaultFilenameFormat: SettingsFilenameFormat;
}

export interface SettingsDangerZoneData {
  title: string;
  description: string;
  actionLabel: string;
}

export interface SettingsScreenData {
  profile: SettingsProfileData;
  translation: SettingsTranslationData;
  preferences: SettingsPreferencesData;
  dangerZone: SettingsDangerZoneData;
}

export interface ProjectsOverviewData {
  projects: ProjectRecord[];
}
