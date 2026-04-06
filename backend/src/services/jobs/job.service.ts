import type { TranslateRequestDto } from "../../schemas/translation.schemas";
import { TranslationJobRepository } from "../../repositories/translation-job.repository";
import { JOB_STATUSES, type JobStatus } from "../../types/job-status";

type CompleteJobInput = {
  jobId: string;
  translatedPayload: unknown;
  warnings: string[];
  provider: string;
  durationMs: number;
};

type FailJobInput = {
  jobId: string;
  errorMessage: string;
  errorCode?: string;
  details?: unknown;
  durationMs?: number;
};

export class JobService {
  constructor(private readonly repository: TranslationJobRepository) {}

  async createJob(payload: TranslateRequestDto, status: JobStatus) {
    return this.repository.create({
      siteUrl: payload.siteUrl,
      postId: payload.postId,
      postType: payload.postType,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      requestPayload: payload,
      status
    });
  }

  async markProcessing(jobId: string) {
    return this.repository.markProcessing(jobId);
  }

  async completeJob(input: CompleteJobInput) {
    const status = input.warnings.length > 0 ? JOB_STATUSES.completedWithWarnings : JOB_STATUSES.completed;

    return this.repository.markCompleted({
      jobId: input.jobId,
      status,
      responsePayload: input.translatedPayload,
      warnings: input.warnings,
      provider: input.provider,
      durationMs: input.durationMs
    });
  }

  async failJob(input: FailJobInput) {
    return this.repository.markFailed({
      jobId: input.jobId,
      errorMessage: input.errorMessage,
      errorCode: input.errorCode,
      details: input.details,
      durationMs: input.durationMs
    });
  }

  async getJob(jobId: string) {
    return this.repository.findById(jobId);
  }
}
