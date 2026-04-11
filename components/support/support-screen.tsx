"use client";

import { useAppLocale } from "@/components/app-locale-provider";
import type { ReactNode } from "react";
import type { SettingsScreenData } from "@/types/workspace";

type SupportScreenProps = {
  data: SettingsScreenData;
};

export function SupportScreen({ data }: SupportScreenProps) {
  const providerLocale = useAppLocale();
  const locale = data.preferences.locale ?? providerLocale;
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Support",
          heading: "Support",
          intro: "Hilfe, Kontaktwege und operative Hinweise in einer eigenen Fläche statt versteckt in den Einstellungen.",
          contactEyebrow: "/ Kontakt",
          contactTitle: "Support-Kanäle",
          contactDescription:
            "Nutze den schnellsten Weg, je nachdem ob du Produkthilfe, operative Klarheit oder Konto-Unterstützung brauchst.",
          emailSupport: "Support per E-Mail",
          emailSupportDescription: "Am besten für Kontofragen, Produktprobleme und Workflow-Hilfe.",
          emailSupportMeta: "Übliche Antwort innerhalb eines Werktags.",
          emailSupportAction: "Support anschreiben",
          priorityChannel: "Prioritätskanal",
          priorityChannelDescription: "Für planspezifische Eskalationen und kritische Produktions-Blocker.",
          priorityChannelMeta: "Anfragen werden über deine Workspace-Kontakt-E-Mail geroutet.",
          priorityChannelAction: "Konto-E-Mail verwenden",
          guidesEyebrow: "/ Hilfe",
          guidesTitle: "Guides und Dokumentation",
          guidesDescription: "Eine kompakte Support-Fläche für Material, das Nutzer typischerweise vor einem Ticket brauchen.",
          gettingStarted: "Erste Schritte",
          gettingStartedDescription: "Projekt-Setup, Sprach-Standards und erster Übersetzungs-Workflow.",
          glossaryGuide: "Glossar-Guide",
          glossaryGuideDescription: "Wie geteilte Begriffe, strikter Glossar-Modus und Begriffsprüfung funktionieren.",
          fileHandling: "Dateiverarbeitung",
          fileHandlingDescription: "XLIFF-Importe, Tag-Schutz-Verhalten und Export-Standards.",
          serviceEyebrow: "/ Service",
          serviceTitle: "Betriebsstatus",
          serviceDescription: "Halte die wichtigsten Service-Infos sichtbar, ohne die Oberfläche in ein Dashboard zu verwandeln.",
          serviceStatusTitle: "API und Übersetzungswarteschlange",
          serviceStatusDescription: "Aktuell keine Vorfälle. Die Kern-Übersetzungsdienste laufen normal.",
          serviceHealthy: "Stabil",
          workspaceContact: "Workspace-Kontakt",
          supportWindow: "Support-Fenster",
          supportWindowValue: "Mo-Fr, 09:00-17:00 CET",
          criticalIssues: "Kritische Probleme",
          criticalIssuesValue: "Mit Prioritäts-Triage behandelt",
          checklistEyebrow: "/ Best Practice",
          checklistTitle: "Bevor du den Support kontaktierst",
          checklistDescription: "Eine kurze Checkliste, die das übliche Hin und Her bei Übersetzungsproblemen reduziert.",
          checklistItems: [
            "Nenne Projektnamen, Quellsprache, Zielsprache und den exakten Schritt, an dem das Problem aufgetreten ist.",
            "Bei Dateiproblemen gib an, ob das Problem aus Import, Übersetzungsausgabe, Glossar-Regeln oder Export stammt.",
            "Wenn das Problem die Auslieferung blockiert, sag das explizit, damit es korrekt triagiert werden kann."
          ]
        }
      : {
          eyebrow: "/ Support",
          heading: "Support",
          intro: "Help, contact paths, and operational guidance in a dedicated surface instead of burying them inside settings.",
          contactEyebrow: "/ Contact",
          contactTitle: "Support channels",
          contactDescription:
            "Use the fastest path depending on whether you need product help, operational clarity, or account assistance.",
          emailSupport: "Email support",
          emailSupportDescription: "Best for account questions, product issues, and workflow guidance.",
          emailSupportMeta: "Typical response within one business day.",
          emailSupportAction: "Email support",
          priorityChannel: "Priority channel",
          priorityChannelDescription: "For plan-specific escalations and critical production blockers.",
          priorityChannelMeta: "Requests are routed through your workspace contact email.",
          priorityChannelAction: "Use account email",
          guidesEyebrow: "/ Help",
          guidesTitle: "Guides and documentation",
          guidesDescription: "A compact support surface for the material users typically need before opening a ticket.",
          gettingStarted: "Getting started",
          gettingStartedDescription: "Project setup, language defaults, and first translation workflow.",
          glossaryGuide: "Glossary guide",
          glossaryGuideDescription: "How shared terms, strict glossary mode, and term review work.",
          fileHandling: "File handling",
          fileHandlingDescription: "XLIFF imports, tag protection behavior, and export defaults.",
          serviceEyebrow: "/ Service",
          serviceTitle: "Operational status",
          serviceDescription: "Keep the most relevant service information visible without turning the surface into a dashboard.",
          serviceStatusTitle: "API and translation queue",
          serviceStatusDescription: "No current incidents. Core translation services are operating normally.",
          serviceHealthy: "Healthy",
          workspaceContact: "Workspace contact",
          supportWindow: "Support window",
          supportWindowValue: "Mon-Fri, 09:00-17:00 CET",
          criticalIssues: "Critical issues",
          criticalIssuesValue: "Handled with priority triage",
          checklistEyebrow: "/ Best Practice",
          checklistTitle: "Before you contact support",
          checklistDescription: "A short checklist that removes the usual back-and-forth for translation issues.",
          checklistItems: [
            "Include the project name, source language, target language, and the exact step where the issue happened.",
            "For file issues, mention whether the problem came from import, translation output, glossary enforcement, or export.",
            "If the issue is blocking delivery, say that explicitly so it can be triaged correctly."
          ]
        };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="max-w-[820px]">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            {copy.eyebrow}
          </span>
          <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
            {copy.heading}
          </h1>
          <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">
            {copy.intro}
          </p>
        </div>
      </header>

      <div className="px-7 py-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
          <div className="space-y-5">
            <SupportPanel
              eyebrow={copy.contactEyebrow}
              title={copy.contactTitle}
              description={copy.contactDescription}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SupportChannelCard
                  title={copy.emailSupport}
                  description={copy.emailSupportDescription}
                  value="support@translayr.dev"
                  meta={copy.emailSupportMeta}
                  actionLabel={copy.emailSupportAction}
                  href="mailto:support@translayr.dev"
                />
                <SupportChannelCard
                  title={copy.priorityChannel}
                  description={copy.priorityChannelDescription}
                  value={data.profile.email}
                  meta={copy.priorityChannelMeta}
                  actionLabel={copy.priorityChannelAction}
                />
              </div>
            </SupportPanel>

            <SupportPanel
              eyebrow={copy.guidesEyebrow}
              title={copy.guidesTitle}
              description={copy.guidesDescription}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <SupportResourceCard
                  title={copy.gettingStarted}
                  description={copy.gettingStartedDescription}
                />
                <SupportResourceCard
                  title={copy.glossaryGuide}
                  description={copy.glossaryGuideDescription}
                />
                <SupportResourceCard
                  title={copy.fileHandling}
                  description={copy.fileHandlingDescription}
                />
              </div>
            </SupportPanel>
          </div>

          <div className="space-y-5">
            <SupportPanel
              eyebrow={copy.serviceEyebrow}
              title={copy.serviceTitle}
              description={copy.serviceDescription}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--foreground)]">{copy.serviceStatusTitle}</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">
                      {copy.serviceStatusDescription}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--foreground)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    {copy.serviceHealthy}
                  </span>
                </div>

                <div className="space-y-3">
                  <SupportDetailRow label={copy.workspaceContact} value={data.profile.email} />
                  <SupportDetailRow label={copy.supportWindow} value={copy.supportWindowValue} />
                  <SupportDetailRow label={copy.criticalIssues} value={copy.criticalIssuesValue} />
                </div>
              </div>
            </SupportPanel>

            <SupportPanel
              eyebrow={copy.checklistEyebrow}
              title={copy.checklistTitle}
              description={copy.checklistDescription}
            >
              <div className="space-y-3 text-[12px] leading-6 text-[var(--muted)]">
                {copy.checklistItems.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </SupportPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportPanel({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-[var(--border)] bg-white p-5">
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
        {title}
      </h2>
      <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SupportChannelCard({
  title,
  description,
  value,
  meta,
  actionLabel,
  href
}: {
  title: string;
  description: string;
  value: string;
  meta: string;
  actionLabel: string;
  href?: string;
}) {
  const actionClassName =
    "inline-flex items-center justify-center rounded-[12px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]";

  return (
    <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
      <p className="text-[13px] font-medium text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">{description}</p>
      <p className="mt-4 text-[14px] font-medium text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">{meta}</p>
      {href ? (
        <a href={href} className={["mt-4", actionClassName].join(" ")}>
          {actionLabel}
        </a>
      ) : (
        <div className={["mt-4", actionClassName].join(" ")}>{actionLabel}</div>
      )}
    </div>
  );
}

function SupportResourceCard({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
      <p className="text-[13px] font-medium text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function SupportDetailRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12px]">
      <span className="text-[var(--muted-soft)]">{label}</span>
      <span className="text-right font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
