import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const AUTH_PATHS = new Set(["/login", "/register"]);
const PUBLIC_API_PATHS = new Set(["/api/stripe/webhook"]);
const PROTECTED_APP_PATH_PREFIXES = ["/projects", "/translate", "/usage", "/glossary", "/billing", "/settings"];

function isProtectedAppPath(pathname: string) {
  return PROTECTED_APP_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isProtectedApiPath(pathname: string) {
  return pathname.startsWith("/api/") && !PUBLIC_API_PATHS.has(pathname);
}

function getSafeRedirectTarget(request: NextRequest) {
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  return redirectTarget.startsWith("/") ? redirectTarget : "/projects";
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const isAuthenticated = !error && Boolean(user);
  const pathname = request.nextUrl.pathname;

  if (!isAuthenticated && isProtectedApiPath(pathname)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!isAuthenticated && isProtectedAppPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", getSafeRedirectTarget(request));

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && AUTH_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return response;
}
