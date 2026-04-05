"use client";

import Link from "next/link";
import { useAppLocale } from "@/components/app-locale-provider";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";

export default function PrivacyPage() {
  const locale = useAppLocale();
  const isDe = locale === "de";
  const t = isDe ? deContent : enContent;

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 sm:px-7 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
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
              ? "Bei Fragen zum Datenschutz kontaktiere uns unter privacy@translayr.com."
              : "For privacy-related questions, contact us at privacy@translayr.com."}
          </p>
        </div>
      </div>
    </main>
  );
}

const deContent = {
  lastUpdated: "Stand: April 2026",
  title: "Datenschutzerklärung",
  intro:
    "Der Schutz deiner persönlichen Daten hat für Translayr höchste Priorität. Diese Datenschutzerklärung informiert dich darüber, welche Daten wir erheben, wie wir sie verwenden und welche Rechte du hast.",
  sections: [
    {
      id: "controller",
      heading: "1. Verantwortlicher",
      paragraphs: [
        "Verantwortlich für die Datenverarbeitung ist:",
        "Translayr GmbH, Musterstraße 1, 10115 Berlin, Deutschland",
        "E-Mail: privacy@translayr.com"
      ]
    },
    {
      id: "collected-data",
      heading: "2. Erhobene Daten",
      paragraphs: [
        "Wir erheben folgende Kategorien personenbezogener Daten:",
      ],
      list: [
        "Kontodaten: E-Mail-Adresse, Name, Passwort (verschlüsselt)",
        "Nutzungsdaten: Übersetzungsvolumen, genutzte Funktionen, Login-Zeitpunkte",
        "Inhaltsdaten: Hochgeladene Dateien und eingegebene Texte zur Übersetzung",
        "Technische Daten: IP-Adresse, Browser, Betriebssystem, Zugriffszeitpunkte",
        "Abrechnungsdaten: Gewählter Tarif, Zahlungsverlauf, Credit-Nutzung"
      ]
    },
    {
      id: "purpose",
      heading: "3. Zweck der Verarbeitung",
      paragraphs: [
        "Deine Daten werden ausschließlich für folgende Zwecke verarbeitet:",
      ],
      list: [
        "Bereitstellung und Betrieb des Übersetzungsdienstes",
        "Benutzerverwaltung und Authentifizierung",
        "Abrechnung und Credit-Verwaltung",
        "Verbesserung der Übersetzungsqualität und des Produkts",
        "Erfüllung gesetzlicher Aufbewahrungspflichten"
      ]
    },
    {
      id: "legal-basis",
      heading: "4. Rechtsgrundlage",
      paragraphs: [
        "Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Für die Abrechnung speichern wir Daten zusätzlich auf Grundlage gesetzlicher Aufbewahrungspflichten (§ 257 HGB, § 147 AO)."
      ]
    },
    {
      id: "third-parties",
      heading: "5. Weitergabe an Dritte",
      paragraphs: [
        "Eine Weitergabe deiner Daten an Dritte erfolgt nur in folgenden Fällen:",
      ],
      list: [
        "Zahlungsabwicklung über Stripe (Zahlungsdienstleister)",
        "Hosting und Infrastruktur über Supabase",
        "Übersetzungsverarbeitung über OpenAI API",
        "Erfüllung gesetzlicher Meldepflichten"
      ]
    },
    {
      id: "retention",
      heading: "6. Speicherdauer",
      paragraphs: [
        "Deine Daten werden so lange gespeichert, wie sie für die Bereitstellung des Dienstes erforderlich sind oder gesetzliche Aufbewahrungsfristen bestehen.",
        "Nach Löschung deines Kontos werden personenbezogene Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
        "Übersetzungsinhalte werden nach Abschluss der Verarbeitung nicht dauerhaft gespeichert."
      ]
    },
    {
      id: "rights",
      heading: "7. Deine Rechte",
      paragraphs: [
        "Du hast jederzeit folgende Rechte bezüglich deiner personenbezogenen Daten:",
      ],
      list: [
        "Recht auf Auskunft über gespeicherte Daten (Art. 15 DSGVO)",
        "Recht auf Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
        "Recht auf Löschung (Art. 17 DSGVO)",
        "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)",
        "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)",
        "Recht auf Widerspruch (Art. 21 DSGVO)",
        "Recht auf Beschwerde bei einer Aufsichtsbehörde"
      ]
    },
    {
      id: "security",
      heading: "8. Datensicherheit",
      paragraphs: [
        "Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um deine Daten vor Verlust, Manipulation und unbefugtem Zugriff zu schützen.",
        "Dazu gehören unter anderem Verschlüsselung, regelmäßige Sicherheitsaudits und Zugriffskontrollen."
      ]
    },
    {
      id: "cookies",
      heading: "9. Cookies und lokale Speicherung",
      paragraphs: [
        "Translayr verwendet nur technisch notwendige Cookies und lokale Speicherung (localStorage) für die Sprachpräferenz. Es werden keine Tracking- oder Analyse-Cookies eingesetzt."
      ]
    },
    {
      id: "changes",
      heading: "10. Änderungen",
      paragraphs: [
        "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Produktänderungen anzupassen. Wesentliche Änderungen werden rechtzeitig kommuniziert."
      ]
    },
    {
      id: "contact",
      heading: "11. Kontakt",
      paragraphs: [
        "Bei Fragen zum Datenschutz erreichst du uns unter privacy@translayr.com.",
        "Du kannst dich außerdem an die zuständige Aufsichtsbehörde wenden: Berliner Beauftragte für Datenschutz und Informationsfreiheit, Friedrichstr. 219, 10969 Berlin."
      ]
    }
  ]
};

const enContent = {
  lastUpdated: "Effective: April 2026",
  title: "Privacy Policy",
  intro:
    "Protecting your personal data is a top priority for Translayr. This Privacy Policy informs you about what data we collect, how we use it, and what rights you have.",
  sections: [
    {
      id: "controller",
      heading: "1. Data Controller",
      paragraphs: [
        "The entity responsible for data processing is:",
        "Translayr GmbH, Musterstraße 1, 10115 Berlin, Germany",
        "Email: privacy@translayr.com"
      ]
    },
    {
      id: "collected-data",
      heading: "2. Data We Collect",
      paragraphs: [
        "We collect the following categories of personal data:",
      ],
      list: [
        "Account data: email address, name, password (encrypted)",
        "Usage data: translation volume, features used, login timestamps",
        "Content data: uploaded files and entered texts for translation",
        "Technical data: IP address, browser, operating system, access timestamps",
        "Billing data: selected plan, payment history, credit usage"
      ]
    },
    {
      id: "purpose",
      heading: "3. Purpose of Processing",
      paragraphs: [
        "Your data is processed exclusively for the following purposes:",
      ],
      list: [
        "Providing and operating the translation service",
        "User management and authentication",
        "Billing and credit administration",
        "Improving translation quality and the product",
        "Compliance with legal retention obligations"
      ]
    },
    {
      id: "legal-basis",
      heading: "4. Legal Basis",
      paragraphs: [
        "Processing is based on Art. 6(1)(b) GDPR (contract performance) and Art. 6(1)(f) GDPR (legitimate interest). For billing purposes, we additionally store data based on legal retention obligations."
      ]
    },
    {
      id: "third-parties",
      heading: "5. Sharing with Third Parties",
      paragraphs: [
        "Your data is shared with third parties only in the following cases:",
      ],
      list: [
        "Payment processing via Stripe (payment service provider)",
        "Hosting and infrastructure via Supabase",
        "Translation processing via OpenAI API",
        "Compliance with legal reporting obligations"
      ]
    },
    {
      id: "retention",
      heading: "6. Data Retention",
      paragraphs: [
        "Your data is stored for as long as necessary to provide the service or as required by legal retention periods.",
        "After account deletion, personal data is removed within 30 days unless legal retention obligations apply.",
        "Translation content is not permanently stored after processing is complete."
      ]
    },
    {
      id: "rights",
      heading: "7. Your Rights",
      paragraphs: [
        "You have the following rights regarding your personal data at any time:",
      ],
      list: [
        "Right of access to stored data (Art. 15 GDPR)",
        "Right to rectification of inaccurate data (Art. 16 GDPR)",
        "Right to erasure (Art. 17 GDPR)",
        "Right to restriction of processing (Art. 18 GDPR)",
        "Right to data portability (Art. 20 GDPR)",
        "Right to object (Art. 21 GDPR)",
        "Right to lodge a complaint with a supervisory authority"
      ]
    },
    {
      id: "security",
      heading: "8. Data Security",
      paragraphs: [
        "We employ technical and organizational security measures to protect your data from loss, manipulation, and unauthorized access.",
        "These include encryption, regular security audits, and access controls."
      ]
    },
    {
      id: "cookies",
      heading: "9. Cookies and Local Storage",
      paragraphs: [
        "Translayr uses only technically necessary cookies and local storage (localStorage) for language preferences. No tracking or analytics cookies are used."
      ]
    },
    {
      id: "changes",
      heading: "10. Changes",
      paragraphs: [
        "We reserve the right to update this Privacy Policy to reflect changes in legal requirements or product updates. Material changes will be communicated in a timely manner."
      ]
    },
    {
      id: "contact",
      heading: "11. Contact",
      paragraphs: [
        "For privacy-related questions, reach us at privacy@translayr.com.",
        "You may also contact the relevant supervisory authority: Berliner Beauftragte für Datenschutz und Informationsfreiheit, Friedrichstr. 219, 10969 Berlin, Germany."
      ]
    }
  ]
};
