import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in the server environment.");
  }

  return url;
}

function getPublishableKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the server environment.");
  }

  return key;
}

function getServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || getPublishableKey();
}

export function createServerSupabaseClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServerKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
