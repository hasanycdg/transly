import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parse, serialize } from "cookie";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        encode: "tokens-only",
        getAll() {
          return getBrowserCookies();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serialize(name, value, options);
          });
        }
      }
    });
  }

  return browserClient;
}

function getBrowserCookies() {
  if (typeof document === "undefined") {
    return [];
  }

  const parsedCookies = parse(document.cookie || "");

  return Object.entries(parsedCookies).map(([name, value]) => ({
    name,
    value: value ?? ""
  }));
}
