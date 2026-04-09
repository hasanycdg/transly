"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { BILLING_PLANS } from "@/lib/billing/plans";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";

type Locale = "en" | "de";

type SectionId =
  | "quick-start"
  | "translation-workflows"
  | "supported-formats"
  | "glossary"
  | "projects"
  | "usage-billing"
  | "settings"
  | "notifications"
  | "team-access"
  | "faq";

type SectionDefinition = {
  id: SectionId;
  label: string;
  labelDE: string;
};

const DOC_SECTIONS: SectionDefinition[] = [
  { id: "quick-start", label: "Quick start", labelDE: "Schnellstart" },
  {
    id: "translation-workflows",
    label: "Translation workflows",
    labelDE: "Übersetzungs-Workflows"
  },
  { id: "supported-formats", label: "Supported formats", labelDE: "Unterstützte Formate" },
  { id: "glossary", label: "Glossary", labelDE: "Glossar" },
  { id: "projects", label: "Projects", labelDE: "Projekte" },
  { id: "usage-billing", label: "Usage & billing", labelDE: "Nutzung & Billing" },
  { id: "settings", label: "Settings", labelDE: "Einstellungen" },
  { id: "notifications", label: "Notifications", labelDE: "Benachrichtigungen" },
  { id: "team-access", label: "Team access", labelDE: "Teamzugriff" },
  { id: "faq", label: "FAQ", labelDE: "FAQ" }
];

const SUPPORTED_FORMATS = [
  ".xliff",
  ".xlf",
  ".po",
  ".strings",
  ".resx",
  ".xml",
  ".csv",
  ".txt",
  ".docx",
  ".pptx",
  ".zip"
];

const FILE_STATUSES = ["Queued", "Processing", "Review", "Done", "Error"];
const PROJECT_STATUSES = ["Active", "In Review", "Completed", "Error"];
const TONE_OPTIONS = ["Neutral", "Formal", "Informal", "Marketing", "Technical"];
const AI_BEHAVIORS = ["Fast", "Balanced", "High Quality"];
const WORKSPACE_ROLES = ["owner", "admin", "editor", "reviewer", "viewer"];
const MEMBER_STATUSES = ["invited", "active", "disabled"];
const NOTIFICATION_CHANNELS = [
  "translation_complete_email",
  "invoice_created_email",
  "payment_failed_email",
  "spending_limit_email",
  "review_reminders",
  "in_app_notifications"
];

function t(locale: Locale, en: string, de: string) {
  return locale === "de" ? de : en;
}

function formatCredits(locale: Locale, value: number) {
  const formatted = new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US").format(value);
  return `${formatted} ${t(locale, "credits", "Credits")}`;
}

function formatPrice(locale: Locale, cents: number) {
  if (cents <= 0) {
    return t(locale, "Free", "Kostenlos");
  }

  const amount = new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);

  return `${amount}/${t(locale, "month", "Monat")}`;
}

export default function DocsPage() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLocale = window.localStorage.getItem("translayr-marketing-locale");

    return storedLocale === "en" || storedLocale === "de" ? storedLocale : "en";
  });
  const [activeSection, setActiveSection] = useState<SectionId>("quick-start");

  const planCards = useMemo(
    () =>
      BILLING_PLANS.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: formatPrice(locale, plan.basePriceCents),
        credits: formatCredits(locale, plan.creditsLimit)
      })),
    [locale]
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-7 lg:px-8">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            / {t(locale, "Documentation", "Dokumentation")}
          </p>
          <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2.6rem,4vw,4.2rem)] leading-[0.92]`}>
            {t(locale, "Translayr docs", "Translayr Doku")}
          </h1>
          <p className="mt-4 max-w-[700px] text-[15px] leading-8 text-[var(--muted)]">
            {t(
              locale,
              "A complete product guide based on the current implementation: workflows, formats, glossary, billing, settings, notifications, and team access.",
              "Ein vollständiger Produktleitfaden auf Basis der aktuellen Implementierung: Workflows, Formate, Glossar, Billing, Einstellungen, Benachrichtigungen und Teamzugriff."
            )}
          </p>

          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={() => {
                setLocale("en");
                window.localStorage.setItem("translayr-marketing-locale", "en");
              }}
              className={[
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition",
                locale === "en"
                  ? "bg-[var(--foreground)] text-[var(--surface)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              ].join(" ")}
            >
              EN
            </button>
            <button
              onClick={() => {
                setLocale("de");
                window.localStorage.setItem("translayr-marketing-locale", "de");
              }}
              className={[
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition",
                locale === "de"
                  ? "bg-[var(--foreground)] text-[var(--surface)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              ].join(" ")}
            >
              DE
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-[14px] !bg-[#2d2d2a] px-5 text-[13px] font-medium !text-white transition hover:!bg-[#3a3a36]"
              style={{ backgroundColor: "#2d2d2a", color: "#ffffff" }}
            >
              {t(locale, "Start free", "Kostenlos starten")}
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
            >
              {t(locale, "Back to landing page", "Zur Landingpage")}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
            >
              {t(locale, "View pricing", "Preise ansehen")}
            </Link>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav className="sticky top-8 self-start">
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
                {t(locale, "Contents", "Inhalt")}
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {DOC_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={[
                      "rounded-[10px] px-3 py-2 text-left text-[13px] font-medium transition",
                      activeSection === section.id
                        ? "bg-[var(--background-strong)] text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:bg-[var(--background-strong)] hover:text-[var(--foreground)]"
                    ].join(" ")}
                  >
                    {locale === "de" ? section.labelDE : section.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="space-y-6">
            {activeSection === "quick-start" ? <QuickStartSection locale={locale} /> : null}
            {activeSection === "translation-workflows" ? (
              <TranslationWorkflowSection locale={locale} />
            ) : null}
            {activeSection === "supported-formats" ? (
              <SupportedFormatsSection locale={locale} />
            ) : null}
            {activeSection === "glossary" ? <GlossarySection locale={locale} /> : null}
            {activeSection === "projects" ? <ProjectsSection locale={locale} /> : null}
            {activeSection === "usage-billing" ? (
              <UsageBillingSection locale={locale} planCards={planCards} />
            ) : null}
            {activeSection === "settings" ? <SettingsSection locale={locale} /> : null}
            {activeSection === "notifications" ? <NotificationsSection locale={locale} /> : null}
            {activeSection === "team-access" ? <TeamAccessSection locale={locale} /> : null}
            {activeSection === "faq" ? <FaqSection locale={locale} /> : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function QuickStartSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Quick start", "Schnellstart")}
      intro={t(
        locale,
        "Use this order to get from signup to production-ready exports without extra setup loops.",
        "Nutze diese Reihenfolge, um von der Registrierung bis zu produktionsreifen Exporten ohne zusätzliche Setup-Schleifen zu kommen."
      )}
    >
      <NumberedSteps
        items={[
          t(
            locale,
            "Create an account at /register and open your first workspace.",
            "Erstelle ein Konto unter /register und öffne deinen ersten Workspace."
          ),
          t(
            locale,
            "Set default source/target language, tone, and AI behavior under Settings -> Translation.",
            "Lege Standard-Quell-/Zielsprache, Ton und KI-Verhalten unter Einstellungen -> Übersetzung fest."
          ),
          t(
            locale,
            "Create a project, choose source/target languages, then upload files or run text translation.",
            "Erstelle ein Projekt, wähle Quell-/Zielsprachen und lade dann Dateien hoch oder starte Textübersetzungen."
          ),
          t(
            locale,
            "Review file status in Projects and download outputs when files are Done or in Review.",
            "Prüfe den Dateistatus in Projekte und lade Ausgaben herunter, sobald Dateien Done oder Review sind."
          ),
          t(
            locale,
            "Track credit consumption in Usage and adjust plan/top-ups in Billing.",
            "Verfolge den Credit-Verbrauch in Nutzung und passe Plan/Top-ups in Billing an."
          )
        ]}
      />

      <Callout
        locale={locale}
        title={t(locale, "Important", "Wichtig")}
        body={t(
          locale,
          "One credit equals one word. File and text translations both consume from the same cycle limit.",
          "Ein Credit entspricht einem Wort. Datei- und Textübersetzungen nutzen dasselbe Zykluslimit."
        )}
      />
    </SectionCard>
  );
}

function TranslationWorkflowSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Translation workflows", "Übersetzungs-Workflows")}
      intro={t(
        locale,
        "Translayr has two primary flows: file translation and direct text translation.",
        "Translayr hat zwei primäre Flows: Dateiübersetzung und direkte Textübersetzung."
      )}
    >
      <SubTitle>{t(locale, "File translation", "Dateiübersetzung")}</SubTitle>
      <BulletList
        items={[
          t(
            locale,
            "Upload in Projects using drag-and-drop or file picker.",
            "Upload in Projekte per Drag-and-drop oder Dateiauswahl."
          ),
          t(
            locale,
            "ZIP archives are unpacked automatically. Supported files inside ZIP are queued, unsupported files are ignored.",
            "ZIP-Archive werden automatisch entpackt. Unterstützte Dateien im ZIP werden in die Queue gestellt, nicht unterstützte ignoriert."
          ),
          t(
            locale,
            "XLIFF can use embedded source language. For non-XLIFF formats, source language fallback must be available.",
            "XLIFF kann die eingebettete Quellsprache nutzen. Für Nicht-XLIFF-Formate muss eine Quellsprachen-Fallback verfügbar sein."
          ),
          t(
            locale,
            "Output filename follows your selected naming pattern from Preferences.",
            "Der Ausgabedateiname folgt dem in Präferenzen gewählten Namensschema."
          )
        ]}
      />

      <SubTitle>{t(locale, "Text translation", "Textübersetzung")}</SubTitle>
      <BulletList
        items={[
          t(
            locale,
            "Use /translate for quick snippets, UI text, and QA checks.",
            "Nutze /translate für kurze Snippets, UI-Texte und QA-Checks."
          ),
          t(
            locale,
            "Source language can be auto-detected or set manually.",
            "Die Quellsprache kann automatisch erkannt oder manuell gesetzt werden."
          ),
          t(
            locale,
            `Available tone styles: ${TONE_OPTIONS.join(", ")}.`,
            `Verfügbare Tonstile: ${TONE_OPTIONS.join(", ")}.`
          ),
          t(
            locale,
            "Results can be copied to clipboard or exported as TXT.",
            "Ergebnisse können in die Zwischenablage kopiert oder als TXT exportiert werden."
          )
        ]}
      />
    </SectionCard>
  );
}

function SupportedFormatsSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Supported formats", "Unterstützte Formate")}
      intro={t(
        locale,
        "These extensions are accepted by the project upload flow and translation API.",
        "Diese Endungen werden vom Projekt-Upload und der Übersetzungs-API akzeptiert."
      )}
    >
      <div className="flex flex-wrap gap-2">
        {SUPPORTED_FORMATS.map((format) => (
          <span
            key={format}
            className="inline-flex items-center rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[12px] font-medium text-[var(--foreground)]"
          >
            {format}
          </span>
        ))}
      </div>

      <Callout
        locale={locale}
        title="ZIP"
        body={t(
          locale,
          "When you upload ZIP archives, Translayr extracts files and adds only supported translation files to the queue.",
          "Beim Upload von ZIP-Archiven extrahiert Translayr die Dateien und fügt nur unterstützte Übersetzungsdateien zur Queue hinzu."
        )}
      />
    </SectionCard>
  );
}

function GlossarySection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Glossary", "Glossar")}
      intro={t(
        locale,
        "Glossary terms can be created manually or imported via CSV and applied automatically during translation.",
        "Glossarbegriffe können manuell erstellt oder per CSV importiert und während der Übersetzung automatisch angewendet werden."
      )}
    >
      <SubTitle>{t(locale, "Term statuses", "Begriffsstatus")}</SubTitle>
      <BulletList items={["Approved", "Review", "Draft", "Archived"]} />

      <SubTitle>{t(locale, "CSV import", "CSV-Import")}</SubTitle>
      <BulletList
        items={[
          t(locale, "Required column: source", "Pflichtspalte: source"),
          t(
            locale,
            "Optional metadata columns: source_language, status, collection, project, protected",
            "Optionale Metadaten-Spalten: source_language, status, collection, project, protected"
          ),
          t(
            locale,
            "Translation columns: locale headers like de, fr, or translation:de",
            "Übersetzungsspalten: Locale-Header wie de, fr oder translation:de"
          )
        ]}
      />

      <Callout
        locale={locale}
        title={t(locale, "Runtime behavior", "Laufzeitverhalten")}
        body={t(
          locale,
          "If glossary auto mode is enabled, relevant terms are injected at runtime. Protected terms remain locked.",
          "Wenn der Glossar-Automodus aktiv ist, werden relevante Begriffe zur Laufzeit injiziert. Geschützte Begriffe bleiben gesperrt."
        )}
      />
    </SectionCard>
  );
}

function ProjectsSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Projects", "Projekte")}
      intro={t(
        locale,
        "Projects are the central place for file queues, progress tracking, and exports.",
        "Projekte sind der zentrale Ort für Datei-Queues, Fortschrittskontrolle und Exporte."
      )}
    >
      <SubTitle>{t(locale, "Project statuses", "Projektstatus")}</SubTitle>
      <BulletList items={PROJECT_STATUSES} />

      <SubTitle>{t(locale, "File statuses", "Dateistatus")}</SubTitle>
      <BulletList items={FILE_STATUSES} />

      <BulletList
        items={[
          t(
            locale,
            "Project status is derived from file states (for example, any Error file marks the project as Error).",
            "Der Projektstatus wird aus den Dateistatus abgeleitet (zum Beispiel markiert jede Error-Datei das Projekt als Error)."
          ),
          t(
            locale,
            "Project exports are tracked with format and timestamp metadata.",
            "Projekt-Exporte werden mit Format- und Zeitstempel-Metadaten erfasst."
          )
        ]}
      />
    </SectionCard>
  );
}

function UsageBillingSection({
  locale,
  planCards
}: {
  locale: Locale;
  planCards: Array<{ id: string; name: string; price: string; credits: string }>;
}) {
  return (
    <SectionCard
      title={t(locale, "Usage & billing", "Nutzung & Billing")}
      intro={t(
        locale,
        "Usage and billing are tied to active cycle limits and tracked per workspace.",
        "Nutzung und Billing sind an aktive Zykluslimits gebunden und werden pro Workspace erfasst."
      )}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {planCards.map((plan) => (
          <div
            key={plan.id}
            className="rounded-[14px] border border-[var(--border)] bg-[var(--background)] p-4"
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted-soft)]">{plan.id}</p>
            <p className="mt-1 text-[16px] font-semibold text-[var(--foreground)]">{plan.name}</p>
            <p className="mt-2 text-[13px] text-[var(--foreground)]">{plan.price}</p>
            <p className="mt-1 text-[12px] text-[var(--muted)]">{plan.credits}</p>
          </div>
        ))}
      </div>

      <BulletList
        items={[
          t(
            locale,
            "Paid plans are billed monthly (excl. VAT) and open Stripe Checkout for new subscriptions.",
            "Bezahlte Pläne werden monatlich (zzgl. USt.) berechnet und öffnen für neue Abos Stripe Checkout."
          ),
          t(
            locale,
            "Credit packs are one-time top-ups and are available only with an active subscription.",
            "Credit-Pakete sind einmalige Top-ups und nur mit aktivem Abo verfügbar."
          ),
          t(
            locale,
            "Usage page shows credits used, remaining usage, percent consumed, and reset date.",
            "Die Nutzungsseite zeigt verbrauchte Credits, verbleibende Nutzung, Verbrauchsanteil und Reset-Datum."
          )
        ]}
      />
    </SectionCard>
  );
}

function SettingsSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Settings", "Einstellungen")}
      intro={t(
        locale,
        "Settings are split into profile, translation defaults, preferences, and danger zone.",
        "Einstellungen sind in Profil, Übersetzungsstandards, Präferenzen und Gefahrenzone aufgeteilt."
      )}
    >
      <SubTitle>{t(locale, "Translation defaults", "Übersetzungsstandards")}</SubTitle>
      <BulletList
        items={[
          t(
            locale,
            "Source language mode: auto or manual fallback",
            "Quellsprachenmodus: automatisch oder manueller Fallback"
          ),
          t(locale, "Default target language", "Standard-Zielsprache"),
          t(locale, `Tone style: ${TONE_OPTIONS.join(", ")}`, `Tonstil: ${TONE_OPTIONS.join(", ")}`),
          t(
            locale,
            "Tag protection controls: strict tag protection and fail on tag mismatch",
            "Tag-Schutzoptionen: strenger Tag-Schutz und Abbruch bei Tag-Konflikten"
          ),
          t(
            locale,
            "Glossary runtime controls: auto mode and strict glossary mode",
            "Glossar-Laufzeitoptionen: Automodus und strikter Glossarmodus"
          ),
          t(locale, `AI behavior: ${AI_BEHAVIORS.join(", ")}`, `KI-Verhalten: ${AI_BEHAVIORS.join(", ")}`)
        ]}
      />

      <SubTitle>{t(locale, "Preferences", "Präferenzen")}</SubTitle>
      <BulletList
        items={[
          t(locale, "App locale (English or German)", "App-Sprache (Englisch oder Deutsch)"),
          t(
            locale,
            "Auto-download after translation",
            "Automatischer Download nach der Übersetzung"
          ),
          t(
            locale,
            "Filename pattern: Original + target locale, Original + source + target, or Project slug + locale",
            "Dateinamenmuster: Original + Ziel-Locale, Original + Quelle + Ziel oder Projekt-Slug + Locale"
          )
        ]}
      />

      <Callout
        locale={locale}
        title={t(locale, "Profile and security", "Profil und Sicherheit")}
        body={t(
          locale,
          "Profile includes name, company, billing address, and password reset trigger.",
          "Im Profil verwaltest du Name, Firma, Rechnungsadresse und den Passwort-Reset."
        )}
      />
    </SectionCard>
  );
}

function NotificationsSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Notifications", "Benachrichtigungen")}
      intro={t(
        locale,
        "Notification rules are managed on /notifications, separate from settings sections.",
        "Benachrichtigungsregeln werden auf /notifications verwaltet, getrennt von den Einstellungsbereichen."
      )}
    >
      <SubTitle>{t(locale, "Available channels", "Verfügbare Kanäle")}</SubTitle>
      <BulletList items={NOTIFICATION_CHANNELS} />

      <BulletList
        items={[
          t(
            locale,
            "Email and in-app channels can be enabled or disabled independently.",
            "E-Mail- und In-App-Kanäle können unabhängig aktiviert oder deaktiviert werden."
          ),
          t(
            locale,
            "Notification feed includes events from workspace activity, billing, and project operations.",
            "Der Benachrichtigungs-Feed enthält Ereignisse aus Workspace-Aktivität, Billing und Projektoperationen."
          )
        ]}
      />
    </SectionCard>
  );
}

function TeamAccessSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title={t(locale, "Team access", "Teamzugriff")}
      intro={t(
        locale,
        "Workspace members are managed via direct invitation flow in settings.",
        "Workspace-Mitglieder werden über den direkten Einladungsflow in den Einstellungen verwaltet."
      )}
    >
      <SubTitle>{t(locale, "Roles", "Rollen")}</SubTitle>
      <BulletList items={WORKSPACE_ROLES} />

      <SubTitle>{t(locale, "Member statuses", "Mitgliedsstatus")}</SubTitle>
      <BulletList items={MEMBER_STATUSES} />

      <BulletList
        items={[
          t(
            locale,
            "Owners and admins can invite and remove members.",
            "Owner und Admins können Mitglieder einladen und entfernen."
          ),
          t(
            locale,
            "Invites are sent via Supabase email flow.",
            "Einladungen werden über den Supabase-E-Mail-Flow versendet."
          )
        ]}
      />
    </SectionCard>
  );
}

function FaqSection({ locale }: { locale: Locale }) {
  return (
    <SectionCard
      title="FAQ"
      intro={t(
        locale,
        "Short answers to the most common operational questions.",
        "Kurze Antworten auf die häufigsten operativen Fragen."
      )}
    >
      <FaqItem
        question={t(
          locale,
          "Do file and text translation use the same credit pool?",
          "Nutzen Datei- und Textübersetzung denselben Credit-Pool?"
        )}
        answer={t(
          locale,
          "Yes. Both consume credits from the same active billing cycle limit.",
          "Ja. Beide verbrauchen Credits aus demselben aktiven Billing-Zykluslimit."
        )}
      />
      <FaqItem
        question={t(
          locale,
          "Where do I change the default output filename style?",
          "Wo ändere ich den Standard für Ausgabedateinamen?"
        )}
        answer={t(
          locale,
          "Settings -> Preferences -> Default filename format.",
          "Einstellungen -> Präferenzen -> Standard-Dateinamenformat."
        )}
      />
      <FaqItem
        question={t(locale, "Where are notification rules managed?", "Wo werden Benachrichtigungsregeln verwaltet?")}
        answer={t(locale, "On /notifications.", "Auf /notifications.")}
      />
      <FaqItem
        question={t(
          locale,
          "Do you have API docs for WordPress integrations?",
          "Gibt es API-Doku für WordPress-Integrationen?"
        )}
        answer={t(
          locale,
          "Yes, see /developer-api for authentication, endpoints, and payload examples.",
          "Ja, siehe /developer-api für Authentifizierung, Endpoints und Payload-Beispiele."
        )}
      />
    </SectionCard>
  );
}

function SectionCard({
  title,
  intro,
  children
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.5rem)] leading-[0.92]`}>{title}</h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">{intro}</p>
      <div className="mt-7 space-y-6">{children}</div>
    </section>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[17px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">{children}</h3>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[14px] leading-7 text-[var(--muted)]">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--foreground)]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberedSteps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--background)] p-4">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[12px] font-semibold text-[var(--foreground)]">
            {index + 1}
          </span>
          <p className="text-[14px] leading-7 text-[var(--muted)]">{item}</p>
        </li>
      ))}
    </ol>
  );
}

function Callout({
  locale,
  title,
  body
}: {
  locale: Locale;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background-strong)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
        {t(locale, "Note", "Hinweis")}
      </p>
      <p className="mt-1.5 text-[12.5px] font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-[14px] leading-7 text-[var(--muted)]">{body}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-[14px] font-semibold text-[var(--foreground)]">{question}</p>
      <p className="mt-2 text-[14px] leading-7 text-[var(--muted)]">{answer}</p>
    </div>
  );
}
