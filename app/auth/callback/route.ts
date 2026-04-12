import { NextResponse } from "next/server";

import { createServerSupabaseAuthClient } from "@/lib/supabase/server";

const CALLBACK_EXCHANGE_TIMEOUT_MS = 10_000;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestOrigin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  try {
    if (code) {
      const supabase = await createServerSupabaseAuthClient();
      const { error } = await withTimeout(
        supabase.auth.exchangeCodeForSession(code),
        CALLBACK_EXCHANGE_TIMEOUT_MS
      );

      if (!error) {
        return NextResponse.redirect(new URL(next, requestOrigin));
      }

      console.error("Auth callback session exchange failed:", error.message);
    }
  } catch (error) {
    console.error("Auth callback unexpected failure:", error);
  }

  const loginUrl = new URL("/login", requestOrigin);
  loginUrl.searchParams.set("redirectTo", next);

  if (code) {
    loginUrl.searchParams.set("authError", "callback_failed");
  }

  return NextResponse.redirect(loginUrl);
}

function getSafeRedirectPath(redirectTo: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/dashboard";
  }

  return redirectTo;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Auth callback timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}
