import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function createServerSupabaseAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      // Keep auth cookies small enough for proxy/header limits during OAuth callbacks.
      encode: "tokens-only",
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can read cookies but may not be allowed to persist them.
        }
      }
    }
  });
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createServerSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuthenticatedUser(redirectTo: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}
