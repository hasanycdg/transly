"use client";

import Link from "next/link";
import { Fragment, useState, type ReactNode } from "react";

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
  },
  {
    id: "4",
    slug: "deepl-vs-translayr-translys",
    title: "DeepL vs Translayr (Translys): Which translation stack fits your workflow?",
    titleDE: "DeepL vs Translayr (Translys): Welche Übersetzungs-Stack passt zu deinem Workflow?",
    excerpt: "A practical DeepL vs Translayr comparison for teams that are moving from quick text translation to repeatable localization operations.",
    excerptDE: "Ein praxisnaher DeepL-vs-Translayr-Vergleich für Teams, die von schneller Textübersetzung zu wiederholbaren Localization-Prozessen wechseln.",
    content: `When teams ask us about DeepL vs Translayr, they are usually not asking about model quality alone. They are asking a harder operations question: "Can our current setup survive the next six releases without chaos?"

DeepL is an excellent product and many teams should absolutely use it. But it is strongest in a specific context: quick translation requests, high-quality short text output, and lightweight manual workflows. That is very different from "we have product strings, help center content, release notes, and customer-facing documents shipping every sprint."

### The key difference

DeepL is primarily a translation engine and interface.
Translayr is a translation workspace built around release operations.

That single distinction explains most of the real-world outcomes teams see.

### Where DeepL is the better choice

If your workload is mostly ad-hoc text translation by one or two people, DeepL is hard to beat for speed and simplicity.

Typical examples:
- customer support agents translating short replies
- founders translating landing page drafts
- content writers polishing one article at a time

In these cases, you do not need project-level orchestration. You need fast quality output. DeepL does that well.

### Where scaling teams hit limits

Teams usually feel friction when translation becomes multi-file, multi-owner, and deadline-driven.

The common pain points are operational, not linguistic:
- mixed file formats across product and marketing
- inconsistent terminology between teams
- unclear handoffs between translation and QA
- low visibility into who changed what during release week

Once these problems appear, even good raw translation output cannot save the process. The bottleneck is coordination.

### Where Translayr changes the day-to-day workflow

Translayr is built for exactly this phase:
- project-based workspaces instead of loose uploads
- file and text translation in one operating surface
- glossary collections with protected terms
- format-safe handling for PO, XLIFF, STRINGS, RESX, XML, CSV, DOCX, and PPTX
- usage and cost visibility by project and language

The result is not "better AI magic." The result is fewer surprises on release day.

### A practical evaluation method

Do not pick based on homepage claims. Run a controlled test with your own real assets.

Use one sprint-sized batch:
- one technical localization file (for example PO or XLIFF)
- one business document (for example DOCX)
- one internal deck (PPTX)
- one set of short support snippets

Measure three things:
- output quality after human review
- time-to-approve
- file integrity and handoff friction

This gives you a real decision in 1-2 weeks instead of opinion-based debate.

### Bottom line

If translation is still mostly one-off text work, DeepL is a very good fit.
If translation is now a recurring cross-team release process, Translayr is built for that operating model.

Start with a real pilot: [Create a free Translayr workspace](/register).
See the product surfaces: [Explore Translayr features](/products).
Check costs by word volume: [Compare plans and credits](/pricing).`,
    contentDE: `Wenn Teams uns nach DeepL vs Translayr fragen, geht es selten nur um reine Ausgabequalität. Meist steckt eine schwierigere Operations-Frage dahinter: "Hält unser aktueller Setup die nächsten sechs Releases ohne Chaos aus?"

DeepL ist ein starkes Produkt und für viele Teams absolut sinnvoll. Die Stärke liegt aber in einem bestimmten Kontext: schnelle Einzelanfragen, hochwertige Kurztexte und leichte manuelle Workflows. Das ist etwas anderes als "wir liefern in jedem Sprint Produktstrings, Help-Center-Inhalte, Release Notes und Kundendokumente aus."

### Der zentrale Unterschied

DeepL ist primär Übersetzungs-Engine plus Interface.
Translayr ist ein Übersetzungs-Workspace für Release-Operations.

Diese Unterscheidung erklärt in der Praxis die meisten Unterschiede.

### Wann DeepL die bessere Wahl ist

Wenn euer Workload vor allem aus Ad-hoc-Textübersetzung durch ein bis zwei Personen besteht, ist DeepL in Tempo und Einfachheit schwer zu schlagen.

Typische Beispiele:
- Support-Agenten übersetzen kurze Antworten
- Founder lokalisieren Landingpage-Entwürfe
- Content-Teams bearbeiten einzelne Texte nacheinander

In diesen Fällen braucht ihr keine Projekt-Orchestrierung, sondern schnelle Qualität. Das liefert DeepL zuverlässig.

### Wo wachsende Teams Grenzen spüren

Reibung entsteht meist, sobald Übersetzung dateibasiert, teamübergreifend und deadline-getrieben wird.

Die Probleme sind dann operativ, nicht linguistisch:
- gemischte Dateiformate über Produkt und Marketing hinweg
- inkonsistente Terminologie zwischen Teams
- unklare Handoffs zwischen Übersetzung und QA
- geringe Transparenz darüber, wer was wann geändert hat

Ab diesem Punkt hilft auch gute Rohübersetzung nur begrenzt, weil die eigentliche Engstelle Koordination ist.

### Wo Translayr den Alltag verändert

Translayr ist genau für diese Phase gebaut:
- projektbasierte Workspaces statt loser Uploads
- Datei- und Textübersetzung in einer Oberfläche
- Glossar-Collections mit geschützten Begriffen
- formatsicheres Handling für PO, XLIFF, STRINGS, RESX, XML, CSV, DOCX und PPTX
- Usage- und Kosten-Transparenz je Projekt und Sprache

Das Ergebnis ist weniger "mehr KI-Magie" und mehr operative Verlässlichkeit beim Launch.

### So testest du fair

Entscheide nicht nach Marketingversprechen. Mache einen kontrollierten Test mit echten Daten.

Nutze ein Sprint-großes Paket:
- eine technische Lokalisierungsdatei (z.B. PO oder XLIFF)
- ein Business-Dokument (z.B. DOCX)
- ein internes Deck (PPTX)
- ein Set kurzer Support-Snippets

Miss drei Kennzahlen:
- Ausgabequalität nach Review
- Zeit bis zur Freigabe
- Dateiintegrität und Handoff-Aufwand

So hast du nach 1-2 Wochen eine belastbare Entscheidung statt Bauchgefühl.

### Fazit

Wenn Übersetzung noch überwiegend One-off-Textarbeit ist, passt DeepL sehr gut.
Wenn Übersetzung jetzt ein wiederkehrender, teamübergreifender Release-Prozess ist, passt Translayr besser zum Betriebsmodell.

Mit echtem Pilot starten: [Kostenlosen Translayr-Workspace erstellen](/register).
Produktflächen ansehen: [Translayr Features ansehen](/products).
Kosten nach Wortvolumen prüfen: [Pläne und Credits vergleichen](/pricing).`,
    date: "2026-04-09",
    author: "Translayr Team",
    category: "Comparison",
    categoryDE: "Vergleich",
    readTime: "10 min read",
    readTimeDE: "10 Min. Lesezeit"
  },
  {
    id: "5",
    slug: "wpml-vs-translayr-translys",
    title: "WPML vs Translayr (Translys): Plugin translation vs full localization workspace",
    titleDE: "WPML vs Translayr (Translys): Plugin-Übersetzung vs kompletter Lokalisierungs-Workspace",
    excerpt: "A clear WPML vs Translayr breakdown for teams that run WordPress content and also ship multilingual product releases outside WordPress.",
    excerptDE: "Eine klare WPML-vs-Translayr-Einordnung für Teams mit WordPress-Content und zusätzlichen mehrsprachigen Produkt-Releases außerhalb von WordPress.",
    content: `WPML vs Translayr looks like a direct competitor comparison on paper, but in real projects it is usually a scope question.

WPML is excellent when your center of gravity is WordPress publishing. Translayr is strong when localization spans multiple systems beyond WordPress. The confusion starts when teams try to use one tool for both problems.

### What WPML is built for

WPML is designed to make multilingual websites work inside WordPress:
- translated pages and posts
- language-specific URLs and menus
- taxonomy and content routing

If your team lives in WordPress all day, this is exactly what you need.

### Why SaaS teams outgrow plugin-only workflows

Most SaaS localization programs include much more than website pages:
- product strings from engineering repositories
- help center articles in external systems
- release notes, legal content, and PDF docs
- support macros and transactional messages

At that point, WordPress is still important, but it is only one channel in a broader release pipeline.

### Where Translayr fits

Translayr acts as the operational layer across channels:
- one workspace for recurring release batches
- one glossary policy for product and content teams
- one place to handle PO, XLIFF, STRINGS, RESX, XML, CSV, DOCX, and PPTX
- one usage view for volume and cost decisions

This is especially useful when marketing, product, and support teams need shared terminology and predictable review cycles.

### The best model for many teams

This is often not an either/or decision.

A practical setup looks like this:
- WPML for publishing and language routing in WordPress
- Translayr for source translation operations and terminology governance
- content synced back into WordPress after review

You keep the CMS strengths of WPML while avoiding operational fragmentation across non-WordPress assets.

### Decision framework

Choose WPML-first if:
- your core localization scope is website content in WordPress
- engineering assets are minimal
- you do not need cross-channel governance yet

Choose Translayr-first if:
- localization includes product files and business documents
- multiple teams contribute to one release
- terminology drift is already slowing reviews

Use both if:
- WordPress is one important channel, not the only one

Set up your own process: [Start free](/register).
Review the operational workflow: [Open documentation](/docs).`,
    contentDE: `WPML vs Translayr wirkt auf den ersten Blick wie ein klassischer Konkurrenzvergleich. In echten Projekten ist es aber meist eine Scope-Frage.

WPML ist hervorragend, wenn dein Schwerpunkt WordPress-Publishing ist. Translayr ist stark, wenn Lokalisierung mehrere Systeme außerhalb von WordPress umfasst. Probleme entstehen, wenn Teams versuchen, beide Ebenen mit nur einem Tool abzudecken.

### Wofür WPML gebaut ist

WPML macht mehrsprachige Websites in WordPress operativ handhabbar:
- übersetzte Seiten und Beiträge
- sprachspezifische URLs und Menüs
- Taxonomie- und Content-Routing

Wenn dein Team täglich in WordPress arbeitet, ist das genau der richtige Fokus.

### Warum SaaS-Teams plugin-only oft entwachsen

In den meisten SaaS-Setups umfasst Lokalisierung deutlich mehr als Website-Seiten:
- Produktstrings aus Engineering-Repositories
- Help-Center-Inhalte in externen Systemen
- Release Notes, rechtliche Texte und Dokumente
- Support-Makros und transaktionale Nachrichten

Dann bleibt WordPress wichtig, ist aber nur ein Kanal in einer größeren Release-Pipeline.

### Wo Translayr ins Spiel kommt

Translayr übernimmt die operative Ebene über Kanäle hinweg:
- ein Workspace für wiederkehrende Release-Batches
- eine Glossar-Policy für Produkt- und Content-Teams
- ein Ort für PO, XLIFF, STRINGS, RESX, XML, CSV, DOCX und PPTX
- eine Usage-Sicht für Volumen- und Kostenentscheidungen

Das ist besonders wertvoll, wenn Marketing, Produkt und Support mit gemeinsamer Terminologie und planbaren Review-Zyklen arbeiten müssen.

### Für viele Teams ist die beste Lösung hybrid

Es ist oft kein Entweder-oder.

Ein pragmatisches Setup:
- WPML für Publishing und Sprachrouting in WordPress
- Translayr für Source-Übersetzungsprozesse und Terminologie-Governance
- Rückführung freigegebener Inhalte in WordPress

So bleibt die CMS-Stärke von WPML erhalten, ohne dass Nicht-WordPress-Assets operativ fragmentieren.

### Entscheidungslogik

WPML-first passt, wenn:
- euer Hauptscope Website-Content in WordPress ist
- Engineering-Assets klein sind
- kanalübergreifende Governance noch keine Priorität hat

Translayr-first passt, wenn:
- Lokalisierung Produktdateien und Business-Dokumente einschließt
- mehrere Teams an einem Release arbeiten
- Terminologie-Drift Reviews bereits verlangsamt

Beides kombinieren lohnt sich, wenn:
- WordPress ein wichtiger, aber nicht der einzige Kanal ist

Eigenen Prozess aufsetzen: [Kostenlos starten](/register).
Workflow im Detail ansehen: [Dokumentation öffnen](/docs).`,
    date: "2026-04-08",
    author: "Translayr Team",
    category: "Comparison",
    categoryDE: "Vergleich",
    readTime: "9 min read",
    readTimeDE: "9 Min. Lesezeit"
  },
  {
    id: "6",
    slug: "best-translation-tools-2026",
    title: "Best translation tools in 2026: what to use for text, files, and localization ops",
    titleDE: "Die besten Übersetzungstools 2026: was du für Text, Dateien und Localization Ops nutzen solltest",
    excerpt: "A non-hype guide to choosing translation tools by workload type: quick text, API pipelines, CMS publishing, or full localization operations.",
    excerptDE: "Ein praxisnaher Guide ohne Hype: Welche Übersetzungstools passen zu welchen Workloads - Kurztexte, API-Pipelines, CMS-Publishing oder vollständige Localization-Operations.",
    content: `If you search for the best translation tools in 2026, you will mostly find broad rankings. The problem with rankings is simple: they rarely match your actual workflow.

A support team translating five snippets per day needs something very different from a product organization shipping 15 locales every month. So instead of asking "Which tool is best?", ask "Which workload am I optimizing for?"

### Workload 1: fast short-text translation

If your job is quick text conversion with minimal setup, DeepL is often a strong choice. It is fast, easy to use, and gives reliable quality for common language pairs.

Best fit:
- individual contributors
- small content teams
- ad-hoc translation tasks

### Workload 2: API-first automation at scale

If translation is deeply embedded in your backend architecture, Google Cloud Translation and similar API-first platforms are usually the practical path. They integrate well into custom pipelines and can handle high request volume.

Best fit:
- engineering-led automation
- custom routing and orchestration logic
- global products with infrastructure-heavy localization

### Workload 3: multilingual CMS publishing

If your central challenge is multilingual WordPress publishing, WPML is highly relevant. It is designed around page-level language routing and CMS workflows.

Best fit:
- editorial teams working primarily in WordPress
- multilingual site navigation and taxonomy handling
- content operations tied to CMS publishing cycles

### Workload 4: enterprise translation management

Large organizations with strict process requirements often use enterprise TMS platforms such as Lokalise, Phrase, or Smartling.

Best fit:
- multi-team governance
- advanced permission models
- large-scale process formalization

### Workload 5: practical localization operations for growing teams

Many SaaS teams are in a middle zone: too complex for ad-hoc tools, but not ready for heavyweight enterprise setups. This is where a focused translation workspace like Translayr is useful.

Best fit:
- recurring release batches
- mixed file formats and direct text tasks
- one glossary policy across product, support, and marketing
- clear usage and cost tracking

### How to choose without guessing

Run a two-week pilot with your own assets and track these metrics:
- first-pass output quality
- reviewer correction volume
- time-to-approve
- format integrity after export
- coordination overhead per release

A tool that "sounds impressive" but creates review delays is not the right tool.

### Our recommendation

Pick the tool for your current operating model, not your aspirational one. If you are already feeling release friction between teams, prioritize workflow clarity over feature count.

Try the workflow with real files: [Start free with Translayr](/register).
Read how the flow works end-to-end: [Open docs](/docs).`,
    contentDE: `Wenn du nach den besten Übersetzungstools 2026 suchst, findest du meistens allgemeine Rankings. Das Problem daran: Sie passen selten zu deinem tatsächlichen Workflow.

Ein Support-Team mit fünf Kurztexten pro Tag braucht etwas anderes als ein Produktteam mit 15 Sprachen pro Monat. Statt "Welches Tool ist das beste?" solltest du daher fragen: "Welchen Workload optimiere ich?"

### Workload 1: schnelle Kurztext-Übersetzung

Wenn es primär um schnelle Textkonvertierung mit wenig Setup geht, ist DeepL oft eine sehr gute Wahl. Es ist schnell, einfach und liefert bei gängigen Sprachpaaren solide Qualität.

Guter Fit:
- einzelne Contributor
- kleine Content-Teams
- Ad-hoc-Übersetzungsaufgaben

### Workload 2: API-first-Automation in größerem Maßstab

Wenn Übersetzung tief im Backend verankert ist, sind Google Cloud Translation und ähnliche API-first-Plattformen oft der pragmatische Weg. Sie lassen sich gut in eigene Pipelines integrieren und skalieren auf hohe Request-Volumen.

Guter Fit:
- engineering-getriebene Automation
- eigenes Routing und Orchestrierung
- globale Produkte mit infrastrukturlastiger Lokalisierung

### Workload 3: mehrsprachiges CMS-Publishing

Wenn die Hauptaufgabe mehrsprachiges WordPress-Publishing ist, ist WPML sehr relevant. Das Tool ist auf Seitenrouting und CMS-nahe Abläufe ausgelegt.

Guter Fit:
- Redaktionsteams mit WordPress-Schwerpunkt
- mehrsprachige Navigation und Taxonomie
- Publishing-Zyklen direkt im CMS

### Workload 4: Enterprise-Translation-Management

Organisationen mit strikten Prozessvorgaben nutzen häufig Enterprise-TMS-Plattformen wie Lokalise, Phrase oder Smartling.

Guter Fit:
- teamübergreifende Governance
- komplexe Rollen- und Rechtekonzepte
- stark formalisiertes Prozessdesign

### Workload 5: praktikable Localization-Operations für wachsende Teams

Viele SaaS-Teams liegen dazwischen: zu komplex für Ad-hoc-Tools, aber noch nicht bei schwergewichtigem Enterprise-Setup. Genau hier ist ein fokussierter Übersetzungs-Workspace wie Translayr sinnvoll.

Guter Fit:
- wiederkehrende Release-Batches
- gemischte Dateiformate plus Direkttext
- eine Glossar-Policy über Produkt, Support und Marketing
- klare Usage- und Kosten-Transparenz

### So triffst du die Entscheidung ohne Raten

Führe einen zweiwöchigen Pilot mit echten Dateien durch und messe:
- Erstqualität der Ausgabe
- Korrekturvolumen im Review
- Zeit bis Freigabe
- Formatintegrität nach Export
- Koordinationsaufwand pro Release

Ein Tool, das gut klingt, aber Reviews verlangsamt, ist operativ nicht das richtige.

### Empfehlung

Wähle nach eurem aktuellen Betriebsmodell, nicht nach einer Idealvorstellung. Wenn zwischen Teams bereits Reibung im Release entsteht, ist Workflow-Klarheit wichtiger als lange Feature-Listen.

Mit echten Dateien testen: [Translayr kostenlos starten](/register).
End-to-End-Flow ansehen: [Docs öffnen](/docs).`,
    date: "2026-04-07",
    author: "Translayr Team",
    category: "Tools",
    categoryDE: "Tools",
    readTime: "11 min read",
    readTimeDE: "11 Min. Lesezeit"
  },
  {
    id: "7",
    slug: "wordpress-po-translation-guide",
    title: "How to translate WordPress PO files without breaking placeholders",
    titleDE: "So übersetzt du WordPress-PO-Dateien ohne Platzhalter zu zerstören",
    excerpt: "A production-ready PO translation playbook for WordPress teams that want fewer bugs, cleaner releases, and stable terminology.",
    excerptDE: "Ein produktionsreifes PO-Playbook für WordPress-Teams, die weniger Fehler, sauberere Releases und stabile Terminologie wollen.",
    content: `PO files look simple because they are text-based. In production, they are one of the easiest places to break a multilingual release.

Most failures are not dramatic. They are small and expensive:
- one broken placeholder in checkout copy
- one wrong plural form in subscription messaging
- one missing context marker that changes meaning completely

These errors usually pass unnoticed until users hit them in real workflows.

### Why PO files fail in real projects

Three things make PO translation risky:
- technical markers sit next to human language
- one key may appear in multiple contexts
- release teams often rush translation near deadlines

The result is predictable: fast first pass, heavy cleanup, late QA stress.

### A safer PO workflow that scales

### Step 1: Clean your source before translation

Remove obsolete entries, review fuzzy flags, and collapse duplicates where possible. Source hygiene directly reduces downstream QA time.

### Step 2: Lock terminology early

Define brand terms and product nouns in a glossary before any translation run starts. If you skip this, every reviewer will correct style differently and your file drifts.

### Step 3: Preserve context explicitly

Use msgctxt as a first-class signal, not optional metadata. The same English source can require different translations based on UI location and user intent.

### Step 4: Protect placeholders and format patterns

Placeholders such as %s, %d, %1$s, or HTML fragments should never be translated. Build a dedicated QA pass that validates markers line by line.

### Step 5: Handle plurals by locale rules

Plural categories vary by language. Treat plural mapping as a technical validation task, not only a linguistic review.

### Step 6: Test in a staging environment

Load translated files into a WordPress staging setup and test high-risk paths: onboarding, payment flow, account settings, and support forms.

### PO checklist before release

- placeholders unchanged
- plural forms complete
- glossary terms applied
- no broken tags
- high-traffic pages manually verified

### Where Translayr helps

Teams use Translayr for PO projects because it combines glossary enforcement, batch handling, and review visibility in one workspace. That reduces random one-off uploads and turns translation into a repeatable release process.

Create your first PO workflow: [Start free](/register).
See format and QA guidance: [Open docs](/docs).`,
    contentDE: `PO-Dateien wirken einfach, weil sie textbasiert sind. In der Praxis gehören sie zu den häufigsten Fehlerquellen in mehrsprachigen Releases.

Die meisten Fehler sind nicht spektakulär, sondern teuer im Detail:
- ein kaputter Platzhalter im Checkout
- eine falsche Pluralform in Abo-Nachrichten
- ein fehlender Kontext, der die Bedeutung verändert

Oft fallen solche Probleme erst auf, wenn echte Nutzer den Flow durchlaufen.

### Warum PO-Dateien in Projekten scheitern

Drei Faktoren machen PO-Übersetzung riskant:
- technische Marker stehen direkt neben natürlicher Sprache
- ein Key taucht in mehreren Kontexten auf
- Übersetzung wird oft unter Release-Druck durchgeführt

Das Ergebnis ist fast immer gleich: schneller Erstwurf, viel Nacharbeit, späte QA-Hektik.

### Ein sicherer PO-Workflow für skalierende Teams

### Schritt 1: Source vorab bereinigen

Entferne veraltete Einträge, prüfe fuzzy Flags und reduziere Duplikate. Saubere Quellen verkürzen die QA deutlich.

### Schritt 2: Terminologie früh fixieren

Definiere Marken- und Produktbegriffe im Glossar, bevor die erste Übersetzung startet. Ohne diesen Schritt korrigiert jeder Reviewer anders und die Datei driftet.

### Schritt 3: Kontext bewusst erhalten

Nutze msgctxt als zentrales Signal, nicht als optionales Metadatum. Derselbe englische String braucht je nach UI-Kontext oft unterschiedliche Übersetzungen.

### Schritt 4: Platzhalter und Formatmuster schützen

Platzhalter wie %s, %d, %1$s oder HTML-Fragmente dürfen nicht übersetzt werden. Plane einen eigenen QA-Lauf zur Marker-Prüfung ein.

### Schritt 5: Pluralformen pro Locale korrekt mappen

Pluralregeln unterscheiden sich je Sprache. Behandle Plural-Mapping als technische Validierung, nicht nur als Sprachreview.

### Schritt 6: In Staging testen

Spiele die Datei in eine WordPress-Staging-Umgebung ein und teste Hochrisiko-Pfade: Onboarding, Zahlung, Kontoeinstellungen und Support-Formulare.

### PO-Checkliste vor Release

- Platzhalter unverändert
- Pluralformen vollständig
- Glossarbegriffe angewendet
- keine kaputten Tags
- Seiten mit hohem Traffic manuell geprüft

### Wo Translayr unterstützt

Teams nutzen Translayr für PO-Workflows, weil Glossar-Disziplin, Batch-Handling und Review-Transparenz in einer Oberfläche zusammenlaufen. So wird aus One-off-Übersetzung ein wiederholbarer Release-Prozess.

Ersten PO-Workflow aufsetzen: [Kostenlos starten](/register).
Format- und QA-Hinweise ansehen: [Docs öffnen](/docs).`,
    date: "2026-04-06",
    author: "Translayr Team",
    category: "Guide",
    categoryDE: "Guide",
    readTime: "10 min read",
    readTimeDE: "10 Min. Lesezeit"
  },
  {
    id: "8",
    slug: "shopify-translation-workflow-guide",
    title: "Shopify translation workflow: faster product launches in multiple languages",
    titleDE: "Shopify-Übersetzungsworkflow: schnellere Produkt-Launches in mehreren Sprachen",
    excerpt: "A complete Shopify localization playbook covering product pages, transactional flows, QA, and launch operations across multiple markets.",
    excerptDE: "Ein vollständiges Shopify-Lokalisierungs-Playbook für Produktseiten, transaktionale Flows, QA und Launch-Operations über mehrere Märkte hinweg.",
    content: `Ecommerce localization is rarely just translation. It is revenue infrastructure.

When Shopify teams localize late or inconsistently, the impact shows up immediately: weaker conversion, higher support load, and lower trust in checkout-critical markets.

The good news is that most localization issues are operationally predictable and preventable.

### What actually needs localization in a Shopify setup

Most teams underestimate scope. It is not just product descriptions.

Your launch-ready scope typically includes:
- product titles, descriptions, and variant labels
- collection pages and merchandising copy
- policy pages and legal notices
- shipping and return messaging
- transactional emails and support macros
- campaign landing pages and ad-aligned copy

If any of these layers use different terminology, users feel inconsistency immediately.

### The three failure modes we see most often

### 1) Catalog-first, flow-last

Teams translate product cards but forget checkout and post-purchase communication.

### 2) Campaign velocity without glossary discipline

Fast promotional cycles lead to naming drift and weak brand consistency.

### 3) No market-level QA ownership

Everyone assumes "someone else" checked local wording, pricing context, and tone.

### A repeatable Shopify localization system

### Step 1: Prioritize by business impact

Start with high-intent pages and high-margin product categories. Translate long-tail catalog pages after the core funnel is stable.

### Step 2: Define a market glossary

Protect product names, legal terms, ingredient words, and brand voice anchors. This is your control layer for consistency.

### Step 3: Translate in launch batches

Group assets by campaign, season, or product drop. Batch translation reduces context switching and speeds review.

### Step 4: Run market QA before publish

Validate currency and units, policy language, checkout wording, and CTA clarity in each target locale.

### Step 5: Measure and feed back

Track conversion rate, checkout completion, and support tickets by language. Use the findings to update glossary rules and future batches.

### Why teams use Translayr here

Shopify teams often combine short text work with file-based assets. Translayr keeps both in one workflow, with one glossary and one usage model. That removes a lot of release-week fragmentation.

Build your own multilingual launch workflow: [Start free](/register).
See the full product setup: [Explore features](/products).`,
    contentDE: `E-Commerce-Lokalisierung ist selten nur Übersetzung. Sie ist Umsatz-Infrastruktur.

Wenn Shopify-Teams zu spät oder inkonsistent lokalisieren, sieht man die Folgen sofort: schwächere Conversion, mehr Support-Tickets und weniger Vertrauen in checkout-kritischen Märkten.

Die gute Nachricht: Die meisten Probleme sind operativ vorhersehbar und vermeidbar.

### Was in Shopify wirklich lokalisiert werden muss

Viele Teams unterschätzen den Scope. Es geht nicht nur um Produktbeschreibungen.

Ein launchfähiger Umfang enthält typischerweise:
- Produkttitel, Beschreibungen und Variantenbezeichnungen
- Collection-Seiten und Merchandising-Texte
- Policy-Seiten und rechtliche Hinweise
- Versand- und Rückgabe-Kommunikation
- transaktionale E-Mails und Support-Makros
- Kampagnen-Landingpages und ad-kompatible Copy

Sobald diese Ebenen unterschiedliche Begriffe nutzen, wirkt das für Nutzer inkonsistent.

### Die drei häufigsten Ausfallmuster

### 1) Katalog zuerst, Flow später

Teams übersetzen Produktkarten, aber vergessen Checkout- und Post-Purchase-Texte.

### 2) Kampagnen-Tempo ohne Glossar-Disziplin

Schnelle Promotion-Zyklen führen zu Namensdrift und unstabiler Markenstimme.

### 3) Keine klare Markt-QA-Verantwortung

Alle gehen davon aus, dass "jemand anders" lokale Formulierungen, Preis-Kontext und Ton prüft.

### Ein wiederholbares Shopify-Lokalisierungssystem

### Schritt 1: Nach Business-Impact priorisieren

Starte mit High-Intent-Seiten und margenstarken Kategorien. Long-Tail-Katalog folgt, sobald der Kernfunnel stabil ist.

### Schritt 2: Markt-Glossar definieren

Schütze Produktnamen, rechtliche Begriffe, Zutatenbezeichnungen und zentrale Brand-Formulierungen. Das ist eure Konsistenzschicht.

### Schritt 3: In Launch-Batches übersetzen

Gruppiere Assets nach Kampagne, Saison oder Produkt-Drop. Batches reduzieren Kontextwechsel und beschleunigen Reviews.

### Schritt 4: Markt-QA vor Veröffentlichung

Prüfe Währung und Einheiten, Policy-Formulierungen, Checkout-Wording und CTA-Klarheit je Zielsprache.

### Schritt 5: Messen und zurückspielen

Tracke Conversion, Checkout-Completion und Support-Tickets pro Sprache. Überführe Erkenntnisse in Glossarregeln für kommende Releases.

### Warum Teams hier Translayr einsetzen

Shopify-Teams kombinieren oft Kurztext- und dateibasierte Übersetzung. Translayr führt beides in einem Workflow zusammen - mit einem Glossar und einem Usage-Modell. Das reduziert Release-Fragmentierung deutlich.

Euren mehrsprachigen Launch-Flow aufsetzen: [Kostenlos starten](/register).
Produktaufbau im Detail: [Features ansehen](/products).`,
    date: "2026-04-05",
    author: "Translayr Team",
    category: "Ecommerce",
    categoryDE: "E-Commerce",
    readTime: "9 min read",
    readTimeDE: "9 Min. Lesezeit"
  },
  {
    id: "9",
    slug: "xliff-localization-workflow-guide",
    title: "XLIFF localization workflow: shipping multilingual software without XML headaches",
    titleDE: "XLIFF-Lokalisierungsworkflow: mehrsprachige Software ohne XML-Kopfschmerzen ausliefern",
    excerpt: "A release-focused XLIFF workflow for product teams that need safer handoffs, faster reviews, and stable XML structure.",
    excerptDE: "Ein release-orientierter XLIFF-Workflow für Produktteams, die sichere Handoffs, schnellere Reviews und stabile XML-Struktur brauchen.",
    content: `XLIFF is one of the best formats for software localization because it preserves structure and context. It is also one of the easiest places to lose time when the process around it is weak.

Most teams do not fail because XLIFF is hard. They fail because ownership is unclear between product, engineering, translators, and QA.

### Why XLIFF projects become slow and stressful

The same bottlenecks appear again and again:
- source strings change while translation is in progress
- context is missing for translators
- inline tags are touched accidentally
- QA happens too late to fix issues safely

If your team feels "translation is always last-minute," this is usually the reason.

### A release-ready XLIFF operating model

### 1) Freeze source scope per milestone

Define exactly which string set belongs to the release. Continuous churn destroys predictability and makes QA expensive.

### 2) Add context before translation starts

Attach developer notes and product intent for ambiguous strings. Context reduces review cycles more than any post-editing trick.

### 3) Enforce terminology from day one

UI labels and product nouns should follow glossary rules from the first translation pass. Late terminology correction is one of the biggest hidden costs.

### 4) Keep XML structure protected

Tags and structure are part of the file contract with engineering. Protect them automatically and avoid raw manual edits in critical release windows.

### 5) Review by business risk, not file order

Review onboarding, billing, checkout, and legal flows first. Lower-risk surfaces can follow once core paths are stable.

### 6) Validate inside the product

Do not stop at file validation. Run in-app checks and pseudolocalization where relevant to catch truncation and UI context issues.

### XLIFF QA checklist

- no altered inline tags
- no missing target segments
- glossary terms correctly applied
- core flows reviewed by locale
- staging validation completed

### Where Translayr helps in XLIFF-heavy teams

Translayr keeps XLIFF structure safe while giving product and localization teams one shared surface for status, glossary context, and export flow. That shortens the feedback loop between translators and release owners.

Prepare your next multilingual release: [Create a workspace](/register).
See file support and workflows: [Read docs](/docs).`,
    contentDE: `XLIFF ist eines der besten Formate für Software-Lokalisierung, weil Struktur und Kontext erhalten bleiben. Gleichzeitig verliert man hier schnell Zeit, wenn der Prozess rundherum nicht sauber ist.

Die meisten Teams scheitern nicht an XLIFF selbst, sondern an unklarer Verantwortung zwischen Produkt, Engineering, Übersetzung und QA.

### Warum XLIFF-Projekte langsam und stressig werden

Typische Engpässe wiederholen sich:
- Source-Strings ändern sich während der Übersetzung
- Kontext fehlt für Übersetzer
- Inline-Tags werden versehentlich verändert
- QA startet zu spät für sichere Korrekturen

Wenn euer Team das Gefühl hat, Übersetzung sei immer "Last Minute", liegt hier meist die Ursache.

### Ein release-fähiges XLIFF-Betriebsmodell

### 1) Source-Scope pro Meilenstein einfrieren

Definiere klar, welche String-Menge zum Release gehört. Dauernder Churn zerstört Planbarkeit und verteuert QA.

### 2) Kontext vor Übersetzungsstart ergänzen

Liefere Entwicklerhinweise und Produktintention bei mehrdeutigen Strings. Kontext reduziert Review-Schleifen stärker als spätere Nacharbeit.

### 3) Terminologie von Beginn an erzwingen

UI-Labels und Produktbegriffe sollten bereits im ersten Lauf Glossarregeln folgen. Späte Terminologie-Korrekturen sind ein großer versteckter Kostenfaktor.

### 4) XML-Struktur zuverlässig schützen

Tags und Struktur sind Teil des technischen Vertrags mit Engineering. Schütze sie automatisch und vermeide rohe manuelle Edits in kritischen Release-Phasen.

### 5) Nach Business-Risiko reviewen, nicht nach Dateireihenfolge

Prüfe zuerst Onboarding, Billing, Checkout und Legal-Flows. Niedrigrisiko-Flächen folgen danach.

### 6) Im Produkt validieren

Datei-Validierung allein reicht nicht. Führe In-App-Checks und, wo sinnvoll, Pseudolokalisierung durch, um Trunkierung und Kontextfehler zu erkennen.

### XLIFF-QA-Checkliste

- keine veränderten Inline-Tags
- keine fehlenden Target-Segmente
- Glossarbegriffe korrekt angewendet
- Kernflows je Locale geprüft
- Staging-Validierung abgeschlossen

### Wo Translayr bei XLIFF-lastigen Teams hilft

Translayr schützt XLIFF-Struktur und bietet Produkt- und Localization-Teams eine gemeinsame Oberfläche für Status, Glossar-Kontext und Export-Flow. Das verkürzt Feedback-Loops zwischen Übersetzern und Release-Ownern.

Nächstes mehrsprachiges Release vorbereiten: [Workspace erstellen](/register).
Dateisupport und Prozesse ansehen: [Docs lesen](/docs).`,
    date: "2026-04-04",
    author: "Translayr Team",
    category: "Workflow",
    categoryDE: "Workflow",
    readTime: "10 min read",
    readTimeDE: "10 Min. Lesezeit"
  },
  {
    id: "10",
    slug: "ai-translation-quality-assurance-checklist",
    title: "AI translation QA checklist: 15 checks before you publish",
    titleDE: "KI-Übersetzungs-QA-Checkliste: 15 Prüfungen vor der Veröffentlichung",
    excerpt: "A production QA framework that catches the most expensive translation defects before they reach users.",
    excerptDE: "Ein produktionsnahes QA-Framework, das die teuersten Übersetzungsfehler erkennt, bevor Nutzer sie sehen.",
    content: `AI translation has reduced the time to first draft dramatically. What has not changed is the cost of shipping errors to production.

Most localization incidents are not caused by bad intent or lazy teams. They happen because QA is treated as a final checkbox instead of a structured release stage.

This checklist is designed for teams that want fewer regressions and cleaner launches.

### The principle behind this checklist

Language quality and technical integrity must both pass. A sentence can be linguistically perfect and still break a user flow if placeholders, tags, or formatting are wrong.

### 15 checks before publish

- verify placeholders and dynamic variables
- confirm plural and gender logic
- enforce glossary compliance on core terms
- check tone consistency across related pages
- manually review legal and policy text
- validate dates, numbers, and currency formats
- inspect UI truncation and line breaks
- test links and CTA labels in context
- verify locale-specific units and conventions
- validate HTML/XML integrity after export
- review support macros and canned responses
- prioritize top-traffic and high-risk pages
- run in-product smoke tests by locale
- request native-speaker review on critical flows
- require explicit owner sign-off before release

### How to operationalize the checklist

Do not run all checks at the same depth for all content. Use a risk-tier model:
- Tier 1: checkout, billing, legal, onboarding
- Tier 2: product education and account management
- Tier 3: long-tail support and low-impact content

This keeps QA realistic without lowering standards on critical surfaces.

### Ownership model that prevents late surprises

Assign owners by stage:
- translation owner
- linguistic reviewer
- technical QA owner
- release approver

When ownership is ambiguous, defects survive to production.

### Why teams use Translayr for QA-heavy workflows

Translayr helps QA teams by centralizing glossary rules, project state, and file integrity checks in one place. That frees reviewers to focus on meaning and risk instead of manual file rescue.

Use this checklist in your next sprint: [Start free](/register).`,
    contentDE: `KI-Übersetzung hat die Zeit bis zum ersten Entwurf massiv verkürzt. Unverändert hoch bleibt jedoch der Schaden, wenn Fehler in Produktion landen.

Die meisten Localization-Incidents entstehen nicht durch fehlende Motivation, sondern weil QA als letzter Haken behandelt wird statt als strukturierte Release-Phase.

Diese Checkliste ist für Teams gedacht, die weniger Regressionen und sauberere Launches wollen.

### Das Grundprinzip

Sprachqualität und technische Integrität müssen beide bestehen. Ein Satz kann sprachlich gut sein und trotzdem den User-Flow brechen, wenn Platzhalter, Tags oder Formatierung falsch sind.

### 15 Prüfungen vor dem Publish

- Platzhalter und dynamische Variablen verifizieren
- Plural- und Gender-Logik bestätigen
- Glossar-Compliance bei Kernbegriffen erzwingen
- Tonalität über zusammenhängende Seiten prüfen
- rechtliche und Policy-Texte manuell reviewen
- Datums-, Zahlen- und Währungsformat validieren
- UI-Trunkierung und Zeilenumbrüche prüfen
- Links und CTA-Labels im Kontext testen
- locale-spezifische Einheiten und Konventionen verifizieren
- HTML/XML-Integrität nach Export validieren
- Support-Makros und Standardantworten prüfen
- Seiten mit hohem Traffic und Risiko priorisieren
- In-Product-Smoke-Tests je Locale durchführen
- Native-Speaker-Review für kritische Flows einholen
- explizites Owner-Sign-off vor Release verlangen

### So wird die Checkliste operativ nutzbar

Nicht jeder Inhalt braucht dieselbe Prüftiefe. Nutze ein Risiko-Tiering:
- Tier 1: Checkout, Billing, Legal, Onboarding
- Tier 2: Produktbildung und Account-Verwaltung
- Tier 3: Long-Tail-Support und Low-Impact-Content

So bleibt QA realistisch, ohne kritische Flächen zu verwässern.

### Ownership-Modell gegen späte Überraschungen

Lege Verantwortliche pro Phase fest:
- Translation-Owner
- Linguistic-Reviewer
- Technical-QA-Owner
- Release-Approver

Bei unklarer Ownership überleben Defekte bis in Produktion.

### Warum Teams für QA-lastige Workflows Translayr nutzen

Translayr bündelt Glossarregeln, Projektstatus und Dateiintegritätsprüfungen in einer Oberfläche. Dadurch können Reviewer sich auf Bedeutung und Risiko konzentrieren statt auf Dateireparatur.

Checkliste im nächsten Sprint einsetzen: [Kostenlos starten](/register).`,
    date: "2026-04-03",
    author: "Translayr Team",
    category: "Quality",
    categoryDE: "Qualität",
    readTime: "9 min read",
    readTimeDE: "9 Min. Lesezeit"
  },
  {
    id: "11",
    slug: "translation-glossary-best-practices",
    title: "Translation glossary best practices: keep terminology consistent at scale",
    titleDE: "Glossar-Best-Practices: Terminologie in großem Maßstab konsistent halten",
    excerpt: "How to build a glossary that teams actually use: ownership, approval rules, conflict handling, and rollout strategy.",
    excerptDE: "So baust du ein Glossar, das Teams wirklich nutzen: Ownership, Freigaberegeln, Konfliktlösung und Rollout-Strategie.",
    content: `Glossary quality is one of the strongest predictors of localization quality. Yet many teams treat glossaries as static reference files nobody updates.

A good glossary is not a dictionary. It is a decision system that reduces review noise and prevents brand drift across channels.

### Why terminology drift is expensive

When terms are inconsistent, three things happen:
- users lose trust because naming changes between screens
- support teams spend time clarifying language confusion
- reviewers repeatedly fix the same words in every release

That cost compounds over time.

### Build a glossary as an operating layer

### 1) Start with high-impact terms only

Begin with 50-100 terms that appear frequently and matter commercially: product names, pricing terms, conversion-critical actions, legal phrases.

### 2) Store both approved and rejected variants

A glossary with only "preferred" terms is incomplete. Reviewers also need to see what should not be used.

### 3) Add context, not just equivalents

For ambiguous terms, include short usage examples. Context prevents misuse more effectively than translation pairs alone.

### 4) Mark protected terms explicitly

Brand names, feature names, and legal terms should be tagged as protected when needed.

### 5) Define ownership and review cadence

Assign a glossary owner and run scheduled monthly updates with product, support, and marketing representation.

### Glossary governance model

Use simple states:
- proposed
- approved
- deprecated

This makes changes auditable and avoids random ad-hoc edits under deadline pressure.

### Common mistakes to avoid

- loading thousands of low-value terms too early
- skipping regional variants (for example different German markets)
- updating terms without communicating release impact
- treating glossary updates as language-only decisions without product input

### Where Translayr helps

Translayr lets teams manage glossary collections and apply rules directly in translation workflows. That means terminology policy moves from PDF documentation into day-to-day execution.

Create your glossary workflow: [Create a workspace](/register).`,
    contentDE: `Glossarqualität ist einer der stärksten Treiber für Localization-Qualität. Trotzdem behandeln viele Teams Glossare wie statische Referenzdateien, die niemand pflegt.

Ein gutes Glossar ist kein Wörterbuch. Es ist ein Entscheidungssystem, das Review-Rauschen reduziert und Brand-Drift über Kanäle verhindert.

### Warum Terminologie-Drift teuer wird

Bei inkonsistenten Begriffen passieren drei Dinge:
- Nutzer verlieren Vertrauen, weil Benennungen zwischen Screens wechseln
- Support-Teams erklären unnötig oft dieselben Begriffe
- Reviewer korrigieren in jedem Release wieder dieselben Wörter

Diese Kosten wachsen mit jedem Zyklus.

### Glossar als operative Schicht aufbauen

### 1) Mit High-Impact-Begriffen starten

Beginne mit 50-100 Begriffen, die oft vorkommen und geschäftlich relevant sind: Produktnamen, Preisterme, conversion-kritische Aktionen, rechtliche Formulierungen.

### 2) Freigegebene und abgelehnte Varianten speichern

Ein Glossar nur mit "bevorzugten" Begriffen ist unvollständig. Reviewer müssen auch sehen, was nicht verwendet werden soll.

### 3) Kontext statt reiner Äquivalente ergänzen

Bei mehrdeutigen Begriffen kurze Verwendungsbeispiele hinzufügen. Kontext verhindert Fehlverwendung besser als reine Wortpaare.

### 4) Geschützte Begriffe explizit markieren

Markennamen, Feature-Namen und rechtliche Terme sollten, wo nötig, als geschützt gekennzeichnet werden.

### 5) Ownership und Review-Rhythmus definieren

Benenne einen Glossar-Owner und plane monatliche Updates mit Produkt-, Support- und Marketing-Beteiligung.

### Governance-Modell für Glossare

Einfache Status reichen:
- vorgeschlagen
- freigegeben
- veraltet

So bleiben Änderungen nachvollziehbar und zufällige Deadline-Edits werden reduziert.

### Häufige Fehler vermeiden

- zu früh tausende Low-Value-Begriffe aufnehmen
- regionale Varianten ignorieren (z.B. unterschiedliche deutsche Märkte)
- Begriffe ändern, ohne Release-Auswirkung zu kommunizieren
- Glossar als reine Sprachentscheidung ohne Produktinput behandeln

### Wo Translayr unterstützt

Translayr ermöglicht Glossar-Collections direkt im Übersetzungs-Workflow. Damit wandert Terminologie-Policy aus PDF-Dokumenten in die operative Ausführung.

Glossar-Workflow aufsetzen: [Workspace erstellen](/register).`,
    date: "2026-04-02",
    author: "Translayr Team",
    category: "Glossary",
    categoryDE: "Glossar",
    readTime: "9 min read",
    readTimeDE: "9 Min. Lesezeit"
  },
  {
    id: "12",
    slug: "translation-pricing-guide-credits-vs-characters",
    title: "Translation pricing explained: credits vs character-based billing",
    titleDE: "Übersetzungspreise erklärt: Credits vs zeichenbasierte Abrechnung",
    excerpt: "A practical pricing guide for localization leaders: compare billing models, forecast correctly, and avoid surprise costs during release-heavy months.",
    excerptDE: "Ein praxisnaher Preis-Guide für Localization-Verantwortliche: Billing-Modelle vergleichen, sauber forecasten und Überraschungskosten in Release-Monaten vermeiden.",
    content: `Translation pricing is not just a finance topic. It shapes team behavior, release planning, and prioritization.

Two tools can produce similar output quality but lead to very different operating costs depending on how billing is structured.

### The four most common billing models

- per character
- per seat
- per API request
- per word or credit

None of these is universally "best." The right model depends on your workflow and planning maturity.

### Why many teams struggle with character-based billing

Character-based pricing can be precise, but it is hard for non-technical stakeholders to forecast. Content and product teams naturally estimate in words, not character counts.

It also becomes difficult to compare costs across file types and channels when planning release budgets.

### Why word or credit models are easier to govern

Most multilingual programs discuss scope in words:
- how much UI copy changed this sprint
- how many docs are included in launch
- how much campaign content needs localization

A one-credit-equals-one-word model maps directly to that planning language and simplifies budget reviews.

### The hidden cost nobody tracks

The largest cost is often not translation itself. It is rework from unclear forecasting and late budget adjustments:
- rushed approvals
- skipped QA on low-priority locales
- inconsistent scope cuts per market

Better pricing visibility reduces these downstream quality costs.

### A practical forecasting framework

### 1) Build a baseline

Estimate recurring monthly volume from product, docs, support, and marketing.

### 2) Add a campaign buffer

Reserve extra capacity for launch spikes, seasonal campaigns, or urgent legal updates.

### 3) Separate guaranteed vs optional scope

Define what must ship in every locale and what can be deferred.

### 4) Track weekly during active launch windows

Monthly checks are too slow during high-change periods.

### How Translayr structures this

Translayr uses one shared credit pool across file and text translation, so teams do not need separate budget silos for different workflows. This keeps planning and reporting cleaner across departments.

Compare available plans: [View pricing](/pricing).
Start tracking with real usage: [Open a free account](/register).`,
    contentDE: `Übersetzungspreise sind nicht nur ein Finance-Thema. Sie beeinflussen Teamverhalten, Release-Planung und Priorisierung.

Zwei Tools können ähnlich gute Ausgabe liefern und trotzdem sehr unterschiedliche Gesamtkosten erzeugen - je nach Billing-Struktur.

### Die vier gängigsten Abrechnungsmodelle

- pro Zeichen
- pro Seat
- pro API-Request
- pro Wort oder Credit

Keines dieser Modelle ist pauschal "am besten". Entscheidend ist, wie gut es zu eurem Workflow und eurer Planungsreife passt.

### Warum viele Teams mit Zeichenpreisen kämpfen

Zeichenbasierte Abrechnung kann präzise sein, ist aber für nicht-technische Stakeholder schwer zu forecasten. Content- und Produktteams planen natürlich in Wörtern, nicht in Zeichen.

Zusätzlich wird der Kostenvergleich über Dateitypen und Kanäle hinweg schnell unübersichtlich.

### Warum Wort- oder Credit-Modelle oft besser steuerbar sind

Die meisten mehrsprachigen Programme diskutieren Scope in Wörtern:
- wie viel UI-Copy im Sprint geändert wurde
- wie viele Doku-Seiten im Launch enthalten sind
- wie viel Kampagnen-Content lokalisiert werden muss

Ein Modell mit einem Credit pro Wort passt direkt zu dieser Planungssprache und vereinfacht Budgetgespräche.

### Der versteckte Kostenblock

Der größte Kostenfaktor ist häufig nicht die Übersetzung selbst, sondern Rework durch unklare Planung und späte Budgetkorrekturen:
- hastige Freigaben
- gekürzte QA in Nebenlokalen
- inkonsistente Scope-Kürzungen pro Markt

Bessere Preis-Transparenz reduziert diese Folgekosten.

### Ein pragmatisches Forecast-Framework

### 1) Baseline aufbauen

Schätze wiederkehrendes Monatsvolumen aus Produkt, Doku, Support und Marketing.

### 2) Kampagnen-Puffer einplanen

Reserviere Kapazität für Launch-Spitzen, saisonale Kampagnen und kurzfristige Rechtsupdates.

### 3) Pflicht- vs optionalen Scope trennen

Definiere, was in jeder Locale zwingend live gehen muss und was verschoben werden kann.

### 4) In aktiven Launch-Phasen wöchentlich tracken

Monatliche Kontrolle ist bei hohem Änderungsdruck zu langsam.

### Wie Translayr das abbildet

Translayr nutzt einen gemeinsamen Credit-Pool für Datei- und Textübersetzung. Dadurch brauchen Teams keine separaten Budget-Silos je Workflow und Reporting bleibt abteilungsübergreifend sauber.

Verfügbare Pläne vergleichen: [Pricing ansehen](/pricing).
Mit realen Nutzungsdaten starten: [Kostenlosen Account erstellen](/register).`,
    date: "2026-04-01",
    author: "Translayr Team",
    category: "Pricing",
    categoryDE: "Preise",
    readTime: "9 min read",
    readTimeDE: "9 Min. Lesezeit"
  },
  {
    id: "13",
    slug: "localization-launch-checklist",
    title: "Localization launch checklist: from source freeze to post-release QA",
    titleDE: "Lokalisierungs-Launch-Checkliste: von Source-Freeze bis Post-Release-QA",
    excerpt: "A complete launch sequence for multilingual product releases, including planning, translation, QA, rollout, and post-release learning loops.",
    excerptDE: "Eine vollständige Launch-Sequenz für mehrsprachige Produkt-Releases inklusive Planung, Übersetzung, QA, Rollout und Post-Release-Learning-Loops.",
    content: `Most localization bugs are created long before translation starts. They are created in planning, ownership, and release sequencing.

If your team regularly ships multilingual updates, a checklist is not bureaucracy. It is risk control.

### Why launch failures repeat

The same patterns appear in almost every incident review:
- no clear source freeze
- unclear locale priority
- translation and QA owners assigned too late
- release pressure forcing unreviewed content live

Without a structured flow, teams solve each release from scratch.

### End-to-end localization launch framework

### Phase 1: Pre-translation planning

- freeze strings for a defined release window
- confirm target locales and market tiers
- update glossary and forbidden terms
- assign translation, review, QA, and final sign-off owners

This is where quality is won. Late planning always pushes risk downstream.

### Phase 2: Translation execution

- translate by feature bundle, not random file order
- keep ambiguity flags visible and resolved early
- track progress by language and risk class

The goal is predictability, not just speed.

### Phase 3: QA and validation

- validate placeholders, variables, and file integrity
- review legal, billing, checkout, and onboarding first
- run UI truncation and context checks
- verify locale-specific metadata where relevant

Treat this phase as release engineering, not editorial polishing.

### Phase 4: Controlled rollout

- deploy locale packages in staged waves
- monitor support and conversion signals by locale
- keep a single defect log for fast triage

Staged rollout prevents one bad locale from becoming a full incident.

### Phase 5: Post-release learning loop

- map recurring defects to glossary or process rules
- update reviewer playbooks
- prioritize systemic fixes in the next sprint

This is how launch quality compounds over time.

### What high-performing teams do differently

They treat localization as part of product operations, not as a side request to content teams. They instrument process health and make release readiness visible.

### Where Translayr fits

Translayr brings files, glossary decisions, and usage visibility into one operating surface, so teams can run this launch model with less handoff friction.

Use this framework in your next release cycle: [Start free](/register).`,
    contentDE: `Die meisten Lokalisierungsfehler entstehen lange vor der eigentlichen Übersetzung - in Planung, Ownership und Release-Sequenz.

Wenn dein Team regelmäßig mehrsprachige Updates ausliefert, ist eine Checkliste keine Bürokratie, sondern Risikokontrolle.

### Warum Launch-Fehler sich wiederholen

Die gleichen Muster tauchen in Incident-Reviews immer wieder auf:
- kein klarer Source-Freeze
- unklare Locale-Priorisierung
- Translation- und QA-Owner zu spät benannt
- Release-Druck führt zu ungeprüfter Veröffentlichung

Ohne strukturierten Flow wird jedes Release neu improvisiert.

### End-to-End-Framework für Localization-Launches

### Phase 1: Planung vor der Übersetzung

- Strings für ein klares Release-Fenster einfrieren
- Ziel-Lokale und Markt-Tiers festlegen
- Glossar und verbotene Begriffe aktualisieren
- Verantwortliche für Übersetzung, Review, QA und finale Freigabe benennen

Hier wird Qualität gewonnen. Späte Planung verschiebt Risiko immer nach hinten.

### Phase 2: Übersetzungsausführung

- nach Feature-Bundles statt zufälliger Dateireihenfolge übersetzen
- Unklarheiten früh sichtbar machen und auflösen
- Fortschritt je Sprache und Risikoklasse tracken

Ziel ist Planbarkeit, nicht nur Tempo.

### Phase 3: QA und Validierung

- Platzhalter, Variablen und Dateiintegrität validieren
- Legal-, Billing-, Checkout- und Onboarding-Flows zuerst prüfen
- UI-Trunkierung und Kontexttests durchführen
- locale-spezifische Metadaten prüfen, wo relevant

Diese Phase ist Release-Engineering, nicht nur Textpolitur.

### Phase 4: Kontrollierter Rollout

- Locale-Pakete in gestuften Wellen ausrollen
- Support- und Conversion-Signale je Locale überwachen
- eine zentrale Defektliste für schnelle Triage führen

Gestufter Rollout verhindert, dass eine problematische Locale zum Großvorfall wird.

### Phase 5: Post-Release-Learning-Loop

- wiederkehrende Defekte in Glossar- oder Prozessregeln überführen
- Reviewer-Playbooks aktualisieren
- systemische Verbesserungen für den nächsten Sprint priorisieren

So verbessert sich Launch-Qualität von Zyklus zu Zyklus.

### Was starke Teams anders machen

Sie behandeln Lokalisierung als Teil der Produkt-Operations, nicht als Nebenaufgabe für Content-Teams. Sie messen Prozessgesundheit und machen Release-Readiness transparent.

### Wo Translayr passt

Translayr führt Dateien, Glossarentscheidungen und Usage-Transparenz in einer operativen Oberfläche zusammen. Das reduziert Handoff-Reibung in diesem Launch-Modell deutlich.

Framework im nächsten Release anwenden: [Kostenlos starten](/register).`,
    date: "2026-03-31",
    author: "Translayr Team",
    category: "Operations",
    categoryDE: "Operations",
    readTime: "9 min read",
    readTimeDE: "9 Min. Lesezeit"
  }
];

function renderTextWithLinks(text: string): ReactNode {
  const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = markdownLinkPattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const [, label, href] = match;
    const key = `${href}-${match.index}`;
    const isInternal = href.startsWith("/");

    parts.push(
      isInternal ? (
        <Link key={key} href={href} className="font-medium text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 transition hover:decoration-[var(--foreground)]">
          {label}
        </Link>
      ) : (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 transition hover:decoration-[var(--foreground)]"
        >
          {label}
        </a>
      )
    );

    lastIndex = match.index + match[0].length;
    match = markdownLinkPattern.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    return text;
  }

  return parts.map((part, index) => (
    <Fragment key={`${typeof part === "string" ? part : "link"}-${index}`}>{part}</Fragment>
  ));
}

type BlogView = "list" | "post";

export default function BlogPage() {
  const [view, setView] = useState<BlogView>("list");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "de">("en");

  const sortedPosts = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const activePost = activeSlug ? sortedPosts.find((p) => p.slug === activeSlug) ?? null : null;

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
                      <span className="font-medium text-[var(--foreground)]">{parts[0]}</span>{renderTextWithLinks(parts[1] ?? "")}
                    </li>
                  );
                }
                if (block.startsWith("- ")) {
                  return <li key={i} className="ml-4 mt-2 text-[14px] leading-7 text-[var(--muted)] list-disc">{renderTextWithLinks(block.replace("- ", ""))}</li>;
                }
                if (block.trim() === "") return null;
                return <p key={i} className="mt-3 text-[15px] leading-8 text-[var(--muted)]">{renderTextWithLinks(block)}</p>;
              })}
            </div>
          </article>

          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <h3 className="text-[16px] font-semibold">{lang === "de" ? "Mehr Beiträge" : "More posts"}</h3>
            <div className="mt-4 space-y-3">
              {sortedPosts.filter((p) => p.slug !== activePost.slug).map((post) => (
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
          {sortedPosts.map((post) => (
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
