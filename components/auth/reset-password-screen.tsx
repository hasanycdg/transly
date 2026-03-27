"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { createClient } from "@/lib/supabase/client";

const INPUT_CLASS_NAME =
  "h-12 w-full rounded-[16px] border border-[#ded5c8] bg-[#fbf8f3] px-4 text-[14px] text-[#171412] outline-none transition focus:border-[#bfb4a7] focus:bg-white";

export function ResetPasswordScreen() {
  const locale = useAppLocale();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Passwort zurücksetzen",
          heading: "Neues Passwort festlegen.",
          body:
            "Wenn dein Reset-Link gültig ist, kannst du hier ein neues Passwort speichern und direkt zurück in den Workspace gehen.",
          password: "Neues Passwort",
          confirmPassword: "Passwort bestätigen",
          submit: "Passwort speichern",
          submitting: "Wird gespeichert...",
          backToLogin: "Zur Anmeldung",
          ready: "Reset-Session erkannt",
          invalidLink:
            "Der Reset-Link ist ungültig oder abgelaufen. Fordere von der Anmeldung aus einen neuen Link an.",
          success: "Passwort aktualisiert. Du wirst jetzt zur Anmeldung weitergeleitet.",
          mismatch: "Die Passwörter stimmen nicht überein."
        }
      : {
          eyebrow: "/ Reset password",
          heading: "Set a new password.",
          body:
            "If your reset link is valid, save a new password here and jump back into your workspace.",
          password: "New password",
          confirmPassword: "Confirm password",
          submit: "Save password",
          submitting: "Saving...",
          backToLogin: "Back to sign in",
          ready: "Reset session detected",
          invalidLink:
            "The reset link is invalid or expired. Request a new one from the sign-in screen.",
          success: "Password updated. You will be redirected to sign in.",
          mismatch: "Passwords do not match."
        };

  useEffect(() => {
    let mounted = true;

    const resolveSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error || !data.session) {
        setErrorMessage(copy.invalidLink);
        return;
      }

      setIsReady(true);
    };

    void resolveSession();

    return () => {
      mounted = false;
    };
  }, [copy.invalidLink, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(copy.mismatch);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(copy.success);
      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.invalidLink);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,17,16,0.06),_transparent_34%),linear-gradient(180deg,_#fbf8f2_0%,_#f3efe8_100%)] px-5 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[760px] items-center justify-center">
        <section className="w-full rounded-[28px] border border-[rgba(17,17,16,0.08)] bg-[rgba(255,255,255,0.88)] px-6 py-8 shadow-[0_20px_60px_rgba(17,17,16,0.08)] backdrop-blur sm:px-8 sm:py-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9c9389]">{copy.eyebrow}</p>
          <h1 className="mt-3 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.06em] text-[#171412]">
            {copy.heading}
          </h1>
          <p className="mt-4 max-w-[560px] text-[14px] leading-[1.75] text-[#5f5851]">{copy.body}</p>

          {isReady ? (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-2 text-[12px] font-medium text-[var(--success)]">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              {copy.ready}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-6 rounded-[16px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[13px] text-[var(--danger)]">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-6 rounded-[16px] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-[13px] text-[var(--success)]">
              {successMessage}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9a9085]">
                {copy.password}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={INPUT_CLASS_NAME}
                autoComplete="new-password"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9a9085]">
                {copy.confirmPassword}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={INPUT_CLASS_NAME}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !isReady}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#5d554c] px-5 text-[14px] font-medium text-white transition hover:bg-[#504941] disabled:cursor-progress disabled:opacity-70"
            >
              {isSubmitting ? copy.submitting : copy.submit}
            </button>
          </form>

          <div className="mt-8 border-t border-[rgba(17,17,16,0.08)] pt-5">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dfd7cc] bg-white px-4 text-[13px] font-medium text-[#161412] transition hover:bg-[#faf7f2]"
            >
              {copy.backToLogin}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
