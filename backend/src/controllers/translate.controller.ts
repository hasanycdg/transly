import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";

import type { Environment } from "../config/env";
import type { BulkTranslateRequestDto, TranslateRequestDto } from "../schemas/translation.schemas";
import { bulkTranslateRequestSchema, translateRequestSchema } from "../schemas/translation.schemas";
import { JobService } from "../services/jobs/job.service";
import type { JobQueue } from "../services/queue/job-queue";
import { TranslationService } from "../services/translation/translation-service";
import { JOB_STATUSES } from "../types/job-status";
import { AppError, toErrorPayload } from "../utils/errors";
import { assertPayloadWithinLimit } from "../utils/payload-size";
import { sanitizeForLog } from "../utils/sanitize";

type TranslateControllerDeps = {
  env: Environment;
  logger: FastifyBaseLogger;
  jobService: JobService;
  translationService: TranslationService;
  queue: JobQueue;
};

type ProcessingResult = {
  jobId: string;
  status: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedPayload: unknown;
  warnings: string[];
  processingMetadata: Record<string, unknown>;
};

async function processSingleJob(
  payload: TranslateRequestDto,
  deps: TranslateControllerDeps
): Promise<ProcessingResult> {
  const receivedAt = new Date().toISOString();
  assertPayloadWithinLimit(payload, deps.env.MAX_PAYLOAD_BYTES);

  const createdJob = await deps.jobService.createJob(payload, JOB_STATUSES.queued);
  const jobId = createdJob.id;

  if (deps.env.ASYNC_MODE === "queue") {
    try {
      await deps.queue.enqueue({ jobId, request: payload });
    } catch (error) {
      await deps.jobService.failJob({
        jobId,
        errorMessage: error instanceof Error ? error.message : "Queue enqueue failed.",
        errorCode: "QUEUE_ENQUEUE_FAILED"
      });
      throw error;
    }

    return {
      jobId,
      status: JOB_STATUSES.queued,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      translatedPayload: null,
      warnings: ["Job accepted in queue mode. Background worker integration is a TODO scaffold."],
      processingMetadata: {
        queueMode: deps.env.ASYNC_MODE,
        acceptedAt: receivedAt
      }
    };
  }

  const startedAt = Date.now();
  await deps.jobService.markProcessing(jobId);

  try {
    const translationResult = await deps.translationService.translate(payload);
    const completedJob = await deps.jobService.completeJob({
      jobId,
      translatedPayload: translationResult.translatedPayload,
      warnings: translationResult.warnings,
      provider: translationResult.provider,
      durationMs: translationResult.durationMs
    });

    return {
      jobId,
      status: completedJob.status,
      sourceLanguage: payload.sourceLanguage,
      targetLanguage: payload.targetLanguage,
      translatedPayload: translationResult.translatedPayload,
      warnings: translationResult.warnings,
      processingMetadata: {
        provider: translationResult.provider,
        durationMs: translationResult.durationMs,
        queueMode: deps.env.ASYNC_MODE,
        stats: translationResult.stats,
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    await deps.jobService.failJob({
      jobId,
      errorMessage: error instanceof Error ? error.message : "Translation failed.",
      errorCode: "TRANSLATION_FAILED",
      details: sanitizeForLog(toErrorPayload(error)),
      durationMs: Date.now() - startedAt
    });

    throw error;
  }
}

export function buildTranslateController(deps: TranslateControllerDeps) {
  return {
    translate: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsedBody = translateRequestSchema.safeParse(request.body);
      if (!parsedBody.success) {
        throw new AppError(400, "Invalid translation request payload.", "VALIDATION_ERROR", parsedBody.error.issues);
      }

      const result = await processSingleJob(parsedBody.data, deps);
      return reply.status(result.status === JOB_STATUSES.queued ? 202 : 200).send(result);
    },

    translateBulk: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsedBody = bulkTranslateRequestSchema.safeParse(request.body);
      if (!parsedBody.success) {
        throw new AppError(400, "Invalid bulk translation request payload.", "VALIDATION_ERROR", parsedBody.error.issues);
      }

      const payload = parsedBody.data as BulkTranslateRequestDto;
      assertPayloadWithinLimit(payload, deps.env.MAX_PAYLOAD_BYTES);

      const results: Array<Record<string, unknown>> = [];
      let successCount = 0;
      let failureCount = 0;

      for (let index = 0; index < payload.jobs.length; index += 1) {
        const current = payload.jobs[index];

        try {
          const itemResult = await processSingleJob(current, deps);
          results.push({
            index,
            ...itemResult
          });
          successCount += 1;
        } catch (error) {
          const errorPayload = toErrorPayload(error);
          failureCount += 1;

          results.push({
            index,
            status: JOB_STATUSES.failed,
            sourceLanguage: current.sourceLanguage,
            targetLanguage: current.targetLanguage,
            translatedPayload: null,
            warnings: [],
            processingMetadata: {
              queueMode: deps.env.ASYNC_MODE
            },
            error: {
              code: errorPayload.code,
              message: errorPayload.message
            }
          });

          deps.logger.error(
            { error: sanitizeForLog(errorPayload), jobIndex: index },
            "Bulk translation item failed."
          );

          if (!payload.continueOnError) {
            break;
          }
        }
      }

      const status =
        failureCount === 0
          ? JOB_STATUSES.completed
          : successCount === 0
            ? JOB_STATUSES.failed
            : JOB_STATUSES.completedWithWarnings;

      return reply.status(status === JOB_STATUSES.failed ? 500 : 200).send({
        status,
        totalJobs: payload.jobs.length,
        succeeded: successCount,
        failed: failureCount,
        results
      });
    }
  };
}
