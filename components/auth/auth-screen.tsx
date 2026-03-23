"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState, type FormEvent } from "react";

import { useAppLocale } from "@/components/app-locale-provider";

type AuthScreenProps = {
  mode: "login" | "register";
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const locale = useAppLocale();
  const router = useRouter();
  const isRegister = mode === "register";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    workspace: "",
    email: "",
    password: ""
  });

  const copy =
    locale === "de"
      ? {
          backHome: "Zur Landingpage",
          badge: isRegister ? "Neuen Workspace starten" : "Wieder im Workspace arbeiten",
          heading: isRegister ? "Registrieren" : "Anmelden",
          description: isRegister
            ? "Erstelle deinen Zugang und gehe danach direkt in dein Dashboard."
            : "Melde dich an und springe ohne Umwege zurück in dein Dashboard.",
          name: "Vollständiger Name",
          workspace: "Workspace-Name",
          email: "E-Mail",
          password: "Passwort",
          submit: isRegister ? "Konto erstellen" : "Jetzt anmelden",
          submitting: isRegister ? "Konto wird erstellt..." : "Anmeldung läuft...",
          alternatePrompt: isRegister ? "Schon ein Konto?" : "Noch kein Konto?",
          alternateCta: isRegister ? "Anmelden" : "Registrieren",
          alternateHref: isRegister ? "/login" : "/register",
          panelEyebrow: "/ Direkt ins Dashboard",
          panelTitle: "Sauberer Einstieg ohne zusätzlichen Umweg",
          panelBody:
            "Nach dem Absenden leiten wir direkt auf die bestehende Projektübersicht weiter, damit dein Dashboard sofort erreichbar ist.",
          points: [
            "Schneller Einstieg in Projekte, Glossar und Usage",
            "Klarer Flow für Desktop und Mobile",
            "Direkter Sprung in das vorhandene Dashboard"
          ]
        }
      : {
          backHome: "Back to landing page",
          badge: isRegister ? "Launch a new workspace" : "Return to your workspace",
          heading: isRegister ? "Create account" : "Sign in",
          description: isRegister
            ? "Set up your access and move straight into the dashboard."
            : "Sign in and jump straight back into your dashboard.",
          name: "Full name",
          workspace: "Workspace name",
          email: "Email",
          password: "Password",
          submit: isRegister ? "Create account" : "Sign in now",
          submitting: isRegister ? "Creating account..." : "Signing in...",
          alternatePrompt: isRegister ? "Already have an account?" : "Need an account?",
          alternateCta: isRegister ? "Sign in" : "Register",
          alternateHref: isRegister ? "/login" : "/register",
          panelEyebrow: "/ Straight into the dashboard",
          panelTitle: "Clean entry without an extra detour",
          panelBody:
            "After submit, the flow redirects directly to the existing project overview so the dashboard is immediately reachable.",
          points: [
            "Fast entry into projects, glossary, and usage",
            "Clear flow for desktop and mobile",
            "Direct jump into the existing dashboard"
          ]
        };

  useEffect(() => {
    router.prefetch("/projects");
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    startTransition(() => {
      router.push("/projects");
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(17,17,16,0.06),_transparent_35%),linear-gradient(180deg,_#fcfcfa_0%,_#f3f0e9_100%)] px-5 py-6 text-[var(--foreground)] sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col rounded-[32px] border border-[rgba(17,17,16,0.08)] bg-[rgba(255,255,255,0.88)] p-4 shadow-[0_24px_80px_rgba(17,17,16,0.08)] backdrop-blur sm:p-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:p-8">
        <section className="flex flex-col justify-between rounded-[28px] bg-[linear-gradient(160deg,_rgba(17,17,16,0.98)_0%,_rgba(41,56,52,0.94)_100%)] p-7 text-white">
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[12px] font-medium text-white/74 transition hover:text-white"
            >
              <span className="text-[15px]">←</span>
              {copy.backHome}
            </Link>

            <div className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/72">
              {copy.badge}
            </div>

            <div className="max-w-md space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-[46px]">
                {copy.heading}
              </h1>
              <p className="max-w-sm text-[15px] leading-7 text-white/74">{copy.description}</p>
            </div>
          </div>

          <div className="mt-10 rounded-[24px] border border-white/10 bg-white/8 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/54">
              {copy.panelEyebrow}
            </p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
              {copy.panelTitle}
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-white/72">{copy.panelBody}</p>
            <div className="mt-5 space-y-3">
              {copy.points.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-black/10 px-4 py-3 text-[13px] text-white/78"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/10 text-[12px]">
                    ✓
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center py-6 lg:py-0">
          <div className="w-full rounded-[28px] border border-[rgba(17,17,16,0.08)] bg-white p-6 shadow-[0_18px_55px_rgba(17,17,16,0.05)] sm:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {isRegister ? (
                <>
                  <FormField
                    label={copy.name}
                    value={formValues.name}
                    onChange={(value) => setFormValues((current) => ({ ...current, name: value }))}
                    placeholder={locale === "de" ? "Max Mustermann" : "Jane Doe"}
                  />
                  <FormField
                    label={copy.workspace}
                    value={formValues.workspace}
                    onChange={(value) => setFormValues((current) => ({ ...current, workspace: value }))}
                    placeholder={locale === "de" ? "Acme Lokalisierung" : "Acme Localization"}
                  />
                </>
              ) : null}

              <FormField
                label={copy.email}
                type="email"
                value={formValues.email}
                onChange={(value) => setFormValues((current) => ({ ...current, email: value }))}
                placeholder={locale === "de" ? "team@firma.de" : "team@company.com"}
              />
              <FormField
                label={copy.password}
                type="password"
                value={formValues.password}
                onChange={(value) => setFormValues((current) => ({ ...current, password: value }))}
                placeholder="••••••••"
                minLength={8}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[var(--foreground)] px-5 text-[14px] font-medium text-white transition hover:opacity-92 disabled:cursor-progress disabled:opacity-70"
              >
                {isSubmitting ? copy.submitting : copy.submit}
              </button>
            </form>

            <div className="mt-6 border-t border-[var(--border-light)] pt-5 text-center text-[13px] text-[var(--muted)]">
              <span>{copy.alternatePrompt} </span>
              <Link href={copy.alternateHref} className="font-medium text-[var(--foreground)]">
                {copy.alternateCta}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type FormFieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "password" | "text";
  value: string;
  minLength?: number;
};

function FormField({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
  minLength
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
        {label}
      </span>
      <input
        type={type}
        required
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[16px] border border-[var(--border)] bg-[var(--background-strong)] px-4 text-[14px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:bg-white"
      />
    </label>
  );
}
