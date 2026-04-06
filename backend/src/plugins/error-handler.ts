import type { FastifyInstance } from "fastify";

import { isZodError, toErrorPayload } from "../utils/errors";
import { sanitizeForLog } from "../utils/sanitize";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (isZodError(error)) {
      const zodPayload = {
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Request payload validation failed.",
        details: error.issues
      };

      request.log.warn({ error: sanitizeForLog(zodPayload) }, "Validation error");
      return reply.status(400).send(zodPayload);
    }

    const payload = toErrorPayload(error);
    request.log.error({ error: sanitizeForLog(payload) }, "Unhandled request error");
    return reply.status(payload.statusCode).send(payload);
  });
}
