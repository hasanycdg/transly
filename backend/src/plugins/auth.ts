import { timingSafeEqual } from "node:crypto";
import type { preHandlerHookHandler } from "fastify";

import type { Environment } from "../config/env";
import { AppError } from "../utils/errors";

function extractApiKey(headers: Record<string, unknown>): string | null {
  const xApiKey = headers["x-api-key"];
  if (typeof xApiKey === "string" && xApiKey.trim().length > 0) {
    return xApiKey.trim();
  }

  const authorization = headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();
    return token.length > 0 ? token : null;
  }

  return null;
}

function safeApiKeyCompare(input: string, expected: string) {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export function createApiKeyPreHandler(env: Environment): preHandlerHookHandler {
  return async (request) => {
    const apiKey = extractApiKey(request.headers as unknown as Record<string, unknown>);

    if (!apiKey) {
      throw new AppError(401, "Missing API key. Provide x-api-key header or Bearer token.", "UNAUTHORIZED");
    }

    if (!safeApiKeyCompare(apiKey, env.API_KEY)) {
      throw new AppError(401, "Invalid API key.", "UNAUTHORIZED");
    }
  };
}
