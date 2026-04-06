"use client";

import Link from "next/link";
import { useState } from "react";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  titleDE: string;
  excerpt: string;
  excerptDE: string;
  content: string;
  contentDE: string;
  date: string;
  author: string;
  category: string;
  categoryDE: string;
  readTime: string;
  readTimeDE: string;
};

const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "translayr-launch",
    title: "Translayr is live – Translation as a product, not a folder.",
    titleDE: "Translayr ist live – Übersetzung als Produkt, nicht als Ordner.",
    excerpt: "We built Translayr because localization should not feel like rummaging through file servers. Here is what we are launching with and why the structure matters.",
    excerptDE: "Wir haben Translayr gebaut, weil Lokalisierung nicht wie das Durchsuchen von Datei-Servern wirken sollte. Hier ist, womit wir starten und warum die Struktur zählt.",
    content: `We built Translayr because localization should not feel like rummaging through file servers.

Most translation tools treat your work as a pile of uploads. You drop a file, get something back, and hope it fits into your release. There is no project context, no review surface, no visibility into what is happening with your credits.

Translayr is different. It treats translation as a product surface – one coherent system where projects, files, glossaries, and usage all live together.

### What we are launching with

**Translation Workspace** – A dashboard that shows your projects, usage metrics, recent activity, and target languages. No more guessing where things stand.

**File Translation** – Support for XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX. Upload files, track progress per file, review side-by-side, and download in the original format. ZIP archives are automatically extracted.

**Text Translation** – A quick surface for copy, support replies, and short content that does not need a project wrapper. Five tone styles, auto-detect, and instant output.

**Glossary** – Approved terms, collections, CSV import, and automatic injection during translation. Protected terms for brand names and product labels.

**Billing that makes sense** – One credit equals one word. Four plans from Free (1,000 words) to Scale (700,000 words). Monthly or yearly with a 2-month discount.

### Why the structure matters

Instead of one long landing page that crams everything together, we built dedicated product pages. Each surface explains its own job. The pricing page stands on its own. The docs page covers every workflow.

This is closer to how mature SaaS products are structured – and it feels more honest, more credible, and easier to navigate.

### What comes next

We are tracking what teams actually need: better review workflows, more file formats, team collaboration features, and deeper integrations. The roadmap is driven by real usage, not guesses.

If you are shipping products in multiple languages, Translayr is built for you. Start free and see how it feels.`,
    contentDE: `Wir haben Translayr gebaut, weil Lokalisierung nicht wie das Durchsuchen von Datei-Servern wirken sollte.

Die meisten Übersetzungstools behandeln deine Arbeit als einen Haufen Uploads. Du lässt eine Datei fallen, bekommst etwas zurück und hoffst, dass es in dein Release passt. Es gibt keinen Projektkontext, keine Review-Oberfläche, keine Sichtbarkeit darüber, was mit deinen Credits passiert.

Translayr ist anders. Es behandelt Übersetzung als Produktfläche – ein kohärentes System, in dem Projekte, Dateien, Glossare und Usage alle zusammenleben.

### Womit wir starten

**Translation Workspace** – Ein Dashboard, das deine Projekte, Usage-Metriken, letzte Aktivitäten und Zielsprachen zeigt. Kein Rätselraten mehr.

**Dateiübersetzung** – Unterstützung für XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX und PPTX. Dateien hochladen, Fortschritt pro Datei tracken, Side-by-side review und Download im Originalformat. ZIP-Archive werden automatisch extrahiert.

**Textübersetzung** – Eine schnelle Oberfläche für Copy, Support-Antworten und kurze Inhalte, die kein Projekt benötigen. Fünf Tone-Stile, Auto-Detect und sofortige Ausgabe.

**Glossar** – Genehmigte Begriffe, Collections, CSV-Import und automatische Injection während der Übersetzung. Geschützte Begriffe für Markennamen und Produktlabels.

**Abrechnung die Sinn ergibt** – Ein Credit entspricht einem Wort. Vier Pläne von Free (1.000 Wörter) bis Scale (700.000 Wörter). Monatlich oder jährlich mit 2 Monaten Rabatt.

### Warum die Struktur zählt

Statt einer langen Landingpage, die alles zusammenpresst, haben wir dedizierte Produktseiten gebaut. Jede Oberfläche erklärt ihre eigene Aufgabe. Die Pricing-Seite steht für sich. Die Docs-Seite deckt jeden Workflow ab.

Das ist näher dran, wie reife SaaS-Produkte strukturiert sind – und es wirkt ehrlicher, glaubwürdiger und einfacher zu navigieren.

### Was als Nächstes kommt

Wir tracken, was Teams wirklich brauchen: bessere Review-Workflows, mehr Dateiformate, Team-Kollaboration und tiefere Integrationen. Die Roadmap wird von echter Nutzung getrieben, nicht von Vermutungen.

Wenn du Produkte in mehreren Sprachen auslieferst, ist Translayr für dich gebaut. Starte kostenlos und sieh wie es sich anfühlt.`,
    date: "2026-04-01",
    author: "Translayr Team",
    category: "Product Launch",
    categoryDE: "Produktlaunch",
    readTime: "4 min read",
    readTimeDE: "4 Min. Lesezeit"
  },
  {
    id: "2",
    slug: "why-credits-not-seats",
    title: "Why we price by credits, not by seats.",
    titleDE: "Warum wir nach Credits abrechnen, nicht nach Seats.",
    excerpt: "Most SaaS tools charge per user. We charge per word. Here is why credit-based pricing is fairer for translation work.",
    excerptDE: "Die meisten SaaS-Tools berechnen pro Benutzer. Wir berechnen pro Wort. Hier ist, warum Credit-basierte Preise fairer für Übersetzungsarbeit sind.",
    content: `Most SaaS products price by seat – you pay per user, per month. That works for tools where every person actively uses the product every day.

Translation does not work like that.

Some weeks your team ships a big release and translates 50,000 words. Other weeks it is just a few support macros and a handful of UI strings. With per-seat pricing, you pay the same either way. With credit-based pricing, you pay for what you actually translate.

### How credits work

One credit equals one word. That is it. No hidden multipliers, no per-format surcharges, no premium language fees.

Your monthly credit limit depends on your plan:

- **Free**: 1,000 words/month – enough to try the product and translate small batches
- **Starter**: 50,000 words/month – for smaller localization workloads
- **Pro**: 200,000 words/month – for teams shipping continuously
- **Scale**: 700,000 words/month – for larger teams with high-volume launches

Both file translation and text translation draw from the same credit pool. You do not need to decide in advance which surface gets how many credits.

### Why this is fairer

**Small teams are not penalized** – If you have two people translating occasionally, you should not pay for ten seats.

**Big releases do not break the budget** – If you need to translate 100,000 words in one sprint, upgrade for that month and downgrade after. No annual lock-in required.

**Usage is transparent** – The Usage page shows exactly where your credits went: by project, by language, by file. No surprises.

### What about team members?

Team members are not limited by seat count. Invite editors, reviewers, and viewers as needed. The constraint is your credit pool, not your headcount. This matches how real localization teams operate – sometimes one person handles everything, sometimes five people review the same file.

Credit-based pricing aligns our incentives with yours. We want you to translate more, not to add more seats.`,
    contentDE: `Die meisten SaaS-Produkte berechnen pro Seat – du zahlst pro Benutzer, pro Monat. Das funktioniert für Tools, die jede Person jeden Tag aktiv nutzt.

Übersetzung funktioniert nicht so.

Manche Wochen liefert dein Team ein großes Release aus und übersetzt 50.000 Wörter. Andere Wochen sind es nur ein paar Support-Makros und eine Handvoll UI-Strings. Mit Pro-Seat-Preis zahlst du beides gleich. Mit Credit-basiertem Preis zahlst du nur, was du wirklich übersetzt.

### So funktionieren Credits

Ein Credit entspricht einem Wort. Das war's. Keine versteckten Multiplikatoren, keine Format-Zuschläge, keine Premium-Sprachen-Gebühren.

Dein monatliches Credit-Limit hängt von deinem Plan ab:

- **Free**: 1.000 Wörter/Monat – genug um das Produkt zu testen und kleine Mengen zu übersetzen
- **Starter**: 50.000 Wörter/Monat – für kleinere Lokalisierungs-Workloads
- **Pro**: 200.000 Wörter/Monat – für Teams die kontinuierlich ausliefern
- **Scale**: 700.000 Wörter/Monat – für größere Teams mit High-Volume-Launches

Sowohl Datei- als auch Textübersetzung ziehen aus demselben Credit-Pool. Du musst nicht im Voraus entscheiden, welche Oberfläche wie viele Credits bekommt.

### Warum das fairer ist

**Kleine Teams werden nicht bestraft** – Wenn zwei Leute gelegentlich übersetzen, solltest du nicht für zehn Seats zahlen.

**Große Releases sprengen nicht das Budget** – Wenn du 100.000 Wörter in einem Sprint übersetzen musst, upgrade für diesen Monat und downgrade danach. Kein jährliches Lock-in nötig.

**Usage ist transparent** – Die Usage-Seite zeigt genau, wo deine Credits hingegangen sind: nach Projekt, nach Sprache, nach Datei. Keine Überraschungen.

### Was ist mit Team-Mitgliedern?

Team-Mitglieder sind nicht durch Seat-Anzahl limitiert. Lade Editoren, Reviewer und Viewer ein wie benötigt. Die Grenze ist dein Credit-Pool, nicht deine Kopfzahl. Das passt dazu, wie echte Lokalisierungs-Teams arbeiten – manchmal macht eine Person alles, manchmal reviewen fünf Leute dieselbe Datei.

Credit-basierte Preise richten unsere Anreize an deinen aus. Wir wollen, dass du mehr übersetzt, nicht mehr Seats hinzufügst.`,
    date: "2026-03-28",
    author: "Translayr Team",
    category: "Pricing",
    categoryDE: "Preise",
    readTime: "3 min read",
    readTimeDE: "3 Min. Lesezeit"
  },
  {
    id: "3",
    slug: "file-formats-guide",
    title: "The complete guide to supported file formats in Translayr.",
    titleDE: "Der komplette Guide zu unterstützten Dateiformaten in Translayr.",
    excerpt: "From XLIFF to PPTX – every format Translayr supports, how structure is preserved, and what to expect during translation.",
    excerptDE: "Von XLIFF bis PPTX – jedes Format das Translayr unterstützt, wie Struktur erhalten bleibt und was du bei der Übersetzung erwarten kannst.",
    content: `Translayr supports nine file formats plus ZIP archives. Here is what each one does and how translation handles them.

### XLIFF / XLF (.xliff, .xlf)

The industry standard for software localization. XLIFF files contain translatable units with source and target segments, plus metadata like state and approval status.

**What we preserve**: All XML structure, inline tags (g, ph, x), state attributes, and custom metadata. Translations are written back into the target segments while keeping the source intact.

**Best for**: Software localization, web apps, mobile apps with structured localization pipelines.

### PO (.po)

GNU gettext format, widely used in open source projects and WordPress ecosystems. PO files contain msgid/msgstr pairs with optional context and fuzzy flags.

**What we preserve**: msgid, msgstr, msgctxt, comments, and fuzzy flags. Plural forms are handled according to the target language's plural rules.

**Best for**: Open source projects, WordPress themes and plugins, Linux applications.

### Strings (.strings)

Apple's localization format for iOS and macOS. Contains key-value pairs in a simple text format.

**What we preserve**: Key-value structure, comments, and format specifiers (%@, %d, etc.). String interpolation placeholders are never translated.

**Best for**: iOS apps, macOS applications, Apple ecosystem products.

### RESX (.resx)

Microsoft .NET resource format. XML-based file with name-value pairs for Windows and .NET applications.

**What we preserve**: All XML structure, name attributes, comments, and value types. HTML content inside values is translated while preserving markup.

**Best for**: .NET applications, Windows software, ASP.NET projects.

### XML (.xml)

Generic structured data. Translayr translates text content while preserving the XML tree, attributes, and custom namespaces.

**What we preserve**: Full XML structure, attributes (configurable), namespaces, and CDATA sections. Tag protection prevents structural changes.

**Best for**: Custom localization pipelines, configuration files, structured content.

### CSV (.csv)

Spreadsheet-style format. Each row is treated as a translatable unit.

**What we preserve**: Column structure, row order, and non-text columns (IDs, numbers). The first column is typically treated as source text.

**Best for**: Simple translation lists, content exports from spreadsheets, bulk text translation.

### TXT (.txt)

Plain text files. No structure to preserve – every line is translated as-is.

**What we preserve**: Line breaks and paragraph structure. No formatting to maintain.

**Best for**: Quick translations, support content, simple copy.

### DOCX (.docx)

Microsoft Word documents. Translayr extracts the text content, translates it, and rebuilds the document with all formatting intact.

**What we preserve**: Paragraphs, headings, lists, tables, bold/italic/underline, font sizes, and page structure. Images and embedded objects are maintained.

**Best for**: Marketing documents, user manuals, legal documents, press releases.

### PPTX (.pptx)

Microsoft PowerPoint presentations. Text on slides is translated while the slide design, layouts, and visual elements stay untouched.

**What we preserve**: Slide structure, text boxes, headings, bullet points, speaker notes, and all design elements. Charts and images are not modified.

**Best for**: Sales presentations, training materials, conference slides, internal decks.

### ZIP Archives

Upload a ZIP containing any combination of the formats above. Translayr extracts the archive automatically, identifies supported translation files, and adds them to your project queue. Non-supported files inside the ZIP are ignored.

**Best for**: Batch uploads, multi-format releases, complete localization packages.`,
    contentDE: `Translayr unterstützt neun Dateiformate plus ZIP-Archive. Hier ist, was jedes einzelne macht und wie die Übersetzung damit umgeht.

### XLIFF / XLF (.xliff, .xlf)

Der Industriestandard für Software-Lokalisierung. XLIFF-Dateien enthalten übersetzbare Einheiten mit Source- und Target-Segmenten plus Metadaten wie Status und Approval.

**Was wir erhalten**: Komplette XML-Struktur, Inline-Tags (g, ph, x), Status-Attribute und Custom-Metadaten. Übersetzungen werden zurück in die Target-Segmente geschrieben während die Source intakt bleibt.

**Am besten für**: Software-Lokalisierung, Web-Apps, Mobile-Apps mit strukturierten Lokalisierungs-Pipelines.

### PO (.po)

GNU Gettext-Format, weit verbreitet in Open-Source-Projekten und WordPress-Ökosystemen. PO-Dateien enthalten msgid/msgstr-Paare mit optionalem Context und Fuzzy-Flags.

**Was wir erhalten**: msgid, msgstr, msgctxt, Kommentare und Fuzzy-Flags. Pluralformen werden nach den Plural-Regeln der Zielsprache behandelt.

**Am besten für**: Open-Source-Projekte, WordPress-Themes und Plugins, Linux-Anwendungen.

### Strings (.strings)

Apples Lokalisierungsformat für iOS und macOS. Enthält Key-Value-Paare in einem einfachen Textformat.

**Was wir erhalten**: Key-Value-Struktur, Kommentare und Format-Spezifizierer (%@, %d, etc.). String-Interpolation-Platzhalter werden niemals übersetzt.

**Am besten für**: iOS-Apps, macOS-Anwendungen, Apple-Ökosystem-Produkte.

### RESX (.resx)

Microsoft .NET Resource-Format. XML-basierte Datei mit Name-Value-Paaren für Windows- und .NET-Anwendungen.

**Was wir erhalten**: Komplette XML-Struktur, Name-Attribute, Kommentare und Value-Typen. HTML-Inhalte in Values werden übersetzt während Markup erhalten bleibt.

**Am besten für**: .NET-Anwendungen, Windows-Software, ASP.NET-Projekte.

### XML (.xml)

Generische strukturierte Daten. Translayr übersetzt Textinhalte während der XML-Baum, Attribute und Custom-Namespaces erhalten bleiben.

**Was wir erhalten**: Komplette XML-Struktur, Attribute (konfigurierbar), Namespaces und CDATA-Sektionen. Tag-Schutz verhindert strukturelle Änderungen.

**Am besten für**: Custom Lokalisierungs-Pipelines, Konfigurationsdateien, strukturierte Inhalte.

### CSV (.csv)

Spreadsheet-Format. Jede Zeile wird als übersetzbare Einheit behandelt.

**Was wir erhalten**: Spaltenstruktur, Zeilenreihenfolge und Nicht-Text-Spalten (IDs, Nummern). Die erste Spalte wird typischerweise als Source-Text behandelt.

**Am besten für**: Einfache Übersetzungslisten, Content-Exports aus Spreadsheets, Bulk-Text-Übersetzung.

### TXT (.txt)

Plain-Text-Dateien. Keine Struktur zu erhalten – jede Zeile wird übersetzt wie sie ist.

**Was wir erhalten**: Zeilenumbrüche und Absatzstruktur. Kein Formatting zu erhalten.

**Am besten für**: Schnelle Übersetzungen, Support-Inhalte, einfacher Copy.

### DOCX (.docx)

Microsoft Word-Dokumente. Translayr extrahiert den Textinhalt, übersetzt ihn und baut das Dokument mit komplettem Formatting wieder auf.

**Was wir erhalten**: Absätze, Überschriften, Listen, Tabellen, Bold/Italic/Underline, Schriftgrößen und Seitenstruktur. Bilder und eingebettete Objekte bleiben erhalten.

**Am besten für**: Marketing-Dokumente, Benutzerhandbücher, juristische Dokumente, Pressemitteilungen.

### PPTX (.pptx)

Microsoft PowerPoint-Präsentationen. Text auf Folien wird übersetzt während das Slide-Design, Layouts und visuelle Elemente unberührt bleiben.

**Was wir erhalten**: Slide-Struktur, Textboxen, Überschriften, Bullet-Points, Sprechernotizen und alle Design-Elemente. Charts und Bilder werden nicht verändert.

**Am besten für**: Sales-Präsentationen, Trainingsmaterialien, Konferenz-Folien, interne Decks.

### ZIP-Archive

Lade ein ZIP mit beliebigen Kombinationen der obigen Formate hoch. Translayr extrahiert das Archiv automatisch, identifiziert unterstützte Übersetzungsdateien und fügt sie deiner Projekt-Queue hinzu. Nicht unterstützte Dateien im ZIP werden ignoriert.

**Am besten für**: Batch-Uploads, Multi-Format-Releases, komplette Lokalisierungspakete.`,
    date: "2026-03-25",
    author: "Translayr Team",
    category: "Guide",
    categoryDE: "Guide",
    readTime: "6 min read",
    readTimeDE: "6 Min. Lesezeit"
  }
];

type BlogView = "list" | "post";

export default function BlogPage() {
  const [view, setView] = useState<BlogView>("list");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "de">("en");

  const activePost = activeSlug ? BLOG_POSTS.find((p) => p.slug === activeSlug) ?? null : null;

  if (view === "post" && activePost) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto max-w-[720px] px-5 py-12 sm:px-7 lg:px-8">
          <button
            onClick={() => { setView("list"); setActiveSlug(null); }}
            className="text-[13px] font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← {lang === "de" ? "Zurück zum Blog" : "Back to blog"}
          </button>

          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {lang === "de" ? activePost.categoryDE : activePost.category}
              </span>
              <span className="text-[12px] text-[var(--muted-soft)]">
                {new Date(activePost.date).toLocaleDateString(lang === "de" ? "de-AT" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="text-[12px] text-[var(--muted-soft)]">
                · {lang === "de" ? activePost.readTimeDE : activePost.readTime}
              </span>
            </div>

            <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-6 text-[clamp(2rem,4vw,3.2rem)] leading-[0.92]`}>
              {lang === "de" ? activePost.titleDE : activePost.title}
            </h1>

            <p className="mt-4 text-[14px] text-[var(--muted)]">
              {lang === "de" ? activePost.excerptDE : activePost.excerpt}
            </p>

            <div className="mt-6 flex items-center gap-3 border-b border-[var(--border)] pb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--foreground)] text-[13px] font-semibold text-[var(--surface)]">
                {activePost.author.charAt(0)}
              </div>
              <div>
                <div className="text-[13px] font-medium">{activePost.author}</div>
              </div>
            </div>

            <div className="prose mt-8 max-w-none">
              {(lang === "de" ? activePost.contentDE : activePost.content).split("\n").map((block, i) => {
                if (block.startsWith("### ")) {
                  return <h3 key={i} className="mt-10 text-[18px] font-semibold tracking-[-0.03em]">{block.replace("### ", "")}</h3>;
                }
                if (block.startsWith("**") && block.endsWith("**")) {
                  return <p key={i} className="mt-3 text-[14px] font-semibold">{block.replace(/\*\*/g, "")}</p>;
                }
                if (block.startsWith("- **")) {
                  const parts = block.replace("- **", "").split("**");
                  return (
                    <li key={i} className="ml-4 mt-2 text-[14px] leading-7 text-[var(--muted)] list-disc">
                      <span className="font-medium text-[var(--foreground)]">{parts[0]}</span>{parts[1]}
                    </li>
                  );
                }
                if (block.startsWith("- ")) {
                  return <li key={i} className="ml-4 mt-2 text-[14px] leading-7 text-[var(--muted)] list-disc">{block.replace("- ", "")}</li>;
                }
                if (block.trim() === "") return null;
                return <p key={i} className="mt-3 text-[15px] leading-8 text-[var(--muted)]">{block}</p>;
              })}
            </div>
          </article>

          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <h3 className="text-[16px] font-semibold">{lang === "de" ? "Mehr Beiträge" : "More posts"}</h3>
            <div className="mt-4 space-y-3">
              {BLOG_POSTS.filter((p) => p.slug !== activePost.slug).map((post) => (
                <button
                  key={post.slug}
                  onClick={() => { setActiveSlug(post.slug); window.scrollTo({ top: 0 }); }}
                  className="block w-full rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:bg-[var(--background-strong)]"
                >
                  <div className="text-[13px] font-medium">{lang === "de" ? post.titleDE : post.title}</div>
                  <div className="mt-1 text-[12px] text-[var(--muted-soft)]">
                    {new Date(post.date).toLocaleDateString(lang === "de" ? "de-AT" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[960px] px-5 py-12 sm:px-7 lg:px-8">
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            / Blog
          </p>
          <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2.6rem,4vw,4.2rem)] leading-[0.92]`}>
            {lang === "de" ? "Produkt-Updates, Guides und Ankündigungen." : "Product updates, guides, and announcements."}
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] leading-8 text-[var(--muted)]">
            {lang === "de"
              ? "Release Notes, Erklärungen zu unserem Preismodell und Einblicke in die Übersetzungs-Workflows."
              : "Release notes, pricing explanations, and insights into translation workflows."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${lang === "en" ? "bg-[var(--foreground)] text-[var(--surface)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("de")}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${lang === "de" ? "bg-[var(--foreground)] text-[var(--surface)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              DE
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {BLOG_POSTS.map((post) => (
            <button
              key={post.id}
              onClick={() => { setActiveSlug(post.slug); setView("post"); window.scrollTo({ top: 0 }); }}
              className="block w-full rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:bg-[var(--background-strong)]"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--border)] bg-[var(--background-strong)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {lang === "de" ? post.categoryDE : post.category}
                </span>
                <span className="text-[12px] text-[var(--muted-soft)]">
                  {new Date(post.date).toLocaleDateString(lang === "de" ? "de-AT" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className="text-[12px] text-[var(--muted-soft)]">
                  · {lang === "de" ? post.readTimeDE : post.readTime}
                </span>
              </div>

              <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                {lang === "de" ? post.titleDE : post.title}
              </h2>

              <p className="mt-2 text-[14px] leading-7 text-[var(--muted)]">
                {lang === "de" ? post.excerptDE : post.excerpt}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--foreground)] text-[11px] font-semibold text-[var(--surface)]">
                  {post.author.charAt(0)}
                </div>
                <span className="text-[12px] text-[var(--muted)]">{post.author}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <h3 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.4rem,2.5vw,2rem)] leading-[0.92]`}>
            {lang === "de" ? "Bereit loszulegen?" : "Ready to get started?"}
          </h3>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            {lang === "de"
              ? "Starte kostenlos und übersetze deine ersten Dateien noch heute."
              : "Start free and translate your first files today."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-[14px] bg-black px-5 text-[13px] font-medium text-white transition hover:bg-black"
            >
              {lang === "de" ? "Kostenlos starten" : "Start free"}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
            >
              {lang === "de" ? "Produkte ansehen" : "Explore products"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
