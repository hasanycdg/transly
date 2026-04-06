import type { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, code = "APP_ERROR", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function isZodError(error: unknown): error is ZodError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name?: string }).name === "ZodError" &&
      "issues" in error
  );
}

export function toErrorPayload(error: unknown) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: error.message
    };
  }

  return {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Unknown error"
  };
}
