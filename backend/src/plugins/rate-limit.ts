import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";

import type { Environment } from "../config/env";

export async function registerRateLimit(app: FastifyInstance, env: Environment) {
  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    errorResponseBuilder: (_, context) => ({
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      message: `Too many requests. Retry in ${context.after}.`
    })
  });
}
