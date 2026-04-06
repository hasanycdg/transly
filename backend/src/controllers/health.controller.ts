import type { PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

import type { Environment } from "../config/env";

type HealthControllerDeps = {
  prisma: PrismaClient;
  env: Environment;
};

export function buildHealthController({ prisma, env }: HealthControllerDeps) {
  return {
    getHealth: async (_request: FastifyRequest, reply: FastifyReply) => {
      const startedAt = Date.now();
      let databaseStatus: "up" | "down" = "up";
      let error: string | null = null;

      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (dbError) {
        databaseStatus = "down";
        error = dbError instanceof Error ? dbError.message : "Unknown database error";
      }

      const payload = {
        status: databaseStatus === "up" ? "ok" : "degraded",
        service: "ai-translation-platform-api",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Number(process.uptime().toFixed(2)),
        environment: env.NODE_ENV,
        queueMode: env.ASYNC_MODE,
        translationProvider: env.TRANSLATION_PROVIDER,
        checks: {
          database: databaseStatus
        },
        processingMs: Date.now() - startedAt,
        error
      };

      return reply.status(databaseStatus === "up" ? 200 : 503).send(payload);
    }
  };
}
