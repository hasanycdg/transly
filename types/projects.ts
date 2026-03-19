export type ProjectStatus = "Active" | "In Review" | "Completed" | "Error";

export type FileStatus = "Queued" | "Processing" | "Review" | "Done" | "Error";

export type ProjectOrigin = "seed" | "custom";

export type ProjectFilter = "All" | "Active" | "Review" | "Done";

export interface ProjectFileRecord {
  id: string;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: FileStatus;
  progress: number;
  lastUpdated: string;
  words: number;
}

export interface ProjectActivityRecord {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
}

export interface ProjectExportRecord {
  label: string;
  timestamp: string;
  format: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguages: string[];
  status: ProjectStatus;
  lastUpdated: string;
  files: ProjectFileRecord[];
  glossaryEnabled: boolean;
  creditsUsed: number;
  qualityScore: number;
  latestExport?: ProjectExportRecord;
  recentActivity: ProjectActivityRecord[];
  origin: ProjectOrigin;
}

export interface ProjectSummary {
  totalFiles: number;
  completedFiles: number;
  reviewFiles: number;
  failedFiles: number;
  totalWords: number;
  overallProgress: number;
}

export interface NewProjectInput {
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguages: string[];
}
