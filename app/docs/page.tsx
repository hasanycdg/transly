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

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-7 lg:px-8">
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            / Documentation
          </p>
          <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2.6rem,4vw,4.2rem)] leading-[0.92]`}>
            How to use Translayr.
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] leading-8 text-[var(--muted)]">
            Everything you need to know about translating files, managing projects, using glossaries, and running your localization workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[var(--foreground)] px-5 text-[13px] font-medium text-[var(--surface)] transition hover:opacity-90"
            >
              Start free
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
            >
              Back home
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="sticky top-8 self-start">
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
                Contents
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
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="min-w-0">
            {activeSection === "getting-started" && <GettingStartedSection />}
            {activeSection === "workspace" && <WorkspaceSection />}
            {activeSection === "file-translation" && <FileTranslationSection />}
            {activeSection === "text-translation" && <TextTranslationSection />}
            {activeSection === "glossary" && <GlossarySection />}
            {activeSection === "projects" && <ProjectsSection />}
            {activeSection === "billing" && <BillingSection />}
            {activeSection === "settings" && <SettingsSection />}
            {activeSection === "formats" && <FormatsSection />}
            {activeSection === "faq" && <FaqSection />}
          </div>
        </div>
      </div>
    </main>
  );
}

function GettingStartedSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Getting started
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        Translayr is an AI-powered translation workspace for teams that need to ship localized content. Instead of juggling files across tools, you work in one surface: create projects, upload files, review translations, and export – all in one flow.
      </p>

      <div className="mt-8 space-y-6">
        <DocStep
          number={1}
          title="Create your account"
          body="Sign up with your email, choose a workspace name, and set a password. Your workspace is created automatically and you start on the Free plan with 1,000 monthly word credits."
        />
        <DocStep
          number={2}
          title="Set your preferences"
          body="Go to Settings → Translation to configure your default source language, target language, and tone profile. These defaults are applied to new projects and file uploads so you do not have to select them every time."
        />
        <DocStep
          number={3}
          title="Create your first project"
          body="From the dashboard, click New Project. Give it a name, select source and target languages, and optionally enable a glossary. Projects group related files and translations together."
        />
        <DocStep
          number={4}
          title="Upload files or translate text"
          body="Inside a project, drag and drop files to upload them. Supported formats include XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX. For quick one-off translations, use the Text Translation surface from the sidebar."
        />
        <DocStep
          number={5}
          title="Review and export"
          body="Once translation is complete, review the output side-by-side with the original. When you are satisfied, download individual files or export the entire project as a ZIP."
        />
      </div>

      <div className="mt-8 rounded-[18px] border border-[var(--border-light)] bg-[var(--background-strong)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
          Quick tip
        </p>
        <p className="mt-2 text-[14px] leading-7 text-[var(--muted)]">
          One credit equals one word. Your monthly credit limit depends on your plan. Text translations and file translations both draw from the same credit pool. You can monitor your usage on the Usage page.
        </p>
      </div>
    </div>
  );
}

function WorkspaceSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Workspace
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        The workspace is your central operating surface. It brings together projects, usage metrics, recent activity, and target languages into one view.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Dashboard</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            The dashboard shows your key metrics at a glance: total words translated, estimated cost, savings compared to agency rates, and remaining credits. Below that you will find projects that need attention, your current operating state, recent activity, and a breakdown of target languages by volume.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Sidebar navigation</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            The left sidebar gives you quick access to Dashboard, Projects (expandable list), Usage, Glossary, Notifications, Support, Billing, and Settings. Your current workspace name and plan are displayed at the bottom of the sidebar.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Projects overview</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            The Projects page lists all your translation projects. You can search by name, filter by status (Active, In Review, Archived), and see stats for total projects, active runs, and total words. Click any project to open its workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

function FileTranslationSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        File translation
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        File translation is the core of Translayr. Upload localization files, get them translated by AI, review the output, and download in the original format.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Uploading files</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Inside a project, drag and drop files onto the upload zone or click to browse. You can upload multiple files at once. ZIP archives are automatically extracted – any supported translation files inside the ZIP will be added to the queue.
          </p>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Before translation starts, the system counts the words in each file and shows you the estimated credit cost. This lets you confirm before spending credits.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Translation workflow</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            After upload, files enter a queue. Select the files you want to translate and click Start Translation. Each file goes through these states:
          </p>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[var(--muted)]">
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Queued</span> – waiting to be processed
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Processing</span> – currently being translated
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Review</span> – translation complete, ready for review
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Done</span> – reviewed and finalized
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Error</span> – translation failed (can be retried)
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Review</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Click Review on any completed file to open the side-by-side view. The original content is shown on the left and the translated output on the right. This lets you verify quality before exporting.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Export</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Download individual translated files or export the entire project as a ZIP. The filename format can be configured in Settings → Preferences (Original + target locale, Original + source + target, or Project slug + locale).
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Auto-download</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Enable auto-download in Settings → Preferences to automatically download finished files to your computer as soon as translation completes.
          </p>
        </div>
      </div>
    </div>
  );
}

function TextTranslationSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Text translation
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        Text translation is for quick, one-off translations that do not need a project wrapper. Ideal for product copy, support replies, UI strings, and marketing text.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">How it works</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Paste or type your text into the input area. Select the source language (or leave it on Auto Detect), choose your target language, and pick a tone style. Click Translate and the result appears immediately.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Tone options</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Choose from five tone styles to match your use case:
          </p>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[var(--muted)]">
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Neutral</span> – balanced, general purpose
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Formal</span> – professional, business-appropriate
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Informal</span> – casual, conversational
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Marketing</span> – engaging, persuasive
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[var(--foreground)]">Technical</span> – precise, terminology-focused
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Copy and export</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Copy the translated text to your clipboard with one click, or export it as a TXT file. The word and character count is shown below the input area so you know the credit impact before translating.
          </p>
        </div>
      </div>
    </div>
  );
}

function GlossarySection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Glossary
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        The glossary lets you define approved translations for key terms, brand names, product labels, and technical vocabulary. Glossary entries are automatically injected during translation to ensure consistency.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Terms</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Each glossary term has a source text, source language, translations for one or more target locales, a status (Draft, Review, Approved, Archived), and an optional protected flag. Protected terms are locked and always used exactly as defined – ideal for brand names and product labels.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Collections</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Collections let you group terms by feature, brand, client, or any category you choose. This makes it easier to manage large glossaries and apply terms selectively to specific projects.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">CSV import</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Import glossary terms from a CSV file. The CSV should have a `source` column for the source text, optional metadata columns, and locale-based translation columns (e.g., `de`, `fr`, `en`). This is the fastest way to populate a glossary for an existing project.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Automatic injection</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Enable "Use Glossary Automatically" in Settings → Translation to have approved glossary terms automatically injected during file and text translation. "Strict Glossary Mode" forces the translation to prefer glossary-approved wording over the AI model's suggestions.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Projects
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        Projects are the containers for your translation work. Each project groups related files, tracks progress, and maintains its own language pair and glossary settings.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Creating a project</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Click New Project from the Projects page or the dashboard. Fill in the project name, optional description, source language, target languages, and toggle the glossary on or off. Click Create to start.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Project workspace</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Each project has its own workspace showing: total files, completed count, files in review, failed files, total words, and quality score. A progress bar shows overall translation status. Below that you will find the upload zone, translation run status, files table, and recent activity.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">File management</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            The files table shows every file in the project with its filename, language pair, status badge, progress bar, and last updated timestamp. Actions per file include: Review (side-by-side view), Download, Retry (for failed files), and Delete.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Project statuses</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Projects can be Active (actively being worked on), In Review (under review before release), Error (one or more files failed), or Archived (completed and no longer active).
          </p>
        </div>
      </div>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Billing & Credits
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        Translayr uses a credit-based model where one credit equals one word. Your monthly credit limit depends on your plan. Both file and text translations draw from the same credit pool.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Plans</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">Plan</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">Price</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">Monthly credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                <tr>
                  <td className="px-4 py-3 font-medium">Free</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$0</td>
                  <td className="px-4 py-3 text-[var(--muted)]">1,000 words</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Starter</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$19/mo</td>
                  <td className="px-4 py-3 text-[var(--muted)]">50,000 words</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Pro</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$49/mo</td>
                  <td className="px-4 py-3 text-[var(--muted)]">200,000 words</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Scale</td>
                  <td className="px-4 py-3 text-[var(--muted)]">$99/mo</td>
                  <td className="px-4 py-3 text-[var(--muted)]">700,000 words</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Monthly vs Yearly</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Paid plans can be billed monthly or yearly. Yearly billing gives you a 2-month discount (you pay for 10 months, get 12). All prices exclude VAT.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Upgrading and downgrading</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Upgrade at any time from the Billing page. New paid subscriptions open in Stripe Checkout. Existing subscribers can switch plans instantly. If you downgrade, the change takes effect at the start of your next billing cycle.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Invoices and payment method</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Your Billing page shows invoice history, current billing cycle details, and the payment method on file. Click "Open Stripe Portal" to manage your payment method, view detailed invoices, or update billing information directly in Stripe.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Usage monitoring</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            The Usage page shows your credit consumption trends, breakdown by project and language, top files by word count, and a real-time activity feed. This helps you understand where your credits are going and optimize your workflow.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Settings
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        Settings are organized into five sections: Profile, Translation, Preferences, Notifications, and Danger Zone.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Profile</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Manage your personal name, email (primary login address), company name, billing address, and password. The workspace members panel also lives here – invite team members with roles (Owner, Admin, Editor, Reviewer, Viewer) and track their status (Invited, Active, Disabled).
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Translation</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Configure how translations behave: source language mode (Auto Detect or Manual), default target language, tone profile, strict tag protection, fail on tag mismatch, glossary auto-injection, strict glossary mode, and AI behavior (Fast, Balanced, High Quality).
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Preferences</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Set your app language (English or German), toggle auto-download after translation, and choose the default filename format for exported files.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Notifications</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Control which events trigger notifications: translation ready, invoice created, payment failed, spending limit reached, review reminders, and in-app notifications. All email notifications are sent to your primary workspace email.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold tracking-[-0.03em]">Danger Zone</h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            Permanent account deletion. This action cannot be undone. All projects, files, glossary terms, and usage data will be irreversibly removed.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormatsSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Supported formats
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
        Translayr supports a wide range of localization and document formats. All formats preserve the original structure, tags, and placeholders during translation.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormatCard
          format="XLIFF / XLF"
          extensions=".xliff, .xlf"
          description="Industry standard for localization. Full tag and structure protection."
        />
        <FormatCard
          format="PO"
          extensions=".po"
          description="GNU gettext format. Widely used in open source and web projects."
        />
        <FormatCard
          format="Strings"
          extensions=".strings"
          description="Apple localization format for iOS and macOS apps."
        />
        <FormatCard
          format="RESX"
          extensions=".resx"
          description="Microsoft .NET resource file format for Windows and web apps."
        />
        <FormatCard
          format="XML"
          extensions=".xml"
          description="Structured data with tag preservation for custom localization pipelines."
        />
        <FormatCard
          format="CSV"
          extensions=".csv"
          description="Spreadsheet-style translation. Each row is treated as a translatable unit."
        />
        <FormatCard
          format="TXT"
          extensions=".txt"
          description="Plain text files. Simple, no structure to preserve."
        />
        <FormatCard
          format="DOCX"
          extensions=".docx"
          description="Microsoft Word documents. Formatting and styles are maintained."
        />
        <FormatCard
          format="PPTX"
          extensions=".pptx"
          description="Microsoft PowerPoint presentations. Slide structure preserved."
        />
      </div>

      <div className="mt-8 rounded-[18px] border border-[var(--border-light)] bg-[var(--background-strong)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
          ZIP archives
        </p>
        <p className="mt-2 text-[14px] leading-7 text-[var(--muted)]">
          You can upload ZIP files containing any combination of the supported formats above. Translayr automatically extracts the archive, identifies supported translation files, and adds them to your project queue. Non-supported files inside the ZIP are ignored.
        </p>
      </div>
    </div>
  );
}

function FaqSection() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.92]`}>
        Frequently asked questions
      </h2>

      <div className="mt-8 space-y-6">
        <FaqItem
          question="What is a credit?"
          answer="One credit equals one word. Every word in your source text that gets translated costs one credit. This applies to both file translation and text translation. Your monthly credit limit depends on your plan."
        />
        <FaqItem
          question="What happens when I run out of credits?"
          answer="When you reach your monthly credit limit, translations will stop until the next billing cycle. You can upgrade your plan at any time to get more credits immediately. You will also receive an email notification when your spending limit is reached (if enabled in Settings → Notifications)."
        />
        <FaqItem
          question="Can I use Translayr for free?"
          answer="Yes. The Free plan gives you 1,000 monthly word credits, core XLIFF translation, and glossary basics. It is ideal for trying the product and smaller file sets."
        />
        <FaqItem
          question="Which file formats are supported?"
          answer="XLIFF/XLF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX. ZIP archives containing any of these formats are also supported and automatically extracted."
        />
        <FaqItem
          question="How does the glossary work?"
          answer="The glossary stores approved translations for key terms. When enabled, these terms are automatically injected during translation to ensure consistency. Protected terms are always used exactly as defined. You can import glossary terms via CSV for bulk setup."
        />
        <FaqItem
          question="Can I review translations before exporting?"
          answer="Yes. Every translated file can be reviewed in a side-by-side view showing the original and translated content. This is available on Pro and Scale plans."
        />
        <FaqItem
          question="How do I change my plan?"
          answer="Go to Billing in the sidebar. Select the plan you want and confirm. New subscriptions open in Stripe Checkout. Existing subscribers can switch plans instantly. Downgrades take effect at the next billing cycle."
        />
        <FaqItem
          question="Can I invite team members?"
          answer="Yes. Go to Settings → Profile and use the Workspace Members panel. Invite members with roles: Owner, Admin, Editor, Reviewer, or Viewer. Invited members receive an email with an acceptance link."
        />
        <FaqItem
          question="Is my data secure?"
          answer="Yes. Translayr uses Supabase for authentication and database management, Stripe for billing, and all translations are processed securely. Tag and structure protection ensures your localization files maintain their integrity."
        />
        <FaqItem
          question="What languages are supported?"
          answer="Translayr supports translation between all major languages. The source language can be auto-detected or manually selected. Target language selection includes all commonly used languages for product localization."
        />
      </div>
    </div>
  );
}

function DocStep({ number, title, body }: { number: number; title: string; body: string }) {
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

function FormatCard({ format, extensions, description }: { format: string; extensions: string; description: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--background-strong)] p-5">
      <div className="text-[14px] font-semibold">{format}</div>
      <div className="mt-1 text-[12px] font-mono text-[var(--muted-soft)]">{extensions}</div>
      <p className="mt-3 text-[13px] leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-[14px] font-medium">{question}</span>
        <span className="ml-4 text-[var(--muted-soft)] transition">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-[var(--border-light)] px-5 py-4">
          <p className="text-[14px] leading-7 text-[var(--muted)]">{answer}</p>
        </div>
      )}
    </div>
  );
}
