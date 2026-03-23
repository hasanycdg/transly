import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  requireSupabaseServiceRoleKey
} from "@/lib/supabase/env";

export function createServerSupabaseClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey() || getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

export function createServerSupabaseAdminClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), requireSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}
