import Fastify from "fastify";

import { getEnv, type Environment } from "./config/env";
import { buildHealthController } from "./controllers/health.controller";
import { buildJobController } from "./controllers/job.controller";
import { buildTranslateController } from "./controllers/translate.controller";
import { prisma } from "./db/prisma";
import { createApiKeyPreHandler } from "./plugins/auth";
import { registerErrorHandler } from "./plugins/error-handler";
import { registerRateLimit } from "./plugins/rate-limit";
import { TranslationJobRepository } from "./repositories/translation-job.repository";
import { apiRoutes } from "./routes";
import { JobService } from "./services/jobs/job.service";
import { InMemoryQueueStub } from "./services/queue/job-queue";
import { createTranslationProvider } from "./services/translation/provider-factory";
import { TranslationService } from "./services/translation/translation-service";
import { sanitizeForLog } from "./utils/sanitize";

export async function buildApp(envInput: NodeJS.ProcessEnv = process.env) {
  const env: Environment = getEnv(envInput);

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      redact: {
        paths: ["req.headers.authorization", "req.headers.x-api-key", "authorization", "apiKey", "API_KEY"],
        censor: "[REDACTED]"
      }
    },
    bodyLimit: env.MAX_PAYLOAD_BYTES
  });

  registerErrorHandler(app);
  await registerRateLimit(app, env);

  const repository = new TranslationJobRepository(prisma);
  const jobService = new JobService(repository);
  const translationProvider = createTranslationProvider(env);
  const translationService = new TranslationService(translationProvider);
  const queue = new InMemoryQueueStub();

  const controllers = {
    healthController: buildHealthController({ prisma, env }),
    translateController: buildTranslateController({
      env,
      logger: app.log,
      jobService,
      translationService,
      queue
    }),
    jobController: buildJobController({ jobService })
  };

  app.addHook("onRequest", async (request) => {
    request.log.debug(
      {
        requestId: request.id,
        method: request.method,
        url: request.url
      },
      "Incoming request"
    );
  });

  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      sanitizeForLog({
        requestId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTimeMs: reply.elapsedTime
      }),
      "Request completed"
    );
  });

  await app.register(apiRoutes, {
    prefix: "/api",
    apiKeyPreHandler: createApiKeyPreHandler(env),
    controllers
  });

  app.get("/", async () => ({
    service: "ai-translation-platform-api",
    message: "Use /api/health for health checks."
  }));

  return { app, env };
}
