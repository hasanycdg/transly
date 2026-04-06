import type { PrismaClient, TranslationJob } from "@prisma/client";

import { JOB_STATUSES, type JobStatus } from "../types/job-status";

type CreateTranslationJobInput = {
  siteUrl: string;
  postId: string;
  postType: string;
  sourceLanguage: string;
  targetLanguage: string;
  requestPayload: unknown;
  status: JobStatus;
};

type CompleteTranslationJobInput = {
  jobId: string;
  status: JobStatus;
  responsePayload: unknown;
  warnings: string[];
  provider: string;
  durationMs: number;
};

type FailTranslationJobInput = {
  jobId: string;
  errorMessage: string;
  errorCode?: string;
  details?: unknown;
  durationMs?: number;
};

export class TranslationJobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateTranslationJobInput): Promise<TranslationJob> {
    return this.prisma.translationJob.create({
      data: {
        siteUrl: input.siteUrl,
        postId: input.postId,
        postType: input.postType,
        sourceLanguage: input.sourceLanguage,
        targetLanguage: input.targetLanguage,
        requestPayload: input.requestPayload as object,
        status: input.status,
        startedAt: input.status === JOB_STATUSES.processing ? new Date() : null
      }
    });
  }

  async markProcessing(jobId: string) {
    return this.prisma.translationJob.update({
      where: { id: jobId },
      data: {
        status: JOB_STATUSES.processing,
        startedAt: new Date(),
        attempts: {
          increment: 1
        }
      }
    });
  }

  async markCompleted(input: CompleteTranslationJobInput) {
    return this.prisma.translationJob.update({
      where: { id: input.jobId },
      data: {
        status: input.status,
        responsePayload: input.responsePayload as object,
        warnings: input.warnings as unknown as object,
        provider: input.provider,
        durationMs: input.durationMs,
        finishedAt: new Date()
      }
    });
  }

  async markFailed(input: FailTranslationJobInput) {
    return this.prisma.translationJob.update({
      where: { id: input.jobId },
      data: {
        status: JOB_STATUSES.failed,
        errors: [
          {
            message: input.errorMessage,
            code: input.errorCode ?? "UNKNOWN_ERROR",
            details: input.details ?? null,
            at: new Date().toISOString()
          }
        ] as unknown as object,
        durationMs: input.durationMs,
        finishedAt: new Date()
      }
    });
  }

  async findById(jobId: string) {
    return this.prisma.translationJob.findUnique({
      where: { id: jobId }
    });
  }
}
