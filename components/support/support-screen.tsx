"use client";

import Link from "next/link";

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
          intro: "Ein klarer Support-Einstieg mit einem Kontaktweg, direkter Dokumentation und einer kurzen Checkliste für schnellere Lösungen.",
          contactEyebrow: "/ Kontakt",
          contactTitle: "Support",
          contactDescription:
            "Für Produktfragen, Datei-Probleme, Billing-Themen und operative Blocker läuft alles über einen klaren Eingang.",
          emailSupport: "Support per E-Mail",
          emailSupportDescription: "Der richtige Kanal für Konto-Fragen, Übersetzungsfehler, Import-/Export-Probleme und Billing-Themen.",
          emailSupportMeta: "Übliche Antwort innerhalb eines Werktags.",
          emailSupportAction: "Support anschreiben",
          supportScopeTitle: "Womit wir schnell helfen können",
          supportScopeItems: [
            "Dateiimport, Übersetzungsausgabe, Export und QA-Blocker",
            "Workspace-, Konto- und Billing-Themen",
            "Glossar-, Tag- und Format-Probleme in produktiven Flows"
          ],
          guidesEyebrow: "/ Hilfe",
          guidesTitle: "Guides und Dokumentation",
          guidesDescription: "Die wichtigsten Einstiege, bevor du ein Ticket öffnest oder wenn du dir selbst sofort helfen willst.",
          gettingStarted: "Erste Schritte",
          gettingStartedDescription: "Projekt-Setup, Sprach-Standards und erster Übersetzungs-Workflow.",
          gettingStartedAction: "Dokumentation öffnen",
          glossaryGuide: "Glossar-Guide",
          glossaryGuideDescription: "Wie geteilte Begriffe, strikter Glossar-Modus und Begriffsprüfung funktionieren.",
          glossaryGuideAction: "Zum Glossar",
          fileHandling: "Dateiverarbeitung",
          fileHandlingDescription: "XLIFF-Importe, Tag-Schutz-Verhalten und Export-Standards.",
          fileHandlingAction: "API & Dateiformate",
          checklistEyebrow: "/ Best Practice",
          checklistTitle: "Bevor du den Support kontaktierst",
          checklistDescription: "Eine kurze Checkliste, die das übliche Hin und Her bei Übersetzungsproblemen reduziert.",
          checklistItems: [
            "Nenne Projektnamen, Quellsprache, Zielsprache und den exakten Schritt, an dem das Problem aufgetreten ist.",
            "Bei Dateiproblemen gib an, ob das Problem aus Import, Übersetzungsausgabe, Glossar-Regeln oder Export stammt.",
            "Wenn das Problem die Auslieferung blockiert, sag das explizit, damit es korrekt triagiert werden kann."
          ],
          checklistNoteTitle: "Hilfreich für schnellere Analyse",
          checklistNoteBody:
            "Wenn möglich, schicke die betroffene Datei, einen Screenshot oder den exakten Fehlertext direkt mit."
        }
      : {
          eyebrow: "/ Support",
          heading: "Support",
          intro: "A cleaner support entry point with one contact path, direct documentation, and a short checklist for faster resolution.",
          contactEyebrow: "/ Contact",
          contactTitle: "Support",
          contactDescription:
            "Use one clear channel for product questions, file issues, billing topics, and operational blockers.",
          emailSupport: "Email support",
          emailSupportDescription: "The right channel for account questions, translation issues, import/export failures, and billing topics.",
          emailSupportMeta: "Typical response within one business day.",
          emailSupportAction: "Email support",
          supportScopeTitle: "Best handled here",
          supportScopeItems: [
            "Import, translation output, export, and QA blockers",
            "Workspace, account, and billing issues",
            "Glossary, tag, and file-format problems in production flows"
          ],
          guidesEyebrow: "/ Help",
          guidesTitle: "Guides and documentation",
          guidesDescription: "The fastest references to check before opening a ticket or when you need an answer immediately.",
          gettingStarted: "Getting started",
          gettingStartedDescription: "Project setup, language defaults, and first translation workflow.",
          gettingStartedAction: "Open docs",
          glossaryGuide: "Glossary guide",
          glossaryGuideDescription: "How shared terms, strict glossary mode, and term review work.",
          glossaryGuideAction: "Open glossary",
          fileHandling: "File handling",
          fileHandlingDescription: "XLIFF imports, tag protection behavior, and export defaults.",
          fileHandlingAction: "API & file formats",
          checklistEyebrow: "/ Best Practice",
          checklistTitle: "Before you contact support",
          checklistDescription: "A short checklist that removes the usual back-and-forth for translation issues.",
          checklistItems: [
            "Include the project name, source language, target language, and the exact step where the issue happened.",
            "For file issues, mention whether the problem came from import, translation output, glossary enforcement, or export.",
            "If the issue is blocking delivery, say that explicitly so it can be triaged correctly."
          ],
          checklistNoteTitle: "Helpful for faster triage",
          checklistNoteBody:
            "If possible, attach the affected file, a screenshot, or the exact error message in the first message."
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
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                <SupportChannelCard
                  title={copy.emailSupport}
                  description={copy.emailSupportDescription}
                  value="support@translayr.dev"
                  meta={copy.emailSupportMeta}
                  actionLabel={copy.emailSupportAction}
                  href="mailto:support@translayr.dev"
                />
                <SupportListCard title={copy.supportScopeTitle} items={copy.supportScopeItems} />
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
                  href="/docs"
                  actionLabel={copy.gettingStartedAction}
                />
                <SupportResourceCard
                  title={copy.glossaryGuide}
                  description={copy.glossaryGuideDescription}
                  href="/glossary"
                  actionLabel={copy.glossaryGuideAction}
                />
                <SupportResourceCard
                  title={copy.fileHandling}
                  description={copy.fileHandlingDescription}
                  href="/developer-api"
                  actionLabel={copy.fileHandlingAction}
                />
              </div>
            </SupportPanel>
          </div>

          <div className="space-y-5">
            <SupportPanel
              eyebrow={copy.checklistEyebrow}
              title={copy.checklistTitle}
              description={copy.checklistDescription}
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  {copy.checklistItems.map((item, index) => (
                    <SupportChecklistItem key={item} index={index + 1} text={item} />
                  ))}
                </div>
                <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
                  <p className="text-[12px] font-medium text-[var(--foreground)]">{copy.checklistNoteTitle}</p>
                  <p className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">{copy.checklistNoteBody}</p>
                </div>
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
    <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-5 py-5">
      <p className="text-[13px] font-medium text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">{description}</p>
      <p className="mt-5 text-[18px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">{value}</p>
      <p className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">{meta}</p>
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

function SupportListCard({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-5 py-5">
      <p className="text-[13px] font-medium text-[var(--foreground)]">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 text-[11.5px] leading-5 text-[var(--muted)]">
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportResourceCard({
  title,
  description,
  href,
  actionLabel
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
      <p className="text-[13px] font-medium text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center justify-center rounded-[12px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function SupportChecklistItem({
  index,
  text
}: {
  index: number;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[11px] font-semibold text-[var(--foreground)]">
        {index}
      </span>
      <p className="pt-[1px] text-[11.5px] leading-5 text-[var(--muted)]">{text}</p>
    </div>
  );
}
