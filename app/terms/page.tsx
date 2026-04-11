"use client";

import Link from "next/link";
import { useAppLocale } from "@/components/app-locale-provider";
import { BrandIconBadge } from "@/components/brand-icon";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";

export default function TermsPage() {
  const locale = useAppLocale();
  const isDe = locale === "de";
  const t = isDe ? deContent : enContent;

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 sm:px-7 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandIconBadge />
            <span className="text-[16px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">Translayr</span>
          </Link>
          <Link
            href="/"
            className="text-[14px] font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            {isDe ? "Zurück zur Startseite" : "Back to home"}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[760px] px-5 py-16 sm:px-7 lg:px-8 lg:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-soft)]">
          / {t.lastUpdated}
        </p>
        <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.92] text-[var(--foreground)]`}>
          {t.title}
        </h1>
        <p className="mt-6 text-[16px] leading-8 text-[var(--muted)]">
          {t.intro}
        </p>

        <div className="mt-12 space-y-10">
          {t.sections.map((section) => (
            <section key={section.heading} id={section.id}>
              <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.3rem,2vw,1.8rem)] leading-[0.95] text-[var(--foreground)]`}>
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--muted)]">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {section.list && (
                  <ul className="ml-5 list-disc space-y-2">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-[var(--border)] pt-8">
          <p className="text-[13px] text-[var(--muted-soft)]">
            {isDe
              ? "Bei Fragen zu diesen AGB kontaktiere uns unter legal@translayr.dev."
              : "If you have questions about these Terms, contact us at legal@translayr.dev."}
          </p>
        </div>
      </div>
    </main>
  );
}

const deContent = {
  lastUpdated: "Stand: April 2026",
  title: "Nutzungsbedingungen",
  intro:
    "Diese Nutzungsbedingungen gelten für die Nutzung der Translayr-Plattform. Mit der Registrierung und Nutzung des Dienstes stimmst du diesen Bedingungen zu.",
  sections: [
    {
      id: "overview",
      heading: "1. Überblick",
      paragraphs: [
        "Translayr ist eine SaaS-Plattform für Übersetzungs-Workflows, die Projektverwaltung, Dateiübersetzung und direkte Textübersetzung in einer Oberfläche bündelt.",
        "Diese Bedingungen gelten für alle Nutzer:innen – kostenlose wie bezahlte – und regeln den Zugang, die Nutzung und die Verantwortlichkeiten rund um den Dienst."
      ]
    },
    {
      id: "accounts",
      heading: "2. Konten und Zugang",
      paragraphs: [
        "Für die Nutzung von Translayr ist die Erstellung eines Kontos erforderlich. Du bist verantwortlich für die Sicherheit deiner Zugangsdaten und alle Aktivitäten, die unter deinem Konto stattfinden.",
        "Du musst bei der Registrierung wahrheitsgemäße Angaben machen und dein Konto aktuell halten. Translayr behält sich das Recht vor, Konten zu sperren oder zu löschen, die gegen diese Bedingungen verstoßen."
      ],
      list: [
        "Mindestalter für die Nutzung: 16 Jahre",
        "Ein Konto kann nicht ohne Weiteres übertragen werden",
        "Bei Verdacht auf unbefugten Zugriff bitte umgehend melden"
      ]
    },
    {
      id: "services",
      heading: "3. Dienstleistungsumfang",
      paragraphs: [
        "Translayr bietet Übersetzungs-Workflows basierend auf KI-gestützter Verarbeitung. Der Umfang des Dienstes richtet sich nach dem gewählten Tarif.",
        "Die Nutzung erfolgt wortbasiert über ein Credit-System. Ein Credit entspricht einem Wort. Die monatlichen Credit-Limits sind tarifabhängig.",
        "Translayr unterstützt unter anderem folgende Dateiformate: XLIFF, XLF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX und PPTX."
      ]
    },
    {
      id: "pricing",
      heading: "4. Preise und Abrechnung",
      paragraphs: [
        "Die Preise ergeben sich aus der jeweils aktuellen Preisübersicht auf translayr.dev/pricing. Änderungen werden rechtzeitig angekündigt.",
        "Bezahlte Pläne werden monatlich oder jährlich abgerechnet. Bei jährlicher Abrechnung erhalten Nutzer:innen zwei Monate gratis.",
        "Ein Upgrade ist jederzeit möglich. Das neue Guthaben steht sofort zur Verfügung. Ein Downgrade wird zum Ende der aktuellen Abrechnungsperiode wirksam.",
        "Erstattungen erfolgen nur in den gesetzlich vorgeschriebenen Fällen."
      ]
    },
    {
      id: "acceptable-use",
      heading: "5. Akzeptable Nutzung",
      paragraphs: [
        "Du verpflichtest dich, Translayr nur für rechtmäßige Zwecke zu nutzen. Nicht gestattet ist:",
      ],
      list: [
        "Die Übersetzung illegaler, hasserfüllter oder missbräuchlicher Inhalte",
        "Die Umgehung von Credit-Limits oder technischen Schutzmaßnahmen",
        "Die Weitergabe von Zugangsdaten an Dritte",
        "Die Nutzung des Dienstes zum Aufbau eines konkurrierenden Angebots",
        "Automatisierte Abfragen ohne vorherige Genehmigung"
      ]
    },
    {
      id: "data",
      heading: "6. Daten und Datenschutz",
      paragraphs: [
        "Eingegebene Inhalte und hochgeladene Dateien werden ausschließlich zur Bereitstellung des Übersetzungsdienstes verarbeitet. Einzelheiten zur Datenverarbeitung findest du in unserer Datenschutzerklärung.",
        "Du behältst die Eigentumsrechte an deinen Inhalten. Translayr erhält ein begrenztes Nutzungsrecht zur Erfüllung des Dienstes."
      ]
    },
    {
      id: "liability",
      heading: "7. Haftung",
      paragraphs: [
        "Translayr strebt eine hohe Verfügbarkeit und Übersetzungsqualität an, übernimmt jedoch keine Garantie für die Richtigkeit automatisierter Übersetzungen.",
        "Die Haftung von Translayr beschränkt sich auf Vorsatz und grobe Fahrlässigkeit, soweit gesetzlich zulässig.",
        "Translayr haftet nicht für indirekte Schäden, Datenverlust oder Betriebsunterbrechungen, die durch die Nutzung des Dienstes entstehen."
      ]
    },
    {
      id: "termination",
      heading: "8. Kündigung",
      paragraphs: [
        "Du kannst dein Konto jederzeit kündigen. Bei bezahlten Plänen bleibt der Zugang bis zum Ende der laufenden Abrechnungsperiode bestehen.",
        "Translayr kann Konten bei Verstoß gegen diese Bedingungen fristlos kündigen.",
        "Nach Kündigung werden deine Daten gemäß der Datenschutzerklärung gelöscht."
      ]
    },
    {
      id: "changes",
      heading: "9. Änderungen",
      paragraphs: [
        "Translayr behält sich das Recht vor, diese Nutzungsbedingungen anzupassen. Wesentliche Änderungen werden mindestens 30 Tage im Voraus per E-Mail angekündigt.",
        "Die fortgesetzte Nutzung des Dienstes nach Inkrafttreten der Änderungen gilt als Zustimmung."
      ]
    },
    {
      id: "contact",
      heading: "10. Kontakt",
      paragraphs: [
        "Bei Fragen zu diesen Bedingungen erreichst du uns unter legal@translayr.dev.",
        "Verantwortlich im Sinne der DSGVO: Translayr GmbH, Musterstraße 1, 10115 Berlin, Deutschland."
      ]
    }
  ]
};

const enContent = {
  lastUpdated: "Effective: April 2026",
  title: "Terms of Service",
  intro:
    "These Terms of Service govern your use of the Translayr platform. By registering and using the service, you agree to be bound by these terms.",
  sections: [
    {
      id: "overview",
      heading: "1. Overview",
      paragraphs: [
        "Translayr is a SaaS platform for translation workflows, combining project management, file translation, and direct text translation in one surface.",
        "These terms apply to all users – free and paid – and govern access, usage, and responsibilities around the service."
      ]
    },
    {
      id: "accounts",
      heading: "2. Accounts and Access",
      paragraphs: [
        "Using Translayr requires creating an account. You are responsible for the security of your credentials and all activity under your account.",
        "You must provide truthful information during registration and keep your account up to date. Translayr reserves the right to suspend or delete accounts that violate these terms."
      ],
      list: [
        "Minimum age for use: 16 years",
        "Accounts are non-transferable",
        "Report any unauthorized access immediately"
      ]
    },
    {
      id: "services",
      heading: "3. Scope of Service",
      paragraphs: [
        "Translayr provides translation workflows powered by AI-assisted processing. The scope of service depends on your chosen plan.",
        "Usage is word-based through a credit system. One credit equals one word. Monthly credit limits vary by plan tier.",
        "Translayr supports the following file formats: XLIFF, XLF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX."
      ]
    },
    {
      id: "pricing",
      heading: "4. Pricing and Billing",
      paragraphs: [
        "Prices are as shown on translayr.dev/pricing and may change with advance notice.",
        "Paid plans are billed monthly or annually. Annual billing includes two months free.",
        "Upgrades are available at any time with immediate credit availability. Downgrades take effect at the end of the current billing period.",
        "Refunds are provided only where required by law."
      ]
    },
    {
      id: "acceptable-use",
      heading: "5. Acceptable Use",
      paragraphs: [
        "You agree to use Translayr only for lawful purposes. The following is prohibited:",
      ],
      list: [
        "Translating illegal, hateful, or abusive content",
        "Circumventing credit limits or technical safeguards",
        "Sharing account credentials with third parties",
        "Using the service to build a competing offering",
        "Automated queries without prior approval"
      ]
    },
    {
      id: "data",
      heading: "6. Data and Data Protection",
      paragraphs: [
        "Submitted content and uploaded files are processed solely to provide the translation service. Details on data processing can be found in our Privacy Policy.",
        "You retain ownership of your content. Translayr receives a limited license to process it for service delivery."
      ]
    },
    {
      id: "liability",
      heading: "7. Liability",
      paragraphs: [
        "Translayr strives for high availability and translation quality but does not guarantee the accuracy of automated translations.",
        "Translayr's liability is limited to intent and gross negligence, where permitted by law.",
        "Translayr is not liable for indirect damages, data loss, or business interruptions arising from use of the service."
      ]
    },
    {
      id: "termination",
      heading: "8. Termination",
      paragraphs: [
        "You may terminate your account at any time. For paid plans, access remains until the end of the current billing period.",
        "Translayr may terminate accounts immediately for violations of these terms.",
        "After termination, your data will be deleted in accordance with our Privacy Policy."
      ]
    },
    {
      id: "changes",
      heading: "9. Changes",
      paragraphs: [
        "Translayr reserves the right to update these Terms. Material changes will be communicated at least 30 days in advance via email.",
        "Continued use of the service after changes take effect constitutes acceptance."
      ]
    },
    {
      id: "contact",
      heading: "10. Contact",
      paragraphs: [
        "For questions about these Terms, reach us at legal@translayr.dev.",
        "Responsible entity under GDPR: Translayr GmbH, Musterstraße 1, 10115 Berlin, Germany."
      ]
    }
  ]
};
