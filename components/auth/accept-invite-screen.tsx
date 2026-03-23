"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { createClient } from "@/lib/supabase/client";

export function AcceptInviteScreen() {
  const locale = useAppLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const next = getSafeRedirectPath(searchParams.get("next"));
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Einladung wird verarbeitet",
          heading: "Workspace-Zugang wird vorbereitet.",
          body:
            "Sobald Supabase die Einladung bestätigt und deine Session gesetzt ist, leiten wir dich direkt in den Workspace weiter.",
          fallback: "Falls nichts passiert, gehe zur Anmeldung zurück.",
          backToLogin: "Zur Anmeldung",
          invalidInvite:
            "Die Einladung konnte nicht bestätigt werden. Öffne den Link aus der Supabase-Mail erneut oder fordere eine neue Einladung an."
        }
      : {
          eyebrow: "/ Processing invite",
          heading: "Preparing workspace access.",
          body:
            "As soon as Supabase confirms the invite and sets your session, you will be redirected straight into the workspace.",
          fallback: "If nothing happens, return to sign in.",
          backToLogin: "Back to sign in",
          invalidInvite:
            "The invite could not be confirmed. Open the link from the Supabase email again or request a new invitation."
        };

  useEffect(() => {
    let mounted = true;

    const resolveInvite = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message || copy.invalidInvite);
        return;
      }

      if (data.user) {
        router.replace(next);
        router.refresh();
      }
    };

    void resolveInvite();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (session?.user) {
        router.replace(next);
        router.refresh();
      }
    });

    const timeoutId = window.setTimeout(() => {
      if (mounted) {
        setErrorMessage((current) => current ?? copy.invalidInvite);
      }
    }, 6000);

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [copy.invalidInvite, next, router, supabase]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,17,16,0.06),_transparent_34%),linear-gradient(180deg,_#fbf8f2_0%,_#f3efe8_100%)] px-5 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[760px] items-center justify-center">
        <section className="w-full rounded-[28px] border border-[rgba(17,17,16,0.08)] bg-[rgba(255,255,255,0.88)] px-6 py-8 shadow-[0_20px_60px_rgba(17,17,16,0.08)] backdrop-blur sm:px-8 sm:py-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9c9389]">{copy.eyebrow}</p>
          <h1 className="mt-3 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.06em] text-[#171412]">
            {copy.heading}
          </h1>
          <p className="mt-4 max-w-[560px] text-[14px] leading-[1.75] text-[#5f5851]">{copy.body}</p>

          {errorMessage ? (
            <div className="mt-6 rounded-[16px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[13px] text-[var(--danger)]">
              {errorMessage}
            </div>
          ) : (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[12px] font-medium text-[var(--foreground)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--foreground)]" />
              {locale === "de" ? "Supabase-Session wird vorbereitet" : "Supabase session is being finalized"}
            </div>
          )}

          <div className="mt-8 border-t border-[rgba(17,17,16,0.08)] pt-5">
            <p className="text-[12px] leading-6 text-[#6d655d]">{copy.fallback}</p>
            <Link
              href="/login"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-[#dfd7cc] bg-white px-4 text-[13px] font-medium text-[#161412] transition hover:bg-[#faf7f2]"
            >
              {copy.backToLogin}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function getSafeRedirectPath(redirectTo: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/projects";
  }

  return redirectTo;
}
