export type UsageEvent = {
  jobId: string;
  siteUrl: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
  sourceCharacterCount: number;
  translatedCharacterCount: number;
  processedAt: string;
};

export class UsageMeteringService {
  async record(event: UsageEvent): Promise<void> {
    // TODO: Persist usage for billing/quotas and expose workspace usage analytics.
    void event;
  }
}
