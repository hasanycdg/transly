import { z } from "zod";

const LOCAL_SUPABASE_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4001),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  API_KEY: z.string().min(16, "API_KEY must be at least 16 characters."),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  MAX_PAYLOAD_BYTES: z.coerce.number().int().min(1_024).max(25_000_000).default(1_048_576),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(60),
  RATE_LIMIT_TIME_WINDOW: z.string().default("1 minute"),
  TRANSLATION_PROVIDER: z.enum(["stub", "llm"]).default("stub"),
  STUB_TRANSLATION_MODE: z.enum(["annotate", "identity"]).default("annotate"),
  ASYNC_MODE: z.enum(["sync", "queue"]).default("sync")
});

export type Environment = z.infer<typeof envSchema>;

function normalizeEnvAliases(envInput: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const normalized: NodeJS.ProcessEnv = { ...envInput };

  if (!normalized.API_KEY) {
    normalized.API_KEY =
      normalized.BACKEND_API_KEY ??
      normalized.TRANSLATION_API_KEY ??
      normalized.WP_PLUGIN_API_KEY ??
      normalized.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!normalized.DATABASE_URL) {
    normalized.DATABASE_URL =
      normalized.POSTGRES_PRISMA_URL ??
      normalized.POSTGRES_URL ??
      normalized.SUPABASE_DATABASE_URL ??
      normalized.SUPABASE_DB_URL;
  }

  if (!normalized.DATABASE_URL) {
    const supabaseUrl = normalized.NEXT_PUBLIC_SUPABASE_URL ?? normalized.SUPABASE_URL;
    const isLocalSupabase =
      typeof supabaseUrl === "string" &&
      (supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost"));

    if (isLocalSupabase && normalized.NODE_ENV !== "production") {
      normalized.DATABASE_URL = LOCAL_SUPABASE_DATABASE_URL;
    }
  }

  if (!normalized.DATABASE_URL && normalized.NODE_ENV !== "production") {
    normalized.DATABASE_URL = LOCAL_SUPABASE_DATABASE_URL;
  }

  return normalized;
}

export function getEnv(envInput: NodeJS.ProcessEnv = process.env): Environment {
  const normalized = normalizeEnvAliases(envInput);
  const parsed = envSchema.safeParse(normalized);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }
  return parsed.data;
}
