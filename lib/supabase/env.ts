export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in the environment.");
  }

  return url;
}

export function getSupabasePublishableKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the environment.");
  }

  return key;
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function requireSupabaseServiceRoleKey() {
  const key = getSupabaseServiceRoleKey();

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in the environment.");
  }

  return key;
}

export function getAppUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const vercelOrigin =
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeOrigin(process.env.VERCEL_URL);

  if (vercelOrigin) {
    return vercelOrigin;
  }

  return "http://localhost:3000";
}

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}
