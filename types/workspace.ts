import type { FileStatus, ProjectRecord, ProjectStatus } from "@/types/projects";

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

export interface UsageSummaryOverview {
  wordsUsed: number;
  totalWords: number;
  creditsUsed: number;
  remainingUsage: number;
  percentConsumed: number;
  cycleLabel: string;
  resetDateLabel: string;
  resetRelativeLabel: string;
}

export interface UsageProjectInsightItem {
  id: string;
  name: string;
  languages: string;
  fileCount: number;
  wordsUsed: number;
  sharePercent: number;
  status: ProjectStatus;
}

export interface UsageLanguageInsightItem {
  code: string;
  label: string;
  fileCount: number;
  wordsUsed: number;
  sharePercent: number;
}

export interface UsageTopFileItem {
  id: string;
  name: string;
  projectName: string;
  languagePair: string;
  wordsUsed: number;
  status: FileStatus;
  updatedLabel: string;
}

export type UsageActivityKind = "upload" | "translation" | "export";

export interface UsageActivityFeedItem {
  id: string;
  kind: UsageActivityKind;
  title: string;
  detail: string;
  projectName: string;
  timestampLabel: string;
  timestamp: string;
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
  summary: UsageSummaryOverview;
  metrics: UsageMetricItem[];
  trend: UsageTrendPoint[];
  snapshots: UsageSnapshotItem[];
  breakdown: UsageBreakdownItem[];
  projectUsage: UsageProjectInsightItem[];
  languageUsage: UsageLanguageInsightItem[];
  topFiles: UsageTopFileItem[];
  activity: UsageActivityFeedItem[];
  updatedLabel: string;
  planValue: string;
  planMeta: string;
  planPercent: number;
}

export interface BillingPlanOption {
  id: string;
  name: string;
  price: string;
  priceMeta: string;
  credits: string;
  description: string;
  features: string[];
  current: boolean;
}

export interface BillingInvoiceItem {
  id: string;
  periodLabel: string;
  issuedOnLabel: string;
  amountLabel: string;
  statusLabel: string;
  creditsLabel: string;
}

export interface BillingScreenData {
  metrics: UsageMetricItem[];
  currentPlanName: string;
  planDescription: string;
  cycleLabel: string;
  renewalLabel: string;
  usageValue: string;
  usageMeta: string;
  usagePercent: number;
  projectedSpendValue: string;
  creditsRemainingValue: string;
  billingEmail: string;
  paymentMethodLabel: string;
  paymentMethodMeta: string;
  paymentNotice: string;
  manageBillingAvailable: boolean;
  plans: BillingPlanOption[];
  invoices: BillingInvoiceItem[];
}

export type SettingsSectionId = "profile" | "translation" | "preferences" | "support" | "danger";

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
