import type { FastifyReply, FastifyRequest } from "fastify";

import { jobIdParamsSchema } from "../schemas/job.schemas";
import { JobService } from "../services/jobs/job.service";
import { AppError } from "../utils/errors";

type JobControllerDeps = {
  jobService: JobService;
};

export function buildJobController({ jobService }: JobControllerDeps) {
  return {
    getJob: async (request: FastifyRequest, reply: FastifyReply) => {
      const parsedParams = jobIdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        throw new AppError(400, "Invalid job id parameter.", "INVALID_JOB_ID", parsedParams.error.issues);
      }

      const job = await jobService.getJob(parsedParams.data.id);
      if (!job) {
        throw new AppError(404, `Job "${parsedParams.data.id}" was not found.`, "JOB_NOT_FOUND");
      }

      return reply.send({
        jobId: job.id,
        status: job.status,
        siteUrl: job.siteUrl,
        postId: job.postId,
        postType: job.postType,
        sourceLanguage: job.sourceLanguage,
        targetLanguage: job.targetLanguage,
        requestPayload: job.requestPayload,
        responsePayload: job.responsePayload,
        warnings: job.warnings ?? [],
        errors: job.errors ?? [],
        provider: job.provider,
        attempts: job.attempts,
        durationMs: job.durationMs,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt
      });
    }
  };
}
