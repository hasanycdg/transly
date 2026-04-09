"use client";

import Link from "next/link";
import { useState } from "react";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";

type DocSection = {
  id: string;
  label: string;
  labelDE: string;
};

const DOC_SECTIONS: DocSection[] = [
  { id: "getting-started", label: "Getting started", labelDE: "Erste Schritte" },
  { id: "workspace", label: "Workspace", labelDE: "Workspace" },
  { id: "file-translation", label: "File translation", labelDE: "Dateiübersetzung" },
  { id: "text-translation", label: "Text translation", labelDE: "Textübersetzung" },
  { id: "glossary", label: "Glossary", labelDE: "Glossar" },
  { id: "projects", label: "Projects", labelDE: "Projekte" },
  { id: "billing", label: "Billing & Credits", labelDE: "Abrechnung & Credits" },
  { id: "settings", label: "Settings", labelDE: "Einstellungen" },
  { id: "formats", label: "Supported formats", labelDE: "Unterstützte Formate" },
  { id: "faq", label: "FAQ", labelDE: "FAQ" }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [locale, setLocale] = useState<"en" | "de">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("translayr-marketing-locale");
      if (stored === "de" || stored === "en") return stored;
    }
    return "en";
  });

  const t = (en: string, de: string) => (locale === "de" ? de : en);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-7 lg:px-8">
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            / {t("Documentation", "Dokumentation")}
          </p>
          <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2.6rem,4vw,4.2rem)] leading-[0.92]`}>
            {t("How to use Translayr.", "So nutzt du Translayr.")}
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] leading-8 text-[var(--muted)]">
            {t(
              "Everything you need to know about translating files, managing projects, using glossaries, and running your localization workflow.",
              "Alles was du über Dateiübersetzung, Projektmanagement, Glossare und deinen Lokalisierungs-Workflow wissen musst."
            )}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => { setLocale("en"); localStorage.setItem("translayr-marketing-locale", "en"); }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${locale === "en" ? "bg-[var(--foreground)] text-[var(--surface)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              EN
            </button>
            <button
              onClick={() => { setLocale("de"); localStorage.setItem("translayr-marketing-locale", "de"); }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${locale === "de" ? "bg-[var(--foreground)] text-[var(--surface)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              DE
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-[14px] !bg-black px-5 text-[13px] font-medium !text-white transition hover:!bg-black"
            >
              {t("Start free", "Kostenlos starten")}
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
            >
              {t("Back home", "Zur Startseite")}
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="sticky top-8 self-start">
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
                {t("Contents", "Inhalt")}
              </div>
              <div className="mt-3 flex flex-col gap-1">
                {DOC_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={[
                      "rounded-[10px] px-3 py-2 text-left text-[13px] font-medium transition",
                      activeSection === section.id
                        ? "bg-[var(--background-strong)] text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-strong)]"
                    ].join(" ")}
                  >
                    {locale === "de" ? section.labelDE : section.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="min-w-0">
            {activeSection === "getting-started" && <GettingStartedSection locale={locale} />}
            {activeSection === "workspace" && <WorkspaceSection locale={locale} />}
            {activeSection === "file-translation" && <FileTranslationSection locale={locale} />}
            {activeSection === "text-translation" && <TextTranslationSection locale={locale} />}
            {activeSection === "glossary" && <GlossarySection locale={locale} />}
            {activeSection === "projects" && <ProjectsSection locale={locale} />}
            {activeSection === "billing" && <BillingSection locale={locale} />}
            {activeSection === "settings" && <SettingsSection locale={locale} />}
            {activeSection === "formats" && <FormatsSection locale={locale} />}
            {activeSection === "faq" && <FaqSection locale={locale} />}
          </div>
        </div>
      </div>
    </main>
  );
}

function GettingStartedSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Getting started", "Erste Schritte")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "Translayr is an AI-powered translation workspace for teams that need to ship localized content. Instead of juggling files across tools, you work in one surface: create projects, upload files, review translations, and export – all in one flow.",
          "Translayr ist ein KI-gestützter Übersetzungs-Workspace für Teams, die lokalisierte Inhalte veröffentlichen müssen. Statt Dateien zwischen verschiedenen Tools hin und her zu schieben, arbeitest du auf einer Oberfläche: Projekte erstellen, Dateien hochladen, Übersetzungen prüfen und exportieren – alles in einem Ablauf."
        )}
      </p>

      <div className="mt-8 space-y-6">
        <DocStep
          locale={locale}
          number={1}
          title={t("Create your account", "Erstelle dein Konto")}
          body={t(
            "Sign up with your email, choose a workspace name, and set a password. Your workspace is created automatically and you start on the Free plan with 1,000 monthly word credits.",
            "Registriere dich mit deiner E-Mail, wähle einen Workspace-Namen und lege ein Passwort fest. Dein Workspace wird automatisch erstellt und du startest im Free-Plan mit 1.000 monatlichen Wort-Credits."
          )}
        />
        <DocStep
          locale={locale}
          number={2}
          title={t("Set your preferences", "Lege deine Einstellungen fest")}
          body={t(
            "Go to Settings → Translation to configure your default source language, target language, and tone profile. These defaults are applied to new projects and file uploads so you do not have to select them every time.",
            "Gehe zu Einstellungen → Übersetzung, um deine Standard-Quellsprache, Zielsprache und dein Tonprofil zu konfigurieren. Diese Standardwerte werden auf neue Projekte und Datei-Uploads angewendet, sodass du sie nicht jedes Mal auswählen musst."
          )}
        />
        <DocStep
          locale={locale}
          number={3}
          title={t("Create your first project", "Erstelle dein erstes Projekt")}
          body={t(
            "From the dashboard, click New Project. Give it a name, select source and target languages, and optionally enable a glossary. Projects group related files and translations together.",
            "Klicke im Dashboard auf Neues Projekt. Gib ihm einen Namen, wähle Quell- und Zielsprachen und aktiviere optional ein Glossar. Projekte gruppieren zusammengehörige Dateien und Übersetzungen."
          )}
        />
        <DocStep
          locale={locale}
          number={4}
          title={t("Upload files or translate text", "Dateien hochladen oder Text übersetzen")}
          body={t(
            "Inside a project, drag and drop files to upload them. Supported formats include XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX. For quick one-off translations, use the Text Translation surface from the sidebar.",
            "Ziehe Dateien per Drag & Drop in ein Projekt, um sie hochzuladen. Unterstützte Formate sind XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX und PPTX. Für schnelle Einzelübersetzungen nutze die Textübersetzung aus der Seitenleiste."
          )}
        />
        <DocStep
          locale={locale}
          number={5}
          title={t("Review and export", "Prüfen und exportieren")}
          body={t(
            "Once translation is complete, review the output side-by-side with the original. When you are satisfied, download individual files or export the entire project as a ZIP.",
            "Sobald die Übersetzung abgeschlossen ist, prüfe das Ergebnis im Seitenvergleich mit dem Original. Wenn du zufrieden bist, lade einzelne Dateien herunter oder exportiere das gesamte Projekt als ZIP."
          )}
        />
      </div>

      <div className="mt-8 rounded-[18px] border border-[var(--border-light)] bg-[var(--background-strong)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
          {t("Quick tip", "Schneller Tipp")}
        </p>
        <p className="mt-2 text-[14px] leading-7 text-[var(--muted)]">
          {t(
            "One credit equals one word. Your monthly credit limit depends on your plan. Text translations and file translations both draw from the same credit pool. You can monitor your usage on the Usage page.",
            "Ein Credit entspricht einem Wort. Dein monatliches Credit-Limit hängt von deinem Plan ab. Text- und Dateiübersetzungen nutzen denselben Credit-Pool. Deine Nutzung kannst du auf der Nutzungsseite einsehen."
          )}
        </p>
      </div>
    </div>
  );
}

function WorkspaceSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Workspace", "Workspace")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "The workspace is your central operating surface. It brings together projects, usage metrics, recent activity, and target languages into one view.",
          "Der Workspace ist deine zentrale Oberfläche. Er vereint Projekte, Nutzungsmetriken, aktuelle Aktivitäten und Zielsprachen in einer Ansicht."
        )}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Dashboard", "Dashboard")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "The dashboard shows your key metrics at a glance: total words translated, estimated cost, savings compared to agency rates, and remaining credits. Below that you will find projects that need attention, your current operating state, recent activity, and a breakdown of target languages by volume.",
              "Das Dashboard zeigt dir auf einen Blick deine wichtigsten Kennzahlen: Gesamtzahl übersetzter Wörter, geschätzte Kosten, Einsparungen im Vergleich zu Agenturpreisen und verbleibende Credits. Darunter findest du Projekte, die Aufmerksamkeit benötigen, deinen aktuellen Betriebsstatus, aktuelle Aktivitäten und eine Aufschlüsselung der Zielsprachen nach Volumen."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Sidebar navigation", "Seitenleisten-Navigation")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "The left sidebar gives you quick access to Dashboard, Projects (expandable list), Usage, Glossary, Notifications, Support, Billing, and Settings. Your current workspace name and plan are displayed at the bottom of the sidebar.",
              "Die linke Seitenleiste bietet dir schnellen Zugriff auf Dashboard, Projekte (erweiterbare Liste), Nutzung, Glossar, Benachrichtigungen, Support, Abrechnung und Einstellungen. Dein aktueller Workspace-Name und Plan werden am unteren Rand der Seitenleiste angezeigt."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Projects overview", "Projektübersicht")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "The Projects page lists all your translation projects. You can search by name, filter by status (Active, In Review, Archived), and see stats for total projects, active runs, and total words. Click any project to open its workspace.",
              "Die Projektseite listet alle deine Übersetzungsprojekte auf. Du kannst nach Namen suchen, nach Status filtern (Aktiv, In Prüfung, Archiviert) und Statistiken für Gesamtprojekte, aktive Durchläufe und Gesamtwörter sehen. Klicke auf ein beliebiges Projekt, um seinen Workspace zu öffnen."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function FileTranslationSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("File translation", "Dateiübersetzung")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "File translation is the core of Translayr. Upload localization files, get them translated by AI, review the output, and download in the original format.",
          "Die Dateiübersetzung ist das Herzstück von Translayr. Lade Lokalisierungsdateien hoch, lass sie von KI übersetzen, prüfe das Ergebnis und lade sie im Originalformat herunter."
        )}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Uploading files", "Dateien hochladen")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Inside a project, drag and drop files onto the upload zone or click to browse. You can upload multiple files at once. ZIP archives are automatically extracted – any supported translation files inside the ZIP will be added to the queue.",
              "Ziehe Dateien per Drag & Drop in den Upload-Bereich eines Projekts oder klicke zum Durchsuchen. Du kannst mehrere Dateien gleichzeitig hochladen. ZIP-Archive werden automatisch extrahiert – alle unterstützten Übersetzungsdateien im ZIP werden zur Warteschlange hinzugefügt."
            )}
          </p>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Before translation starts, the system counts the words in each file and shows you the estimated credit cost. This lets you confirm before spending credits.",
              "Bevor die Übersetzung beginnt, zählt das System die Wörter in jeder Datei und zeigt dir die geschätzten Credit-Kosten. So kannst du bestätigen, bevor Credits verbraucht werden."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Translation workflow", "Übersetzungs-Workflow")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "After upload, files enter a queue. Select the files you want to translate and click Start Translation. Each file goes through these states:",
              "Nach dem Upload gelangen Dateien in eine Warteschlange. Wähle die Dateien aus, die du übersetzen möchtest, und klicke auf Übersetzung starten. Jede Datei durchläuft diese Zustände:"
            )}
          </p>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[var(--muted)]">
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Queued", "Wartend")}</span> – {t("waiting to be processed", "wartet auf Verarbeitung")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Processing", "In Bearbeitung")}</span> – {t("currently being translated", "wird gerade übersetzt")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Review", "Prüfung")}</span> – {t("translation complete, ready for review", "Übersetzung abgeschlossen, bereit zur Prüfung")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Done", "Fertig")}</span> – {t("reviewed and finalized", "geprüft und abgeschlossen")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Error", "Fehler")}</span> – {t("translation failed (can be retried)", "Übersetzung fehlgeschlagen (kann wiederholt werden)")}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Review", "Prüfung")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Click Review on any completed file to open the side-by-side view. The original content is shown on the left and the translated output on the right. This lets you verify quality before exporting.",
              "Klicke auf Prüfen bei jeder abgeschlossenen Datei, um die Seitenansicht zu öffnen. Der Originalinhalt wird links und die übersetzte Ausgabe rechts angezeigt. So kannst du die Qualität vor dem Export überprüfen."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Export", "Export")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Download individual translated files or export the entire project as a ZIP. The filename format can be configured in Settings → Preferences (Original + target locale, Original + source + target, or Project slug + locale).",
              "Lade einzelne übersetzte Dateien herunter oder exportiere das gesamte Projekt als ZIP. Das Dateinamenformat kann unter Einstellungen → Voreinstellungen konfiguriert werden (Original + Ziel-Sprachumgebung, Original + Quelle + Ziel oder Projekt-Slug + Sprachumgebung)."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Auto-download", "Auto-Download")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Enable auto-download in Settings → Preferences to automatically download finished files to your computer as soon as translation completes.",
              "Aktiviere Auto-Download unter Einstellungen → Voreinstellungen, um fertige Dateien automatisch auf deinen Computer herunterzuladen, sobald die Übersetzung abgeschlossen ist."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function TextTranslationSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Text translation", "Textübersetzung")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "Text translation is for quick, one-off translations that do not need a project wrapper. Ideal for product copy, support replies, UI strings, and marketing text.",
          "Die Textübersetzung ist für schnelle Einzelübersetzungen, die kein Projekt benötigen. Ideal für Produkttexte, Support-Antworten, UI-Strings und Marketing-Texte."
        )}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("How it works", "So funktioniert es")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Paste or type your text into the input area. Select the source language (or leave it on Auto Detect), choose your target language, and pick a tone style. Click Translate and the result appears immediately.",
              "Füge deinen Text ein oder tippe ihn in den Eingabebereich. Wähle die Quellsprache (oder lass sie auf Automatisch erkennen), wähle deine Zielsprache und einen Tonstil. Klicke auf Übersetzen und das Ergebnis erscheint sofort."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Tone options", "Ton-Optionen")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Choose from five tone styles to match your use case:",
              "Wähle aus fünf Tonstilen, die zu deinem Anwendungsfall passen:"
            )}
          </p>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[var(--muted)]">
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Neutral", "Neutral")}</span> – {t("balanced, general purpose", "ausgewogen, allgemein")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Formal", "Formell")}</span> – {t("professional, business-appropriate", "professionell, geschäftsgerecht")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Informal", "Informell")}</span> – {t("casual, conversational", "locker, gesprächig")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Marketing", "Marketing")}</span> – {t("engaging, persuasive", "ansprechend, überzeugend")}
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">{t("Technical", "Technisch")}</span> – {t("precise, terminology-focused", "präzise, terminologieorientiert")}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Copy and export", "Kopieren und exportieren")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Copy the translated text to your clipboard with one click, or export it as a TXT file. The word and character count is shown below the input area so you know the credit impact before translating.",
              "Kopiere den übersetzten Text mit einem Klick in die Zwischenablage oder exportiere ihn als TXT-Datei. Die Wort- und Zeichenanzahl wird unter dem Eingabebereich angezeigt, damit du die Credit-Auswirkung vor der Übersetzung kennst."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function GlossarySection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Glossary", "Glossar")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "The glossary lets you define approved translations for key terms, brand names, product labels, and technical vocabulary. Glossary entries are automatically injected during translation to ensure consistency.",
          "Das Glossar ermöglicht es dir, genehmigte Übersetzungen für Schlüsselbegriffe, Markennamen, Produktbezeichnungen und technisches Vokabular zu definieren. Glossareinträge werden während der Übersetzung automatisch eingefügt, um Konsistenz zu gewährleisten."
        )}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Terms", "Begriffe")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Each glossary term has a source text, source language, translations for one or more target locales, a status (Draft, Review, Approved, Archived), and an optional protected flag. Protected terms are locked and always used exactly as defined – ideal for brand names and product labels.",
              "Jeder Glossarbegriff hat einen Quelltext, eine Quellsprache, Übersetzungen für eine oder mehrere Ziel-Sprachumgebungen, einen Status (Entwurf, Prüfung, Genehmigt, Archiviert) und ein optionales Geschützt-Flag. Geschützte Begriffe sind gesperrt und werden immer genau wie definiert verwendet – ideal für Markennamen und Produktbezeichnungen."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Collections", "Sammlungen")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Collections let you group terms by feature, brand, client, or any category you choose. This makes it easier to manage large glossaries and apply terms selectively to specific projects.",
              "Sammlungen ermöglichen es dir, Begriffe nach Funktion, Marke, Kunde oder einer beliebigen Kategorie zu gruppieren. Das erleichtert die Verwaltung großer Glossare und die selektive Anwendung von Begriffen auf bestimmte Projekte."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("CSV import", "CSV-Import")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Import glossary terms from a CSV file. The CSV should have a `source` column for the source text, optional metadata columns, and locale-based translation columns (e.g., `de`, `fr`, `en`). This is the fastest way to populate a glossary for an existing project.",
              "Importiere Glossarbegriffe aus einer CSV-Datei. Die CSV sollte eine `source`-Spalte für den Quelltext, optionale Metadatenspalten und sprachumgebungsbasierte Übersetzungsspalten (z. B. `de`, `fr`, `en`) haben. Dies ist der schnellste Weg, ein Glossar für ein bestehendes Projekt zu befüllen."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Automatic injection", "Automatische Einfügung")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              `Enable "Use Glossary Automatically" in Settings → Translation to have approved glossary terms automatically injected during file and text translation. "Strict Glossary Mode" forces the translation to prefer glossary-approved wording over the AI model's suggestions.`,
              `Aktiviere "Glossar automatisch verwenden" unter Einstellungen → Übersetzung, damit genehmigte Glossarbegriffe automatisch bei Datei- und Textübersetzungen eingefügt werden. Der "Strenge Glossar-Modus" zwingt die Übersetzung, glossar-genehmigte Formulierungen den Vorschlägen des KI-Modells vorzuziehen.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectsSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Projects", "Projekte")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "Projects are the containers for your translation work. Each project groups related files, tracks progress, and maintains its own language pair and glossary settings.",
          "Projekte sind die Container für deine Übersetzungsarbeit. Jedes Projekt gruppiert zusammengehörige Dateien, verfolgt den Fortschritt und verwaltet eigene Sprachpaar- und Glossar-Einstellungen."
        )}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Creating a project", "Ein Projekt erstellen")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Click New Project from the Projects page or the dashboard. Fill in the project name, optional description, source language, target languages, and toggle the glossary on or off. Click Create to start.",
              "Klicke auf Neues Projekt auf der Projektseite oder im Dashboard. Gib den Projektnamen, eine optionale Beschreibung, Quellsprache, Zielsprachen ein und schalte das Glossar ein oder aus. Klicke auf Erstellen, um zu starten."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Project workspace", "Projekt-Workspace")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Each project has its own workspace showing: total files, completed count, files in review, failed files, total words, and quality score. A progress bar shows overall translation status. Below that you will find the upload zone, translation run status, files table, and recent activity.",
              "Jedes Projekt hat einen eigenen Workspace mit: Gesamtanzahl Dateien, abgeschlossene Anzahl, Dateien in Prüfung, fehlgeschlagene Dateien, Gesamtwörter und Qualitäts-Score. Ein Fortschrittsbalken zeigt den gesamten Übersetzungsstatus. Darunter findest du den Upload-Bereich, Übersetzungs-Status, Dateitabelle und aktuelle Aktivitäten."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("File management", "Dateiverwaltung")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "The files table shows every file in the project with its filename, language pair, status badge, progress bar, and last updated timestamp. Actions per file include: Review (side-by-side view), Download, Retry (for failed files), and Delete.",
              "Die Dateitabelle zeigt jede Datei im Projekt mit Dateiname, Sprachpaar, Status-Badge, Fortschrittsbalken und Zeitstempel der letzten Aktualisierung. Aktionen pro Datei: Prüfen (Seitenansicht), Herunterladen, Wiederholen (für fehlgeschlagene Dateien) und Löschen."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Project statuses", "Projekt-Status")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Projects can be Active (actively being worked on), In Review (under review before release), Error (one or more files failed), or Archived (completed and no longer active).",
              "Projekte können Aktiv (aktiv in Bearbeitung), In Prüfung (wird vor der Veröffentlichung geprüft), Fehler (eine oder mehrere Dateien fehlgeschlagen) oder Archiviert (abgeschlossen und nicht mehr aktiv) sein."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function BillingSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Billing & Credits", "Abrechnung & Credits")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "Translayr uses a credit-based model where one credit equals one word. Your monthly credit limit depends on your plan. Both file and text translations draw from the same credit pool.",
          "Translayr nutzt ein Credit-basiertes Modell, bei dem ein Credit einem Wort entspricht. Dein monatliches Credit-Limit hängt von deinem Plan ab. Sowohl Datei- als auch Textübersetzungen nutzen denselben Credit-Pool."
        )}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Plans", "Pläne")}</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">{t("Plan", "Plan")}</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">{t("Price", "Preis")}</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">{t("Monthly credits", "Monatliche Credits")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                <tr>
                  <td className="px-4 py-3 font-medium">{t("Free", "Kostenlos")}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$0</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t("1,000 words", "1.000 Wörter")}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">{t("Starter", "Starter")}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$19/mo</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t("50,000 words", "50.000 Wörter")}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">{t("Pro", "Pro")}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$49/mo</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t("200,000 words", "200.000 Wörter")}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">{t("Scale", "Scale")}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$99/mo</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t("700,000 words", "700.000 Wörter")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Monthly vs Yearly", "Monatlich vs Jährlich")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Paid plans can be billed monthly or yearly. Yearly billing gives you a 2-month discount (you pay for 10 months, get 12). All prices exclude VAT.",
              "Kostenpflichtige Pläne können monatlich oder jährlich abgerechnet werden. Jährliche Abrechnung gibt dir einen 2-Monats-Rabatt (du zahlst für 10 Monate, bekommst 12). Alle Preise verstehen sich zzgl. MwSt."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Upgrading and downgrading", "Upgrade und Downgrade")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Upgrade at any time from the Billing page. New paid subscriptions open in Stripe Checkout. Existing subscribers can switch plans instantly. If you downgrade, the change takes effect at the start of your next billing cycle.",
              "Upgrade jederzeit über die Abrechnungsseite möglich. Neue kostenpflichtige Abonnements öffnen sich in Stripe Checkout. Bestehende Abonnenten können sofort den Plan wechseln. Bei einem Downgrade wird die Änderung zu Beginn deines nächsten Abrechnungszyklus wirksam."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Invoices and payment method", "Rechnungen und Zahlungsmethode")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              `Your Billing page shows invoice history, current billing cycle details, and the payment method on file. Click "Open Stripe Portal" to manage your payment method, view detailed invoices, or update billing information directly in Stripe.`,
              `Deine Abrechnungsseite zeigt Rechnungsverlauf, Details zum aktuellen Abrechnungszyklus und die hinterlegte Zahlungsmethode. Klicke auf "Stripe-Portal öffnen", um deine Zahlungsmethode zu verwalten, detaillierte Rechnungen einzusehen oder Rechnungsinformationen direkt in Stripe zu aktualisieren.`
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Usage monitoring", "Nutzungsüberwachung")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "The Usage page shows your credit consumption trends, breakdown by project and language, top files by word count, and a real-time activity feed. This helps you understand where your credits are going and optimize your workflow.",
              "Die Nutzungsseite zeigt deine Credit-Verbrauchstrends, Aufschlüsselung nach Projekt und Sprache, Top-Dateien nach Wortanzahl und einen Echtzeit-Aktivitätsfeed. So verstehst du, wohin deine Credits fließen und optimierst deinen Workflow."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Settings", "Einstellungen")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "Settings are organized into five sections: Profile, Translation, Preferences, Notifications, and Danger Zone.",
          "Die Einstellungen sind in fünf Bereiche gegliedert: Profil, Übersetzung, Voreinstellungen, Benachrichtigungen und Gefahrenzone."
        )}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Profile", "Profil")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Manage your personal name, email (primary login address), company name, billing address, and password. The workspace members panel also lives here – invite team members with roles (Owner, Admin, Editor, Reviewer, Viewer) and track their status (Invited, Active, Disabled).",
              "Verwalte deinen persönlichen Namen, E-Mail (primäre Login-Adresse), Firmennamen, Rechnungsadresse und Passwort. Hier findest du auch den Workspace-Mitgliederbereich – lade Teammitglieder mit Rollen ein (Inhaber, Admin, Redakteur, Prüfer, Betrachter) und verfolge ihren Status (Eingeladen, Aktiv, Deaktiviert)."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Translation", "Übersetzung")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Configure how translations behave: source language mode (Auto Detect or Manual), default target language, tone profile, strict tag protection, fail on tag mismatch, glossary auto-injection, strict glossary mode, and AI behavior (Fast, Balanced, High Quality).",
              "Konfiguriere das Übersetzungsverhalten: Quellsprachmodus (Automatisch erkennen oder Manuell), Standard-Zielsprache, Tonprofil, strenger Tag-Schutz, Fehler bei Tag-Abweichung, automatische Glossar-Einfügung, strenger Glossar-Modus und KI-Verhalten (Schnell, Ausgewogen, Hohe Qualität)."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Preferences", "Voreinstellungen")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Set your app language (English or German), toggle auto-download after translation, and choose the default filename format for exported files.",
              "Lege deine App-Sprache fest (Englisch oder Deutsch), aktiviere Auto-Download nach der Übersetzung und wähle das Standard-Dateinamenformat für exportierte Dateien."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Notifications", "Benachrichtigungen")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Control which events trigger notifications: translation ready, invoice created, payment failed, spending limit reached, review reminders, and in-app notifications. All email notifications are sent to your primary workspace email.",
              "Steuere, welche Ereignisse Benachrichtigungen auslösen: Übersetzung fertig, Rechnung erstellt, Zahlung fehlgeschlagen, Ausgabenlimit erreicht, Prüf-Erinnerungen und In-App-Benachrichtigungen. Alle E-Mail-Benachrichtigungen werden an deine primäre Workspace-E-Mail gesendet."
            )}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">{t("Danger Zone", "Gefahrenzone")}</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {t(
              "Permanent account deletion. This action cannot be undone. All projects, files, glossary terms, and usage data will be irreversibly removed.",
              "Permanente Kontolöschung. Diese Aktion kann nicht rückgängig gemacht werden. Alle Projekte, Dateien, Glossarbegriffe und Nutzungsdaten werden unwiderruflich entfernt."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function FormatsSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Supported formats", "Unterstützte Formate")}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        {t(
          "Translayr supports a wide range of localization and document formats. All formats preserve the original structure, tags, and placeholders during translation.",
          "Translayr unterstützt eine breite Palette von Lokalisierungs- und Dokumentformaten. Alle Formate bewahren die ursprüngliche Struktur, Tags und Platzhalter während der Übersetzung."
        )}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormatCard
          locale={locale}
          format="XLIFF / XLF"
          extensions=".xliff, .xlf"
          description={t("Industry standard for localization. Full tag and structure protection.", "Industriestandard für Lokalisierung. Vollständiger Tag- und Strukturschutz.")}
        />
        <FormatCard
          locale={locale}
          format="PO"
          extensions=".po"
          description={t("GNU gettext format. Widely used in open source and web projects.", "GNU-Gettext-Format. Weit verbreitet in Open-Source- und Webprojekten.")}
        />
        <FormatCard
          locale={locale}
          format="Strings"
          extensions=".strings"
          description={t("Apple localization format for iOS and macOS apps.", "Apple-Lokalisierungsformat für iOS- und macOS-Apps.")}
        />
        <FormatCard
          locale={locale}
          format="RESX"
          extensions=".resx"
          description={t("Microsoft .NET resource file format for Windows and web apps.", "Microsoft .NET-Ressourcendateiformat für Windows- und Web-Apps.")}
        />
        <FormatCard
          locale={locale}
          format="XML"
          extensions=".xml"
          description={t("Structured data with tag preservation for custom localization pipelines.", "Strukturierte Daten mit Tag-Erhalt für benutzerdefinierte Lokalisierungs-Pipelines.")}
        />
        <FormatCard
          locale={locale}
          format="CSV"
          extensions=".csv"
          description={t("Spreadsheet-style translation. Each row is treated as a translatable unit.", "Tabellenkalkulations-Übersetzung. Jede Zeile wird als übersetzbare Einheit behandelt.")}
        />
        <FormatCard
          locale={locale}
          format="TXT"
          extensions=".txt"
          description={t("Plain text files. Simple, no structure to preserve.", "Klartextdateien. Einfach, keine Struktur zum Bewahren.")}
        />
        <FormatCard
          locale={locale}
          format="DOCX"
          extensions=".docx"
          description={t("Microsoft Word documents. Formatting and styles are maintained.", "Microsoft Word-Dokumente. Formatierung und Stile werden beibehalten.")}
        />
        <FormatCard
          locale={locale}
          format="PPTX"
          extensions=".pptx"
          description={t("Microsoft PowerPoint presentations. Slide structure preserved.", "Microsoft PowerPoint-Präsentationen. Folienstruktur bleibt erhalten.")}
        />
      </div>

      <div className="mt-8 rounded-[18px] border border-[var(--border-light)] bg-[var(--background-strong)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
          {t("ZIP archives", "ZIP-Archive")}
        </p>
        <p className="mt-2 text-[14px] leading-7 text-[var(--muted)]">
          {t(
            "You can upload ZIP files containing any combination of the supported formats above. Translayr automatically extracts the archive, identifies supported translation files, and adds them to your project queue. Non-supported files inside the ZIP are ignored.",
            "Du kannst ZIP-Dateien mit beliebigen Kombinationen der oben unterstützten Formate hochladen. Translayr extrahiert automatisch das Archiv, identifiziert unterstützte Übersetzungsdateien und fügt sie deiner Projekt-Warteschlange hinzu. Nicht unterstützte Dateien im ZIP werden ignoriert."
          )}
        </p>
      </div>
    </div>
  );
}

function FaqSection({ locale }: { locale: "en" | "de" }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        {t("Frequently asked questions", "Häufig gestellte Fragen")}
      </h2>

      <div className="mt-8 space-y-6">
        <FaqItem
          locale={locale}
          question={t("What is a credit?", "Was ist ein Credit?")}
          answer={t(
            "One credit equals one word. Every word in your source text that gets translated costs one credit. This applies to both file translation and text translation. Your monthly credit limit depends on your plan.",
            "Ein Credit entspricht einem Wort. Jedes Wort in deinem Quelltext, das übersetzt wird, kostet einen Credit. Dies gilt sowohl für Datei- als auch Textübersetzung. Dein monatliches Credit-Limit hängt von deinem Plan ab."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("What happens when I run out of credits?", "Was passiert, wenn meine Credits aufgebraucht sind?")}
          answer={t(
            "When you reach your monthly credit limit, translations will stop until the next billing cycle. You can upgrade your plan at any time to get more credits immediately. You will also receive an email notification when your spending limit is reached (if enabled in Settings → Notifications).",
            "Wenn du dein monatliches Credit-Limit erreichst, werden Übersetzungen bis zum nächsten Abrechnungszyklus gestoppt. Du kannst jederzeit ein Upgrade deines Plans durchführen, um sofort mehr Credits zu erhalten. Du erhältst auch eine E-Mail-Benachrichtigung, wenn dein Ausgabenlimit erreicht ist (falls unter Einstellungen → Benachrichtigungen aktiviert)."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("Can I use Translayr for free?", "Kann ich Translayr kostenlos nutzen?")}
          answer={t(
            "Yes. The Free plan gives you 1,000 monthly word credits, core XLIFF translation, and glossary basics. It is ideal for trying the product and smaller file sets.",
            "Ja. Der Free-Plan gibt dir 1.000 monatliche Wort-Credits, grundlegende XLIFF-Übersetzung und Glossar-Basisfunktionen. Er ist ideal zum Ausprobieren des Produkts und für kleinere Dateisets."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("Which file formats are supported?", "Welche Dateiformate werden unterstützt?")}
          answer={t(
            "XLIFF/XLF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX. ZIP archives containing any of these formats are also supported and automatically extracted.",
            "XLIFF/XLF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX und PPTX. ZIP-Archive mit beliebigen dieser Formate werden ebenfalls unterstützt und automatisch extrahiert."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("How does the glossary work?", "Wie funktioniert das Glossar?")}
          answer={t(
            "The glossary stores approved translations for key terms. When enabled, these terms are automatically injected during translation to ensure consistency. Protected terms are always used exactly as defined. You can import glossary terms via CSV for bulk setup.",
            "Das Glossar speichert genehmigte Übersetzungen für Schlüsselbegriffe. Wenn aktiviert, werden diese Begriffe automatisch während der Übersetzung eingefügt, um Konsistenz zu gewährleisten. Geschützte Begriffe werden immer genau wie definiert verwendet. Du kannst Glossarbegriffe per CSV für die Massenbefüllung importieren."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("Can I review translations before exporting?", "Kann ich Übersetzungen vor dem Export prüfen?")}
          answer={t(
            "Yes. Every translated file can be reviewed in a side-by-side view showing the original and translated content. This is available on Pro and Scale plans.",
            "Ja. Jede übersetzte Datei kann in einer Seitenansicht geprüft werden, die den Original- und übersetzten Inhalt zeigt. Dies ist in den Pro- und Scale-Plänen verfügbar."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("How do I change my plan?", "Wie ändere ich meinen Plan?")}
          answer={t(
            "Go to Billing in the sidebar. Select the plan you want and confirm. New subscriptions open in Stripe Checkout. Existing subscribers can switch plans instantly. Downgrades take effect at the next billing cycle.",
            "Gehe zu Abrechnung in der Seitenleiste. Wähle den gewünschten Plan und bestätige. Neue Abonnements öffnen sich in Stripe Checkout. Bestehende Abonnenten können sofort den Plan wechseln. Downgrades werden zum nächsten Abrechnungszyklus wirksam."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("Can I invite team members?", "Kann ich Teammitglieder einladen?")}
          answer={t(
            "Yes. Go to Settings → Profile and use the Workspace Members panel. Invite members with roles: Owner, Admin, Editor, Reviewer, or Viewer. Invited members receive an email with an acceptance link.",
            "Ja. Gehe zu Einstellungen → Profil und nutze den Workspace-Mitgliederbereich. Lade Mitglieder mit Rollen ein: Inhaber, Admin, Redakteur, Prüfer oder Betrachter. Eingeladene Mitglieder erhalten eine E-Mail mit einem Annahme-Link."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("Is my data secure?", "Sind meine Daten sicher?")}
          answer={t(
            "Yes. Translayr uses Supabase for authentication and database management, Stripe for billing, and all translations are processed securely. Tag and structure protection ensures your localization files maintain their integrity.",
            "Ja. Translayr nutzt Supabase für Authentifizierung und Datenbankverwaltung, Stripe für die Abrechnung und alle Übersetzungen werden sicher verarbeitet. Tag- und Strukturschutz stellt sicher, dass deine Lokalisierungsdateien ihre Integrität bewahren."
          )}
        />
        <FaqItem
          locale={locale}
          question={t("What languages are supported?", "Welche Sprachen werden unterstützt?")}
          answer={t(
            "Translayr supports translation between all major languages. The source language can be auto-detected or manually selected. Target language selection includes all commonly used languages for product localization.",
            "Translayr unterstützt die Übersetzung zwischen allen gängigen Sprachen. Die Quellsprache kann automatisch erkannt oder manuell ausgewählt werden. Die Zielsprachauswahl umfasst alle häufig verwendeten Sprachen für Produktlokalisierung."
          )}
        />
      </div>
    </div>
  );
}

function DocStep({ locale, number, title, body }: { locale: "en" | "de"; number: number; title: string; body: string }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[13px] font-semibold text-[var(--surface)]">
        {number}
      </div>
      <div>
        <h4 className="text-[14px] font-semibold">{title}</h4>
        <p className="mt-1 text-[14px] leading-7 text-[var(--muted)]">{body}</p>
      </div>
    </div>
  );
}

function FormatCard({ locale, format, extensions, description }: { locale: "en" | "de"; format: string; extensions: string; description: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--background-strong)] p-5">
      <div className="text-[14px] font-semibold">{format}</div>
      <div className="mt-1 text-[12px] font-mono text-[var(--muted-soft)]">{extensions}</div>
      <p className="mt-3 text-[13px] leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function FaqItem({ locale, question, answer }: { locale: "en" | "de"; question: string; answer: string }) {
  const t = (en: string, de: string) => (locale === "de" ? de : en);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-[14px] font-medium">{question}</span>
        <span className="ml-4 text-[var(--muted-soft)] transition">{open ? t("−", "−") : t("+", "+")}</span>
      </button>
      {open && (
        <div className="border-t border-[var(--border-light)] px-5 py-4">
          <p className="text-[14px] leading-7 text-[var(--muted)]">{answer}</p>
        </div>
      )}
    </div>
  );
}
