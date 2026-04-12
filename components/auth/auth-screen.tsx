"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { createClient } from "@/lib/supabase/client";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.06em]";
const PRIMARY_BUTTON_CLASS_NAME =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#5d554c] px-5 text-[14px] font-medium text-white transition hover:bg-[#504941] disabled:cursor-progress disabled:opacity-70";

type AuthScreenProps = {
  mode: "login" | "register";
};

type FormValues = {
  acceptTerms: boolean;
  confirmPassword: string;
  email: string;
  name: string;
  password: string;
  workspace: string;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const locale = useAppLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = mode === "register";
  const [supabase] = useState(() => createClient());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    acceptTerms: false,
    confirmPassword: "",
    email: "",
    name: "",
    password: "",
    workspace: ""
  });

  const copy =
    locale === "de"
      ? {
          brand: "Translayr",
          backHome: "Zur Landingpage",
          badge: isRegister ? "Neuen Workspace anlegen" : "Zurück in deinen Workspace",
          heading: isRegister ? "Registrieren ohne Umwege." : "Anmelden und weiterarbeiten.",
          description: isRegister
            ? "Ein klarer Einstieg für Teams, die ihren Übersetzungs-Workflow sofort in einem sauberen Dashboard organisieren wollen."
            : "Melde dich an und springe direkt zurück in Projekte, Glossar, Usage und Billing.",
          tabs: {
            login: "Anmelden",
            register: "Registrieren"
          },
          sectionEyebrow: isRegister ? "/ Zugang erstellen" : "/ Workspace öffnen",
          highlights: isRegister
            ? [
                {
                  title: "Klarer Start",
                  description: "Name, Workspace und Zugang in einem kompakten Flow."
                },
                {
                  title: "Sofort produktiv",
                  description: "Direkter Sprung ins Dashboard."
                }
              ]
            : [
                {
                  title: "Schneller Wiedereinstieg",
                  description: "Ohne Umweg zurück in deine Projekte."
                },
                {
                  title: "Fokussierter Zugriff",
                  description: "Nur die Felder, die du wirklich brauchst."
                }
              ],
          formEyebrow: "/ Mit E-Mail fortfahren",
          formTitle: isRegister ? "Zugang einrichten" : "Workspace öffnen",
          formBody: isRegister
            ? "Die wichtigsten Daten festlegen und direkt weiter."
            : "Mit deinen Zugangsdaten direkt weiter.",
          nameLabel: "Vollständiger Name",
          workspaceLabel: "Workspace-Name",
          emailLabel: "E-Mail",
          passwordLabel: "Passwort",
          confirmPasswordLabel: "Passwort bestätigen",
          namePlaceholder: "Max Mustermann",
          workspacePlaceholder: "Acme Localization",
          emailPlaceholder: "team@firma.de",
          passwordPlaceholder: "Mindestens 8 Zeichen",
          confirmPasswordPlaceholder: "Passwort wiederholen",
          termsLabel: "Ich stimme den Nutzungsbedingungen und Datenschutzrichtlinien zu.",
          submit: isRegister ? "Konto erstellen" : "Jetzt anmelden",
          submitting: isRegister ? "Konto wird erstellt..." : "Anmeldung läuft...",
          alternatePrompt: isRegister ? "Schon ein Konto?" : "Noch kein Konto?",
          alternateCta: isRegister ? "Anmelden" : "Registrieren",
          alternateHref: isRegister ? "/login" : "/register",
          directNote: "Direkter Weitergang ins Dashboard.",
          googleCta: "Mit Google fortfahren",
          googleSubmitting: "Weiterleitung zu Google...",
          magicLink: "Magic Link senden",
          sendingMagicLink: "Magic Link wird gesendet...",
          forgotPassword: "Passwort vergessen?",
          success: {
            confirmEmail:
              "Dein Konto wurde erstellt. Bitte bestätige jetzt deine E-Mail, bevor du ins Dashboard gehst.",
            magicLink:
              "Dein Magic Link wurde verschickt. Öffne die E-Mail und gehe direkt in deinen Workspace.",
            passwordReset:
              "Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts verschickt."
          },
          errors: {
            passwordMismatch: "Die Passwörter stimmen nicht überein.",
            termsRequired: "Bitte bestätige die Nutzungsbedingungen, um fortzufahren.",
            emailRequired: "Gib zuerst deine E-Mail-Adresse ein."
          }
        }
      : {
          brand: "Translayr",
          backHome: "Back to landing page",
          badge: isRegister ? "Create a new workspace" : "Return to your workspace",
          heading: isRegister ? "Register without extra steps." : "Sign in and keep moving.",
          description: isRegister
            ? "A focused entry point for teams that want to organize their translation workflow in a clean dashboard right away."
            : "Sign in and jump straight back into your dashboard, usage, glossary, and billing.",
          tabs: {
            login: "Sign in",
            register: "Register"
          },
          sectionEyebrow: isRegister ? "/ Create access" : "/ Open workspace",
          highlights: isRegister
            ? [
                {
                  title: "Clear starting point",
                  description: "Name, workspace, and access in one compact flow."
                },
                {
                  title: "Useful immediately",
                  description: "Direct jump into the dashboard."
                }
              ]
            : [
                {
                  title: "Fast return",
                  description: "Back to your dashboard without extra clicks."
                },
                {
                  title: "Focused access",
                  description: "Only the fields you actually need."
                }
              ],
          formEyebrow: "/ Continue with email",
          formTitle: isRegister ? "Set up access" : "Open your workspace",
          formBody: isRegister
            ? "Define the essentials and continue directly."
            : "Enter your details and continue directly.",
          nameLabel: "Full name",
          workspaceLabel: "Workspace name",
          emailLabel: "Email",
          passwordLabel: "Password",
          confirmPasswordLabel: "Confirm password",
          namePlaceholder: "Jane Doe",
          workspacePlaceholder: "Acme Localization",
          emailPlaceholder: "team@company.com",
          passwordPlaceholder: "At least 8 characters",
          confirmPasswordPlaceholder: "Repeat password",
          termsLabel: "I agree to the terms of service and privacy policy.",
          submit: isRegister ? "Create account" : "Sign in now",
          submitting: isRegister ? "Creating account..." : "Signing in...",
          alternatePrompt: isRegister ? "Already have an account?" : "Need an account?",
          alternateCta: isRegister ? "Sign in" : "Register",
          alternateHref: isRegister ? "/login" : "/register",
          directNote: "Direct redirect into the dashboard.",
          googleCta: "Continue with Google",
          googleSubmitting: "Redirecting to Google...",
          magicLink: "Send magic link",
          sendingMagicLink: "Sending magic link...",
          forgotPassword: "Forgot password?",
          success: {
            confirmEmail:
              "Your account was created. Please confirm your email before entering the dashboard.",
            magicLink:
              "Your magic link was sent. Open the email and jump straight into your workspace.",
            passwordReset:
              "If that email exists, a password reset link has been sent."
          },
          errors: {
            passwordMismatch: "Passwords do not match.",
            termsRequired: "Please confirm the terms to continue.",
            emailRequired: "Enter your email address first."
          }
        };

  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));

  useEffect(() => {
    router.prefetch(redirectTo);
    router.prefetch(copy.alternateHref);
  }, [copy.alternateHref, redirectTo, router]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    if (isRegister) {
      if (formValues.password !== formValues.confirmPassword) {
        setErrorMessage(copy.errors.passwordMismatch);
        return;
      }

      if (!formValues.acceptTerms) {
        setErrorMessage(copy.errors.termsRequired);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (isRegister) {
        const appUrl = getClientAppUrl();
        const { data, error } = await supabase.auth.signUp({
          email: formValues.email.trim(),
          password: formValues.password,
          options: {
            emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
            data: {
              full_name: formValues.name.trim(),
              workspace_name: formValues.workspace.trim()
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          router.replace(redirectTo);
          router.refresh();
          return;
        }

        setSuccessMessage(copy.success.confirmEmail);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: formValues.email.trim(),
        password: formValues.password
      });

      if (error) {
        throw error;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMagicLink() {
    if (isSubmitting) {
      return;
    }

    if (!formValues.email.trim()) {
      setErrorMessage(copy.errors.emailRequired);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const appUrl = getClientAppUrl();

      const { error } = await supabase.auth.signInWithOtp({
        email: formValues.email.trim(),
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        }
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(copy.success.magicLink);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const appUrl = getClientAppUrl();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    if (isSubmitting) {
      return;
    }

    if (!formValues.email.trim()) {
      setErrorMessage(copy.errors.emailRequired);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const appUrl = getClientAppUrl();

      const { error } = await supabase.auth.resetPasswordForEmail(formValues.email.trim(), {
        redirectTo: `${appUrl}/reset-password`
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(copy.success.passwordReset);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,17,16,0.06),_transparent_34%),linear-gradient(180deg,_#fbf8f2_0%,_#f3efe8_100%)] px-5 py-4 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px] rounded-[28px] border border-[rgba(17,17,16,0.08)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_20px_60px_rgba(17,17,16,0.08)] backdrop-blur sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(17,17,16,0.08)] pb-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#12100f] text-white">
              <BrandIcon />
            </span>
            <span className="text-[15px] font-medium tracking-[-0.03em]">{copy.brand}</span>
          </Link>

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dfd7cc] bg-[rgba(255,255,255,0.72)] px-4 text-[13px] font-medium text-[#161412] transition hover:bg-white"
          >
            {copy.backHome}
          </Link>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-[24px] border border-[rgba(17,17,16,0.08)] bg-[linear-gradient(180deg,_#f4efe8_0%,_#f9f6f1_100%)] p-5 lg:p-6">
            <div className="inline-flex rounded-full border border-[#e3dacc] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8e8478]">
              {copy.badge}
            </div>

            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-[#9c9389]">
              {copy.sectionEyebrow}
            </p>
            <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-3 max-w-[480px] text-[clamp(1.9rem,3vw,2.8rem)] leading-[0.98] text-[#171412]`}>
              {copy.heading}
            </h1>
            <p className="mt-4 max-w-[460px] text-[14px] leading-[1.7] tracking-[-0.02em] text-[#5f5851]">
              {copy.description}
            </p>

            <div className="mt-6 grid gap-3">
              {copy.highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[16px] border border-[#e6ddd2] bg-white/72 px-4 py-3 shadow-[0_8px_18px_rgba(17,15,13,0.03)]"
                >
                  <div className="text-[15px] font-medium tracking-[-0.03em] text-[#171412]">{item.title}</div>
                  <div className="mt-1 text-[13px] leading-[1.65] text-[#655d56]">{item.description}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[16px] border border-[#e3dacc] bg-white px-4 py-3 text-[13px] leading-[1.65] text-[#655d56]">
              {copy.directNote}
            </div>
          </section>

          <section className="rounded-[24px] border border-[rgba(17,17,16,0.08)] bg-white p-5 shadow-[0_16px_40px_rgba(17,15,13,0.04)] lg:p-6">
            <div className="inline-flex rounded-[14px] border border-[#e4dbcf] bg-[#faf6f0] p-1">
              <Link
                href="/login"
                className={[
                  "inline-flex h-10 items-center justify-center rounded-[10px] px-4 text-[13px] font-medium transition",
                  !isRegister ? "bg-white text-[#171412] shadow-[0_4px_10px_rgba(17,15,13,0.04)]" : "text-[#8f857a]"
                ].join(" ")}
              >
                {copy.tabs.login}
              </Link>
              <Link
                href="/register"
                className={[
                  "inline-flex h-10 items-center justify-center rounded-[10px] px-4 text-[13px] font-medium transition",
                  isRegister ? "bg-white text-[#171412] shadow-[0_4px_10px_rgba(17,15,13,0.04)]" : "text-[#8f857a]"
                ].join(" ")}
              >
                {copy.tabs.register}
              </Link>
            </div>

            <div className="mt-5">
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#9c9389]">{copy.formEyebrow}</p>
              <h2 className="mt-2 text-[22px] font-medium tracking-[-0.04em] text-[#171412]">{copy.formTitle}</h2>
              <p className="mt-1.5 max-w-[520px] text-[13px] leading-[1.7] text-[#655d56]">{copy.formBody}</p>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-[16px] border border-[#efc8c8] bg-[#fdf1f1] px-4 py-3 text-[13px] text-[#9b1d1d]">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-5 rounded-[16px] border border-[#d8e8dd] bg-[#f2f8f4] px-4 py-3 text-[13px] text-[#2f6b47]">
                {successMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={isSubmitting}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-[#dfd7cc] bg-white px-4 text-[14px] font-medium text-[#171412] transition hover:bg-[#faf7f2] disabled:cursor-progress disabled:opacity-70"
            >
              <GoogleIcon />
              <span>{isSubmitting ? copy.googleSubmitting : copy.googleCta}</span>
            </button>

            <div className="mt-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9c9389]">
              <span className="h-px flex-1 bg-[#ece3d8]" />
              <span>{copy.formEyebrow}</span>
              <span className="h-px flex-1 bg-[#ece3d8]" />
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {isRegister ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthField
                    label={copy.nameLabel}
                    value={formValues.name}
                    onChange={(value) => updateField("name", value)}
                    placeholder={copy.namePlaceholder}
                    autoComplete="name"
                  />
                  <AuthField
                    label={copy.workspaceLabel}
                    value={formValues.workspace}
                    onChange={(value) => updateField("workspace", value)}
                    placeholder={copy.workspacePlaceholder}
                    autoComplete="organization"
                  />
                </div>
              ) : null}

              <AuthField
                label={copy.emailLabel}
                type="email"
                value={formValues.email}
                onChange={(value) => updateField("email", value)}
                placeholder={copy.emailPlaceholder}
                autoComplete="email"
              />

              {isRegister ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthField
                    label={copy.passwordLabel}
                    type="password"
                    value={formValues.password}
                    onChange={(value) => updateField("password", value)}
                    placeholder={copy.passwordPlaceholder}
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <AuthField
                    label={copy.confirmPasswordLabel}
                    type="password"
                    value={formValues.confirmPassword}
                    onChange={(value) => updateField("confirmPassword", value)}
                    placeholder={copy.confirmPasswordPlaceholder}
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              ) : (
                <AuthField
                  label={copy.passwordLabel}
                  type="password"
                  value={formValues.password}
                  onChange={(value) => updateField("password", value)}
                  placeholder={copy.passwordPlaceholder}
                  minLength={8}
                  autoComplete="current-password"
                />
              )}

              {isRegister ? (
                <label className="flex items-start gap-3 rounded-[16px] border border-[#ece3d8] bg-[#faf7f2] px-4 py-3 text-[13px] leading-[1.7] text-[#5e5750]">
                  <input
                    type="checkbox"
                    checked={formValues.acceptTerms}
                    onChange={(event) => updateField("acceptTerms", event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#cfc5b8]"
                  />
                  <span>{copy.termsLabel}</span>
                </label>
              ) : null}

              <button type="submit" disabled={isSubmitting} className={PRIMARY_BUTTON_CLASS_NAME}>
                {isSubmitting ? copy.submitting : copy.submit}
              </button>

              {!isRegister ? (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <button
                    type="button"
                    onClick={() => void handleMagicLink()}
                    disabled={isSubmitting}
                    className="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#dfd7cc] bg-[#faf7f2] px-4 text-[13px] font-medium text-[#171412] transition hover:bg-white disabled:cursor-progress disabled:opacity-70"
                  >
                    {isSubmitting ? copy.sendingMagicLink : copy.magicLink}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePasswordReset()}
                    disabled={isSubmitting}
                    className="inline-flex h-11 items-center justify-center rounded-[16px] border border-transparent px-4 text-[13px] font-medium text-[#5f5851] transition hover:border-[#dfd7cc] hover:bg-[#faf7f2] hover:text-[#171412] disabled:cursor-progress disabled:opacity-70"
                  >
                    {copy.forgotPassword}
                  </button>
                </div>
              ) : null}
            </form>

            <div className="mt-5 border-t border-[#ece3d8] pt-4 text-[13px] text-[#736c64]">
              <span>{copy.alternatePrompt} </span>
              <Link href={copy.alternateHref} className="font-medium text-[#171412]">
                {copy.alternateCta}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type AuthFieldProps = {
  autoComplete?: string;
  hint?: string;
  label: string;
  minLength?: number;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "password" | "text";
  value: string;
};

function AuthField({
  autoComplete,
  hint,
  label,
  minLength,
  onChange,
  placeholder,
  type = "text",
  value
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9a9085]">
        {label}
      </span>
      <input
        type={type}
        required
        minLength={minLength}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[16px] border border-[#ded5c8] bg-[#fbf8f3] px-4 text-[14px] text-[#171412] outline-none transition focus:border-[#bfb4a7] focus:bg-white"
      />
      {hint ? <span className="mt-2 block text-[12px] leading-[1.6] text-[#9b9288]">{hint}</span> : null}
    </label>
  );
}

function BrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
      <path d="M5 6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v10.4A2.8 2.8 0 0 1 16.2 20H7.8A2.8 2.8 0 0 1 5 17.2V6.8Zm4.3 1.2v1.8h5.4V8H9.3Zm0 3.6v1.8h5.4v-1.8H9.3Zm0 3.6V17h3.6v-1.8H9.3Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#EA4335"
        d="M12 10.08v3.98h5.64c-.25 1.28-.98 2.37-2.04 3.11l3.3 2.56c1.93-1.77 3.05-4.38 3.05-7.48 0-.74-.07-1.45-.2-2.13H12Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.75 0 5.06-.91 6.74-2.47l-3.3-2.56c-.92.62-2.1.99-3.44.99-2.65 0-4.9-1.79-5.7-4.2l-3.42 2.64A10.17 10.17 0 0 0 12 21.5Z"
      />
      <path
        fill="#4A90E2"
        d="M6.3 13.26a6.08 6.08 0 0 1 0-3.52L2.88 7.1a10.17 10.17 0 0 0 0 8.8l3.42-2.64Z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.54c1.5 0 2.84.52 3.89 1.55l2.92-2.92C17.05 3.53 14.74 2.5 12 2.5A10.17 10.17 0 0 0 2.88 7.1l3.42 2.64c.8-2.41 3.05-4.2 5.7-4.2Z"
      />
    </svg>
  );
}

function getSafeRedirectPath(redirectTo: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/dashboard";
  }

  return redirectTo;
}

function getClientAppUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "http://localhost:3000";
}
