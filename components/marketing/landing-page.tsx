"use client";

import Link from "next/link";

import { useAppLocale } from "@/components/app-locale-provider";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing/plans";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";
const PRIMARY_BUTTON_TONE_CLASS_NAME =
  "border border-[#dfd7cc] bg-[rgba(255,255,255,0.72)] text-[#161412] shadow-[0_4px_12px_rgba(17,15,13,0.03)] transition hover:bg-white";

type FeatureItem = {
  description: string;
  title: string;
};

type StepItem = {
  description: string;
  title: string;
};

type FaqItem = {
  answer: string;
  question: string;
};

type PricePlan = {
  buttonHref: string;
  buttonLabel: string;
  description: string;
  featured?: boolean;
  features: string[];
  id?: BillingPlanId;
  name: string;
  price: string;
  suffix?: string;
};

export function LandingPage() {
  const locale = useAppLocale();
  const copy =
    locale === "de"
      ? {
          navFeatures: "Features",
          navHowItWorks: "Ablauf",
          navPricing: "Preise",
          navBlog: "Story",
          navLogin: "Anmelden",
          navRegister: "Kostenlos starten",
          heroEyebrow: "Localization Infrastructure",
          heroTitleLead: "Übersetzungen launchen",
          heroTitleAccent: "ohne das Chaos.",
          heroBody:
            "Translayr verbindet deine Dateien, dein Team und deine Sprachen in einem klaren Workflow. Von Upload bis Export bleibt alles sichtbar, geprüft und startklar.",
          heroPrimary: "Kostenlos starten",
          heroSecondary: "Im Workspace anmelden",
          trustedBy: "Vertraut von mehreren Agenturen und Developern, die ihre Arbeit vereinfachen möchten",
          featuresEyebrow: "Features",
          featuresTitle: "Alles, was dein Localization-Workflow wirklich braucht.",
          featuresBody:
            "Gebaut für Teams, die in mehrere Märkte shippen. Keine Spreadsheet-Ketten, keine E-Mail-Threads und keine verlorenen Strings mehr.",
          howEyebrow: "Ablauf",
          howTitle: "Vom Upload bis Export in wenigen Minuten.",
          howBody:
            "Keine Setup-Calls, keine Implementierungsgebühren. Lade deine erste Datei hoch und dein Projekt ist in unter zwei Minuten live.",
          storyEyebrow: "Customer Story",
          storyQuoteLead: "Wir sind von vier verschiedenen Tools und einer Tabelle auf",
          storyQuoteEmphasis: "einen einzigen sauberen Prozess",
          storyQuoteTail: "gewechselt. Unser Release-Zyklus wurde drei Tage kürzer.",
          storyName: "Sarah Chen",
          storyRole: "Head of Product, Loomify",
          pricingEyebrow: "Pricing",
          pricingTitle: "Einfache Preise, ohne Überraschungen.",
          pricingBody:
            "Starte kostenlos und skaliere nur dann, wenn du es brauchst. Keine Kosten pro String und keine versteckten Gebühren.",
          faqEyebrow: "FAQs",
          faqTitle: "Häufige Fragen vor dem Start.",
          faqBody:
            "Die wichtigsten Punkte zu Dateiformaten, Team-Setup, Abrechnung und Export in einer kompakten Übersicht.",
          ctaEyebrow: "Get started",
          ctaTitle: "Dein nächster Release, in jeder Sprache.",
          ctaBody:
            "Schließe dich 140+ Teams an, die mit Translayr schneller shippen. Dein erstes Projekt ist in weniger als zwei Minuten aufgesetzt.",
          ctaPrimary: "Kostenlos starten",
          ctaSecondary: "Anmelden",
          footerCopyright: "© 2026 Translayr. Alle Rechte vorbehalten.",
          footerPrivacy: "Datenschutz",
          footerTerms: "AGB",
          footerStatus: "Status",
          footerBlog: "Blog",
          mockProjectLabel: "Alle Projekte",
          mockNew: "+ Neu",
          mockSidebarProjects: "Projekte",
          mockSidebarUsage: "Usage",
          mockSidebarGlossary: "Glossary",
          mockSidebarSettings: "Settings",
          mockActive: "Aktiv",
          mockFiles: "Dateien",
          mockDone: "Fertig",
          mockLangs: "Sprachen",
          mockStatusActive: "Aktiv",
          mockStatusReview: "Review",
          features: [
            {
              title: "Multi-Format Upload",
              description:
                "Ziehe XLIFF-, .po- oder .strings-Dateien direkt hinein. Wir lesen Struktur, extrahieren Strings und behalten deine Metadaten intakt."
            },
            {
              title: "Live-Fortschritt",
              description:
                "Verfolge den Status über alle Zielsprachen hinweg. Du siehst sofort, was fertig, in Review oder blockiert ist."
            },
            {
              title: "One-Click Export",
              description:
                "Exportiere geprüfte Übersetzungen im Originalformat. Ohne Reformatierung direkt zurück in deine Pipeline."
            },
            {
              title: "Team-Workspaces",
              description:
                "Lade Übersetzer, Reviewer und Projektverantwortliche ein. Rollenbasierter Zugriff bleibt dabei übersichtlich."
            },
            {
              title: "Gemeinsames Glossar",
              description:
                "Definiere Schlüsselbegriffe einmal und erzwinge sie projekt- und sprachübergreifend für echte Konsistenz."
            },
            {
              title: "Versionskontrolle",
              description:
                "Volle Historie auf jeder Datei. Rolle auf frühere Stände zurück und sehe genau, was sich geändert hat."
            }
          ] satisfies FeatureItem[],
          steps: [
            {
              title: "Dateien hochladen",
              description:
                "Ziehe deine XLIFF-, .po- oder .strings-Dateien hinein. Translayr parst sie sofort und erstellt automatisch ein Projekt."
            },
            {
              title: "Zuweisen und übersetzen",
              description:
                "Lade dein Team ein oder verbinde bestehende Translation Memorys. Weise Sprachen mit einem Klick zu."
            },
            {
              title: "Prüfen und exportieren",
              description:
                "Reviewe Strings mit Inline-Kommentaren und exportiere danach im Originalformat, bereit für den nächsten Deploy."
            }
          ] satisfies StepItem[],
          stats: [
            { value: "270K", label: "Übersetzte Strings" },
            { value: "98%", label: "Kundenzufriedenheit" },
            { value: "Mehrere", label: "Aktive Teams" },
            { value: "90+", label: "Unterstützte Sprachen" }
          ],
          storyMetrics: [
            { value: "3 Tage", label: "Schnellerer Release-Zyklus" },
            { value: "7 → 1", label: "Konsolidierte Tools" },
            { value: "12", label: "Ausgerollte Sprachen" }
          ],
          faqs: [
            {
              question: "Welche Dateiformate unterstützt Translayr?",
              answer:
                "Aktuell ist der Workflow auf XLIFF, .po und .strings ausgelegt. Diese Formate lassen sich direkt hochladen, bearbeiten und wieder im Originalformat exportieren."
            },
            {
              question: "Kann ich mein Team direkt einladen?",
              answer:
                "Ja. Projekte lassen sich für Übersetzer, Reviewer und weitere Beteiligte im Workspace organisieren, damit Übergaben nicht außerhalb des Tools passieren."
            },
            {
              question: "Wie funktioniert die Abrechnung?",
              answer:
                "Die Landingpage nutzt eure echten Plans aus dem Produkt: Free, Starter, Pro und Scale. Preise und Limits orientieren sich an den Daten aus dem Billing-Setup."
            },
            {
              question: "Bleibt der Export struktursicher?",
              answer:
                "Ja. Der Fokus des Produkts liegt darauf, Strings und Dateistruktur sauber zu halten, damit du Übersetzungen ohne manuelles Nacharbeiten zurück in deine Pipeline geben kannst."
            },
            {
              question: "Kann ich später auf einen größeren Plan wechseln?",
              answer:
                "Ja. Du kannst mit Free oder Starter beginnen und später im Billing-Bereich auf Starter, Pro oder Scale wechseln, wenn dein Volumen steigt."
            },
            {
              question: "Unterstützt Translayr mehrere Zielsprachen gleichzeitig?",
              answer:
                "Ja. Projekte sind darauf ausgelegt, mehrere Zielsprachen parallel zu verwalten, damit Fortschritt, Review und Export zentral im selben Ablauf bleiben."
            },
            {
              question: "Kann ich ein Glossar zentral pflegen?",
              answer:
                "Ja. Das Produkt enthält einen eigenen Glossar-Bereich, damit Begriffe nicht in einzelnen Projekten verloren gehen und teamweit konsistent bleiben."
            },
            {
              question: "Wo sehe ich den Fortschritt meiner Projekte?",
              answer:
                "Die Projektübersicht und die einzelnen Projektseiten zeigen dir Fortschritt, Dateistatus und Review-Zustände direkt im Dashboard an."
            },
            {
              question: "Brauche ich ein langes Setup oder Onboarding?",
              answer:
                "Nein. Der Einstieg ist bewusst schlank gehalten: registrieren oder anmelden, Datei hochladen und direkt im Projekt weiterarbeiten."
            }
          ] satisfies FaqItem[],
          plans: [
            {
              name: "Starter",
              price: "€0",
              suffix: "/ Monat",
              description: "Für Einzelpersonen und kleine Projekte, die mit Lokalisierung starten.",
              features: [
                "3 Projekte",
                "2 Sprachen pro Projekt",
                "5.000 Strings / Monat",
                "XLIFF-, .po- und .strings-Upload",
                "Community-Support"
              ],
              buttonLabel: "Kostenlos starten",
              buttonHref: "/register"
            },
            {
              name: "Pro",
              price: "€49",
              suffix: "/ Monat",
              description: "Für Teams, die regelmäßig in mehrere Märkte shippen.",
              features: [
                "Unbegrenzte Projekte",
                "Unbegrenzte Sprachen",
                "100.000 Strings / Monat",
                "Team-Workspaces & Rollen",
                "Gemeinsames Glossar",
                "Versionshistorie",
                "Priority Support"
              ],
              buttonLabel: "14 Tage Pro kostenlos",
              buttonHref: "/register"
            },
            {
              name: "Enterprise",
              price: "Custom",
              description: "Für Organisationen mit höheren Anforderungen an Sicherheit, Compliance und Volumen.",
              features: [
                "Alles aus Pro",
                "Unbegrenzte Strings",
                "SSO / SAML",
                "SLA-Garantie",
                "Dediziertes Onboarding",
                "Custom Integrations"
              ],
              buttonLabel: "Sales kontaktieren",
              buttonHref: "/login"
            }
          ] satisfies PricePlan[]
        }
      : {
          navFeatures: "Features",
          navHowItWorks: "How it works",
          navPricing: "Pricing",
          navBlog: "Blog",
          navLogin: "Sign in",
          navRegister: "Get started free",
          heroEyebrow: "Localization Infrastructure",
          heroTitleLead: "Ship translations",
          heroTitleAccent: "without the chaos.",
          heroBody:
            "Translayr connects your files, your team, and your languages in one clean workflow. From upload to export, everything stays tracked, reviewed, and ready.",
          heroPrimary: "Start for free",
          heroSecondary: "Sign in to your workspace",
          trustedBy: "Trusted by agencies and developers who want to make their work easier",
          featuresEyebrow: "Features",
          featuresTitle: "Everything your localization workflow needs.",
          featuresBody:
            "Built for teams that ship to multiple markets. No more spreadsheets, no more email threads, and no more missed strings.",
          howEyebrow: "How it works",
          howTitle: "From upload to export in minutes.",
          howBody:
            "No setup calls. No implementation fees. Upload your first file and your project is live in under two minutes.",
          storyEyebrow: "Customer Story",
          storyQuoteLead: "We went from managing localization in",
          storyQuoteEmphasis: "four different tools and a spreadsheet",
          storyQuoteTail: "to having everything in one place. Our release cycle got three days shorter.",
          storyName: "Sarah Chen",
          storyRole: "Head of Product, Loomify",
          pricingEyebrow: "Pricing",
          pricingTitle: "Simple pricing, no surprises.",
          pricingBody:
            "Start free, scale when you need to. No per-string fees and no hidden costs.",
          faqEyebrow: "FAQs",
          faqTitle: "Common questions before you start.",
          faqBody:
            "The key points on file formats, team setup, billing, and exports in one compact section.",
          ctaEyebrow: "Get started",
          ctaTitle: "Your next release, in every language.",
          ctaBody:
            "Join 140+ teams that ship faster with Translayr. Set up your first project in under two minutes.",
          ctaPrimary: "Start for free",
          ctaSecondary: "Sign in",
          footerCopyright: "© 2026 Translayr. All rights reserved.",
          footerPrivacy: "Privacy",
          footerTerms: "Terms",
          footerStatus: "Status",
          footerBlog: "Blog",
          mockProjectLabel: "All Projects",
          mockNew: "+ New",
          mockSidebarProjects: "Projects",
          mockSidebarUsage: "Usage",
          mockSidebarGlossary: "Glossary",
          mockSidebarSettings: "Settings",
          mockActive: "Active",
          mockFiles: "Files",
          mockDone: "Done",
          mockLangs: "Langs",
          mockStatusActive: "Active",
          mockStatusReview: "Review",
          features: [
            {
              title: "Multi-format upload",
              description:
                "Drop XLIFF, .po, or .strings files directly. We parse structure, extract strings, and keep your metadata intact."
            },
            {
              title: "Real-time progress",
              description:
                "Live completion tracking across all target languages. See exactly what is done, in review, and blocked."
            },
            {
              title: "One-click export",
              description:
                "Export reviewed translations in their original format. Drop straight into your build pipeline without reformatting."
            },
            {
              title: "Team workspaces",
              description:
                "Invite translators, reviewers, and project managers. Role-based access stays clear and lightweight."
            },
            {
              title: "Shared glossary",
              description:
                "Define key terms once and enforce them across every project and language for consistency at scale."
            },
            {
              title: "Version control",
              description:
                "Full history on every file. Roll back to any previous version and see exactly what changed."
            }
          ] satisfies FeatureItem[],
          steps: [
            {
              title: "Upload your files",
              description:
                "Drag in your XLIFF, .po, or .strings files. Translayr parses them instantly and creates a project automatically."
            },
            {
              title: "Assign and translate",
              description:
                "Invite your translators or connect your existing translation memory. Assign languages in one click."
            },
            {
              title: "Review and export",
              description:
                "Review strings with inline comments and export in original format, ready for your next deploy."
            }
          ] satisfies StepItem[],
          stats: [
            { value: "270K", label: "Strings translated" },
            { value: "98%", label: "Customer satisfaction" },
            { value: "Multiple", label: "Active teams" },
            { value: "90+", label: "Languages supported" }
          ],
          storyMetrics: [
            { value: "3 days", label: "Faster release cycle" },
            { value: "7 → 1", label: "Tools consolidated" },
            { value: "12", label: "Languages shipped" }
          ],
          faqs: [
            {
              question: "Which file formats does Translayr support?",
              answer:
                "The current workflow is designed for XLIFF, .po, and .strings. These formats can be uploaded directly, worked on, and exported again in their original structure."
            },
            {
              question: "Can I invite my team right away?",
              answer:
                "Yes. Projects can be organized for translators, reviewers, and other contributors inside the workspace so handoffs do not happen outside the product."
            },
            {
              question: "How does billing work?",
              answer:
                "The landing page now uses your real product plans: Free, Starter, Pro, and Scale. Prices and limits follow the existing billing definitions in the app."
            },
            {
              question: "Will exports stay structure-safe?",
              answer:
                "Yes. The product is built to keep strings and file structure intact so translations can go back into your pipeline without manual cleanup."
            },
            {
              question: "Can I move to a bigger plan later?",
              answer:
                "Yes. You can start on Free or Starter and switch to Starter, Pro, or Scale later from billing as your volume grows."
            },
            {
              question: "Does Translayr support multiple target languages at once?",
              answer:
                "Yes. Projects are designed to manage multiple target languages in parallel so progress, review, and export stay in one central workflow."
            },
            {
              question: "Can I manage a glossary centrally?",
              answer:
                "Yes. The product includes a dedicated glossary area so important terms do not get scattered across projects and stay consistent across the team."
            },
            {
              question: "Where can I see project progress?",
              answer:
                "The project overview and each project workspace show progress, file status, and review states directly inside the dashboard."
            },
            {
              question: "Do I need a long setup or onboarding?",
              answer:
                "No. The entry flow is intentionally lightweight: register or sign in, upload a file, and continue working directly inside a project."
            }
          ] satisfies FaqItem[],
          plans: [
            {
              name: "Starter",
              price: "€0",
              suffix: "/ month",
              description: "For individuals and small projects getting started with localization.",
              features: [
                "3 projects",
                "2 languages per project",
                "5,000 strings / month",
                "XLIFF, .po, and .strings upload",
                "Community support"
              ],
              buttonLabel: "Get started free",
              buttonHref: "/register"
            },
            {
              name: "Pro",
              price: "€49",
              suffix: "/ month",
              description: "For teams shipping to multiple markets on a regular cadence.",
              features: [
                "Unlimited projects",
                "Unlimited languages",
                "100,000 strings / month",
                "Team workspaces & roles",
                "Shared glossary",
                "Version history",
                "Priority support"
              ],
              buttonLabel: "Start Pro free for 14 days",
              buttonHref: "/register"
            },
            {
              name: "Enterprise",
              price: "Custom",
              description: "For organizations with advanced security, compliance, and volume needs.",
              features: [
                "Everything in Pro",
                "Unlimited strings",
                "SSO / SAML",
                "SLA guarantee",
                "Dedicated onboarding",
                "Custom integrations"
              ],
              buttonLabel: "Talk to sales",
              buttonHref: "/login"
            }
          ] satisfies PricePlan[]
        };

  const localizedPlanDescriptions =
    locale === "de"
      ? {
          free: "Zum Ausprobieren des Produkts, für kleinere Dateisets und geringe Lokalisierungsvolumen.",
          starter: "Für kleinere Lokalisierungs-Workloads und leichte wöchentliche Release-Zyklen.",
          pro: "Für Produktteams, die kontinuierlich in mehreren Sprachen veröffentlichen.",
          scale: "Für größere Teams, die Launches, QA und Exporte mit höherem Volumen koordinieren."
        }
      : {
          free: "For trying the product, smaller file sets, and low-volume localization work.",
          starter: "For smaller localization workloads and lightweight weekly release cycles.",
          pro: "For product teams shipping continuously across multiple locales.",
          scale: "For larger teams coordinating launches, QA, and exports at higher volume."
        };

  const localizedPlanFeatures =
    locale === "de"
      ? {
          free: ["1k monatliche Wörter", "Core XLIFF Translation", "Glossar-Basics"],
          starter: ["25k monatliche Wörter", "Projekt-Workspaces", "Glossar-Support"],
          pro: ["150k monatliche Wörter", "Review-Workflow", "Priorisierte Glossar-Injektion"],
          scale: ["400k monatliche Wörter", "Höherer Durchsatz", "Gemeinsame Team-Operationen"]
        }
      : {
          free: BILLING_PLANS.find((plan) => plan.id === "free")?.features ?? [],
          starter: BILLING_PLANS.find((plan) => plan.id === "starter")?.features ?? [],
          pro: BILLING_PLANS.find((plan) => plan.id === "pro")?.features ?? [],
          scale: BILLING_PLANS.find((plan) => plan.id === "scale")?.features ?? []
        };

  const pricingButtonLabels =
    locale === "de"
      ? {
          free: "Free starten",
          starter: "Starter wählen",
          pro: "Pro wählen",
          scale: "Scale wählen"
        }
      : {
          free: "Start Free",
          starter: "Choose Starter",
          pro: "Choose Pro",
          scale: "Choose Scale"
        };

  const pricingPlans: PricePlan[] = BILLING_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(plan.basePriceCents / 100),
    suffix: locale === "de" ? "/ Monat" : "/ month",
    description: localizedPlanDescriptions[plan.id],
    features: localizedPlanFeatures[plan.id],
    buttonLabel: pricingButtonLabels[plan.id],
    buttonHref: "/register",
    featured: plan.id === "pro"
  }));

  return (
    <main className="overflow-x-hidden bg-[#f7f3ed] text-[#161412]">
      <header className="sticky top-0 z-30 border-b border-[#e7dfd4] bg-[rgba(247,243,237,0.9)] backdrop-blur-md">
        <div className="relative mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3.5 sm:px-7 lg:px-8">
          <div className="pointer-events-none absolute inset-x-[38%] top-0 hidden h-full bg-[radial-gradient(circle,_rgba(255,255,255,0.9)_0%,_rgba(255,255,255,0)_72%)] lg:block" />
          <Link href="/" className="relative z-10 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#12100f] text-white shadow-[0_10px_24px_rgba(18,16,15,0.16)]">
              <BrandIcon />
            </span>
            <span className="text-[15px] font-medium tracking-[-0.03em]">Translayr</span>
          </Link>

          <nav className="relative z-10 hidden items-center gap-7 text-[13px] text-[#5e5750] md:flex">
            <a href="#features" className="transition hover:text-[#161412]">
              {copy.navFeatures}
            </a>
            <a href="#how-it-works" className="transition hover:text-[#161412]">
              {copy.navHowItWorks}
            </a>
            <a href="#pricing" className="transition hover:text-[#161412]">
              {copy.navPricing}
            </a>
            <a href="#story" className="transition hover:text-[#161412]">
              {copy.navBlog}
            </a>
          </nav>

          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dfd7cc] bg-[rgba(255,255,255,0.68)] px-4 text-[13px] font-medium text-[#161412] shadow-[0_4px_12px_rgba(17,15,13,0.03)] transition hover:bg-white"
            >
              {copy.navLogin}
            </Link>
            <Link
              href="/register"
              className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-[13px] font-medium ${PRIMARY_BUTTON_TONE_CLASS_NAME}`}
            >
              {copy.navRegister}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-8">
        <section className="grid gap-8 border-b border-[#ece3d8] py-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-10 lg:py-15">
          <div className="max-w-[500px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#a29a92]">/ {copy.heroEyebrow}</p>
            <h1
              className={`${DISPLAY_FONT_CLASS_NAME} mt-5 text-[clamp(2.5rem,5vw,4.1rem)] leading-[0.92] text-[#12100f]`}
            >
              <span className="block">{copy.heroTitleLead}</span>
              <span className="mt-2 block italic text-[#57514a]">{copy.heroTitleAccent}</span>
            </h1>
            <p className="mt-6 max-w-[500px] text-[15px] leading-[1.8] tracking-[-0.02em] text-[#5f5851]">
              {copy.heroBody}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className={`inline-flex h-[46px] items-center justify-center rounded-xl px-6 text-[14px] font-medium ${PRIMARY_BUTTON_TONE_CLASS_NAME}`}
              >
                {copy.heroPrimary}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[14px] font-medium tracking-[-0.02em] text-[#5d5750] transition hover:text-[#2b2723]"
              >
                {copy.heroSecondary}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <DashboardPreview
            projectLabel={copy.mockProjectLabel}
            newLabel={copy.mockNew}
            activeLabel={copy.mockActive}
            filesLabel={copy.mockFiles}
            doneLabel={copy.mockDone}
            langsLabel={copy.mockLangs}
            sidebarProjects={copy.mockSidebarProjects}
            sidebarUsage={copy.mockSidebarUsage}
            sidebarGlossary={copy.mockSidebarGlossary}
            sidebarSettings={copy.mockSidebarSettings}
            activeStatus={copy.mockStatusActive}
            reviewStatus={copy.mockStatusReview}
          />
        </section>

        <section className="border-b border-[#ece3d8] py-5">
          <div className="flex flex-wrap items-center gap-5 text-[#bbb1a5]">
            <span className="text-[12px] font-medium uppercase tracking-[0.18em]">{copy.trustedBy}</span>
          </div>
        </section>

        <section id="features" className="py-14 lg:py-16">
          <div className="max-w-[620px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#a29a92]">/ {copy.featuresEyebrow}</p>
            <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[0.98]`}>
              {copy.featuresTitle}
            </h2>
            <p className="mt-5 max-w-[620px] text-[15px] leading-[1.75] tracking-[-0.02em] text-[#5f5851]">
              {copy.featuresBody}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[24px] border border-[#e3dacc] bg-white shadow-[0_16px_40px_rgba(22,20,18,0.04)]">
            <div className="grid md:grid-cols-2 xl:grid-cols-3">
              {copy.features.map((feature, index) => (
                <FeatureCard key={feature.title} index={index} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-14 lg:py-16">
          <div className="max-w-[620px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#a29a92]">/ {copy.howEyebrow}</p>
            <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[0.98]`}>
              {copy.howTitle}
            </h2>
            <p className="mt-5 max-w-[620px] text-[15px] leading-[1.75] tracking-[-0.02em] text-[#5f5851]">
              {copy.howBody}
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
            {copy.steps.map((step, index) => (
              <HowItWorksCard
                key={step.title}
                index={index}
                step={step}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="bg-[#121110] text-white">
        <div className="mx-auto grid max-w-[1240px] gap-px px-5 sm:px-7 lg:grid-cols-4 lg:px-8">
          {copy.stats.map((stat) => (
            <div key={stat.label} className="border-b border-[#2b2927] px-4 py-8 last:border-b-0 lg:border-b-0 lg:border-l lg:border-[#2b2927] lg:px-7 lg:first:border-l-0">
              <div className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(2.2rem,3vw,3rem)] leading-none text-white`}>
                {stat.value}
              </div>
              <div className="mt-2 text-[14px] text-[#9d9790]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-8">
        <section id="story" className="py-14 lg:py-16">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#a29a92]">/ {copy.storyEyebrow}</p>
          <div className="mt-7 grid gap-8 rounded-[24px] border border-[#e3dacc] bg-white p-6 shadow-[0_16px_40px_rgba(22,20,18,0.04)] lg:grid-cols-[1.7fr_0.7fr] lg:p-8">
            <div>
              <blockquote className={`${DISPLAY_FONT_CLASS_NAME} max-w-[840px] text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.08] text-[#171412]`}>
                &ldquo;{copy.storyQuoteLead} <span className="italic text-[#57514a]">{copy.storyQuoteEmphasis}</span>{" "}
                {copy.storyQuoteTail}&rdquo;
              </blockquote>
              <div className="mt-8">
                <div className="text-[20px] font-medium tracking-[-0.04em] text-[#171412]">{copy.storyName}</div>
                <div className="mt-1 text-[15px] text-[#9a9289]">{copy.storyRole}</div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6">
              {copy.storyMetrics.map((metric) => (
                <div key={metric.label} className="border-t border-[#ece6dc] pt-7 first:border-t-0 first:pt-0">
                  <div className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(2rem,2.4vw,2.6rem)] leading-none text-[#171412]`}>
                    {metric.value}
                  </div>
                  <div className="mt-2 text-[14px] text-[#a29a92]">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-14 lg:py-16">
          <div className="max-w-[620px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#a29a92]">/ {copy.pricingEyebrow}</p>
            <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[0.98]`}>
              {copy.pricingTitle}
            </h2>
            <p className="mt-5 max-w-[620px] text-[15px] leading-[1.75] tracking-[-0.02em] text-[#5f5851]">
              {copy.pricingBody}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[24px] border border-[#e3dacc] bg-white shadow-[0_16px_40px_rgba(22,20,18,0.04)]">
            <div className="grid md:grid-cols-2 xl:grid-cols-4">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} highlighted={Boolean(plan.featured)} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-16">
          <div className="max-w-[620px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#a29a92]">/ {copy.faqEyebrow}</p>
            <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[0.98]`}>
              {copy.faqTitle}
            </h2>
            <p className="mt-5 max-w-[620px] text-[15px] leading-[1.75] tracking-[-0.02em] text-[#5f5851]">
              {copy.faqBody}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[24px] border border-[#e3dacc] bg-white shadow-[0_16px_40px_rgba(22,20,18,0.04)]">
            {copy.faqs.map((faq, index) => (
              <FaqRow
                key={faq.question}
                faq={faq}
                isLast={index === copy.faqs.length - 1}
              />
            ))}
          </div>
        </section>

        <section className="border-t border-[#ece3d8] py-14 lg:py-16">
          <div className="rounded-[24px] border border-[#e3dacc] bg-white px-6 py-12 text-center shadow-[0_16px_40px_rgba(22,20,18,0.04)] sm:px-10">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#a29a92]">/ {copy.ctaEyebrow}</p>
            <h2 className={`${DISPLAY_FONT_CLASS_NAME} mx-auto mt-4 max-w-[560px] text-[clamp(2.1rem,4vw,3.3rem)] leading-[0.96]`}>
              {copy.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-[1.75] tracking-[-0.02em] text-[#5f5851]">
              {copy.ctaBody}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className={`inline-flex h-[46px] items-center justify-center rounded-xl px-6 text-[14px] font-medium ${PRIMARY_BUTTON_TONE_CLASS_NAME}`}
              >
                {copy.ctaPrimary}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[14px] font-medium tracking-[-0.02em] text-[#5d5750] transition hover:text-[#2b2723]"
              >
                {copy.ctaSecondary}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-[#ece3d8] py-6 text-[14px] text-[#afa69b] sm:flex-row sm:items-center sm:justify-between">
          <div>{copy.footerCopyright}</div>
          <div className="flex flex-wrap items-center gap-7">
            <span>{copy.footerPrivacy}</span>
            <span>{copy.footerTerms}</span>
            <span>{copy.footerStatus}</span>
            <span>{copy.footerBlog}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function DashboardPreview({
  projectLabel,
  newLabel,
  activeLabel,
  filesLabel,
  doneLabel,
  langsLabel,
  sidebarProjects,
  sidebarUsage,
  sidebarGlossary,
  sidebarSettings,
  activeStatus,
  reviewStatus
}: {
  projectLabel: string;
  newLabel: string;
  activeLabel: string;
  filesLabel: string;
  doneLabel: string;
  langsLabel: string;
  sidebarProjects: string;
  sidebarUsage: string;
  sidebarGlossary: string;
  sidebarSettings: string;
  activeStatus: string;
  reviewStatus: string;
}) {
  const metrics = [
    { value: "4", label: activeLabel },
    { value: "18", label: filesLabel },
    { value: "78%", label: doneLabel },
    { value: "6", label: langsLabel }
  ];

  const rows = [
    { title: "WPML Platform Refresh", status: activeStatus, tone: "positive", progress: "68%" },
    { title: "Developer Docs Sync", status: reviewStatus, tone: "review", progress: "84%" },
    { title: "Help Center Migration", status: activeStatus, tone: "positive", progress: "74%" },
    { title: "Shopify Launch Kit", status: reviewStatus, tone: "review", progress: "35%" }
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="absolute inset-x-12 top-8 h-16 rounded-full bg-[rgba(195,182,164,0.34)] blur-3xl" />
      <div className="relative overflow-hidden rounded-[20px] border border-[#e5ddd2] bg-white shadow-[0_24px_44px_rgba(20,18,16,0.08)]">
        <div className="flex items-center gap-3 border-b border-[#eee6dc] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 rounded-xl border border-[#ece4d9] bg-[#faf7f2] px-4 py-2 text-[12px] text-[#b4aaa0]">
            app.translayr.io/projects
          </div>
        </div>

        <div className="grid grid-cols-[124px_1fr] lg:grid-cols-[145px_1fr]">
          <aside className="border-r border-[#eee6dc] bg-[#fbfaf8] px-3 py-4">
            <div className="flex items-center gap-2.5 border-b border-[#efebe5] pb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#12100f] text-white">
                <BrandIcon />
              </span>
              <span className="text-[13px] font-semibold tracking-[-0.03em] text-[#161412]">Translayr</span>
            </div>

            <div className="mt-4 space-y-2 text-[13px] text-[#9f968c]">
              <div className="rounded-lg bg-[#f1ede7] px-3 py-2 font-medium text-[#161412]">{sidebarProjects}</div>
              <div className="px-3 py-1">{sidebarUsage}</div>
              <div className="px-3 py-1">{sidebarGlossary}</div>
              <div className="px-3 py-1">{sidebarSettings}</div>
            </div>
          </aside>

          <div className="px-4 py-4 lg:px-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-[15px] font-semibold tracking-[-0.03em] text-[#161412]">{projectLabel}</h3>
              <button
                type="button"
                className="inline-flex h-7 items-center justify-center rounded-lg bg-[#34302b] px-3 text-[11px] font-medium text-white"
              >
                {newLabel}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-[#eee5db] bg-[#fbfaf8] p-2.5">
                  <div className="text-[19px] font-semibold tracking-[-0.05em] text-[#161412]">{metric.value}</div>
                  <div className="mt-1 text-[11px] text-[#b2a89e]">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-[18px] border border-[#efe6dc]">
              {rows.map((row, index) => (
                <div
                  key={row.title}
                  className={[
                    "grid grid-cols-[minmax(0,1fr)_62px_62px] items-center gap-3 px-3.5 py-3",
                    index === rows.length - 1 ? "" : "border-b border-[#f1ebe4]"
                  ].join(" ")}
                >
                  <div className="text-[12px] font-medium tracking-[-0.02em] text-[#171412]">{row.title}</div>
                  <div
                    className={[
                      "text-right text-[11px] font-medium",
                      row.tone === "positive" ? "text-[#328156]" : "text-[#9b6a15]"
                    ].join(" ")}
                  >
                    {row.status}
                  </div>
                  <div className="h-[3px] rounded-full bg-[#efe8df]">
                    <div
                      className={[
                        "h-[3px] rounded-full",
                        row.tone === "positive" ? "bg-[#3a8e62]" : "bg-[#b38a42]"
                      ].join(" ")}
                      style={{ width: row.progress }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ index, feature }: { index: number; feature: FeatureItem }) {
  const icons = [UploadIcon, ProgressIcon, ExportIcon, GridIcon, HomeIcon, VersionIcon];
  const Icon = icons[index] ?? UploadIcon;

  return (
    <article className="border-b border-[#e9e1d5] p-5 md:border-r md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+1)]:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 xl:[&:nth-last-child(-n+3)]:border-b-0">
      <div className="text-[12px] font-medium tracking-[0.14em] text-[#b0a69c]">{String(index + 1).padStart(2, "0")}</div>
      <div className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#ebe2d6] bg-[#fbfaf8] text-[#5d554e] shadow-[0_8px_18px_rgba(21,18,14,0.04)]">
        <Icon />
      </div>
      <h3 className="mt-5 text-[22px] font-medium tracking-[-0.045em] text-[#171412]">{feature.title}</h3>
      <p className="mt-3 max-w-[320px] text-[14px] leading-[1.75] tracking-[-0.02em] text-[#655d56]">{feature.description}</p>
    </article>
  );
}

function HowItWorksCard({
  index,
  step
}: {
  index: number;
  step: StepItem;
}) {
  return (
    <article className="relative pt-5">
      <div className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd4c9] bg-white text-[18px] font-medium text-[#171412] shadow-[0_8px_22px_rgba(21,18,14,0.04)]">
        {index + 1}
      </div>
      <h3 className="mt-4 text-[22px] font-medium tracking-[-0.045em] text-[#171412]">{step.title}</h3>
      <p className="mt-3 max-w-[320px] text-[14px] leading-[1.75] tracking-[-0.02em] text-[#655d56]">{step.description}</p>
    </article>
  );
}

function FaqRow({ faq, isLast }: { faq: FaqItem; isLast: boolean }) {
  return (
    <details className={["group px-5 py-5", isLast ? "" : "border-b border-[#ece3d8]"].join(" ")}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium tracking-[-0.02em] text-[#171412] [&::-webkit-details-marker]:hidden">
        <span>{faq.question}</span>
        <span className="text-[18px] text-[#9a9085] transition group-open:rotate-45">+</span>
      </summary>
      <p className="max-w-[760px] pt-3 text-[14px] leading-[1.75] tracking-[-0.02em] text-[#655d56]">
        {faq.answer}
      </p>
    </details>
  );
}

function PricingCard({ plan, highlighted }: { plan: PricePlan; highlighted: boolean }) {
  const eyebrowClassName = highlighted ? "text-[#8f857a]" : "text-[#a59b90]";
  const suffixClassName = highlighted ? "text-[#8f857a]" : "text-[#9d9489]";
  const descriptionClassName = highlighted ? "text-[#615851]" : "text-[#685f58]";
  const featureTextClassName = highlighted ? "text-[#534b45]" : "text-[#5f5750]";

  return (
    <article
      className={[
        "flex h-full flex-col border-b border-[#ece3d8] p-6 lg:border-b-0 lg:border-r",
        highlighted
          ? "border-[#ddd4c8] bg-[#f4efe8] text-[#171412]"
          : "border-[#ece3d8] bg-white text-[#171412]",
        "last:border-r-0"
      ].join(" ")}
    >
      <div className={`text-[11px] font-medium uppercase tracking-[0.16em] ${eyebrowClassName}`}>{plan.name}</div>
      <div className="mt-5 flex items-end gap-2">
        <span className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(2.6rem,3vw,3.4rem)] leading-none`}>
          {plan.price}
        </span>
        {plan.suffix ? <span className={`pb-1 text-[14px] ${suffixClassName}`}>{plan.suffix}</span> : null}
      </div>
      <p className={`mt-4 max-w-[260px] text-[14px] leading-[1.7] tracking-[-0.02em] ${descriptionClassName}`}>
        {plan.description}
      </p>

      <ul className="mt-7 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className={`flex items-start gap-3 text-[14px] leading-[1.6] ${featureTextClassName}`}>
            <span
              className={[
                "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                highlighted ? "border-[#ddd2c7] bg-white text-[#34302b]" : "border-[#e7ddd0] bg-[#fbfaf8] text-[#34302b]"
              ].join(" ")}
            >
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Link
          href={plan.buttonHref}
          className={[
            "inline-flex h-[44px] w-full items-center justify-center rounded-xl border text-[14px] font-medium transition",
            highlighted
              ? "border-[#dcd3c8] bg-white text-[#34302b] hover:bg-[#faf7f2]"
              : "border-[#d8d0c5] bg-[#faf7f2] text-[#34302b] hover:bg-[#f3ede5]"
          ].join(" ")}
        >
          {plan.buttonLabel}
        </Link>
      </div>
    </article>
  );
}

function BrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
      <path d="M5 6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v10.4A2.8 2.8 0 0 1 16.2 20H7.8A2.8 2.8 0 0 1 5 17.2V6.8Zm4.3 1.2v1.8h5.4V8H9.3Zm0 3.6v1.8h5.4v-1.8H9.3Zm0 3.6V17h3.6v-1.8H9.3Z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
      <path d="M6 16.5v1.2A1.3 1.3 0 0 0 7.3 19h9.4A1.3 1.3 0 0 0 18 17.7v-1.2" />
      <path d="M12 5v10.5" />
      <path d="m8.5 8.5 3.5-3.5 3.5 3.5" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
      <path d="M6 12h10" />
      <path d="m12 8 4 4-4 4" />
      <path d="M6 5h10a3 3 0 0 1 3 3v8" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
      <rect x="5" y="5" width="5" height="5" rx="1.2" />
      <rect x="14" y="5" width="5" height="5" rx="1.2" />
      <rect x="5" y="14" width="5" height="5" rx="1.2" />
      <rect x="14" y="14" width="5" height="5" rx="1.2" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
      <path d="m5 10.5 7-5.5 7 5.5v7.7a.8.8 0 0 1-.8.8H5.8a.8.8 0 0 1-.8-.8v-7.7Z" />
      <path d="M9.8 19v-5.8h4.4V19" />
    </svg>
  );
}

function VersionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
      <path d="M6 12a6 6 0 1 0 2-4.5" />
      <path d="M6 5v4h4" />
    </svg>
  );
}
