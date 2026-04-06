export type TranslationOptions = {
  translateSlugs?: boolean;
  translateUrls?: boolean;
};

export type TranslationStats = {
  totalStringFields: number;
  translatedStringFields: number;
  skippedStringFields: number;
  failedStringFields: number;
};

export type StructuredTranslationResult = {
  translatedPayload: unknown;
  warnings: string[];
  stats: TranslationStats;
};

export type TranslationJobResponse = {
  jobId: string;
  status: "queued" | "processing" | "completed" | "completed_with_warnings" | "failed";
  sourceLanguage: string;
  targetLanguage: string;
  translatedPayload: unknown;
  warnings: string[];
  processingMetadata: Record<string, unknown>;
};
