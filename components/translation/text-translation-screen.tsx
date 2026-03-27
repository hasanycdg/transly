"use client";

import { useMemo, useState, type ReactNode } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { getRoadmapStatusCounts, PRODUCT_ROADMAP_PHASES } from "@/lib/product-roadmap";
import { getLanguageLabel } from "@/lib/projects/formatters";
import { getLanguageOptions } from "@/lib/languages";
import type { SettingsToneStyle } from "@/types/workspace";
import type {
  TextTranslationApiSuccess,
  TranslationApiErrorShape
} from "@/types/translation";

const TONE_OPTIONS: SettingsToneStyle[] = ["Neutral", "Formal", "Informal", "Marketing", "Technical"];

type TextTranslationScreenProps = {
  defaultTargetLanguage: string;
  defaultToneStyle: SettingsToneStyle;
};

export function TextTranslationScreen({
  defaultTargetLanguage,
  defaultToneStyle
}: TextTranslationScreenProps) {
  const locale = useAppLocale();
  const languageOptions = getLanguageOptions(locale);
  const roadmapCounts = getRoadmapStatusCounts();
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLanguage);
  const [toneStyle, setToneStyle] = useState<SettingsToneStyle>(defaultToneStyle);
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextTranslationApiSuccess | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Translate",
          heading: "Text übersetzen",
          intro:
            "Erster Ausbau über XLIFF hinaus: direkter Text-Flow für schnelle Übersetzungen, QA-Snippets und kurze Produkttexte.",
          roadmapEyebrow: "/ Produkt-Roadmap",
          roadmapTitle: "Vom Dateitool zur Translation Workspace",
          roadmapBody:
            "Phase 1 erweitert die Oberfläche um direkte Textübersetzung und eine klarere Produktführung. Die nächsten Phasen bauen Multi-Format, Memory und API darauf auf.",
          live: "Live",
          inProgress: "In Arbeit",
          planned: "Geplant",
          sourceLanguage: "Quellsprache",
          targetLanguage: "Zielsprache",
          autoDetect: "Automatisch erkennen",
          tone: "Ton",
          sourceText: "Quelltext",
          sourcePlaceholder:
            "Füge hier Produkttext, Support-Antworten, UI-Strings oder kurze Marketing-Copy ein.",
          translate: "Text übersetzen",
          translating: "Übersetzt...",
          wordCount: "Wörter",
          characterCount: "Zeichen",
          outputTitle: "Übersetzung",
          outputBody: "Das Ergebnis erscheint hier und kann direkt kopiert oder als TXT exportiert werden.",
          detectedSource: "Erkannte Quellsprache",
          toneApplied: "Angewandter Ton",
          copyResult: "Ergebnis kopieren",
          exportTxt: "Als TXT exportieren",
          emptyState: "Noch keine Übersetzung gestartet.",
          emptyStateBody: "Nutze diese Fläche für schnellen Text-Output, bevor Multi-Format und Translation Memory dazukommen.",
          translateFailed: "Textübersetzung fehlgeschlagen.",
          roadmapLabels: {
            live: "Bereits produktiv",
            in_progress: "Aktuell in Umsetzung",
            planned: "Als Nächstes geplant"
          }
        }
      : {
          eyebrow: "/ Translate",
          heading: "Translate text",
          intro:
            "The first expansion beyond XLIFF: a direct text flow for quick translations, QA snippets, and short product copy.",
          roadmapEyebrow: "/ Product Roadmap",
          roadmapTitle: "From file tool to translation workspace",
          roadmapBody:
            "Phase 1 expands the surface with direct text translation and clearer product direction. The following phases build multi-format, memory, and API on top of that base.",
          live: "Live",
          inProgress: "In progress",
          planned: "Planned",
          sourceLanguage: "Source language",
          targetLanguage: "Target language",
          autoDetect: "Auto-detect",
          tone: "Tone",
          sourceText: "Source text",
          sourcePlaceholder:
            "Paste product copy, support replies, UI strings, or short marketing text here.",
          translate: "Translate text",
          translating: "Translating...",
          wordCount: "Words",
          characterCount: "Characters",
          outputTitle: "Translation",
          outputBody: "The result appears here and can be copied or exported as TXT immediately.",
          detectedSource: "Detected source language",
          toneApplied: "Applied tone",
          copyResult: "Copy result",
          exportTxt: "Export as TXT",
          emptyState: "No translation started yet.",
          emptyStateBody: "Use this surface for fast text output before multi-format and translation memory arrive.",
          translateFailed: "Text translation failed.",
          roadmapLabels: {
            live: "Already productive",
            in_progress: "Currently shipping",
            planned: "Planned next"
          }
        };

  const textStats = useMemo(() => {
    const trimmed = text.trim();

    return {
      wordCount: trimmed.length > 0 ? trimmed.split(/\s+/).length : 0,
      characterCount: text.length
    };
  }, [text]);

  async function handleTranslate() {
    if (isSubmitting || text.trim().length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await fetch("/api/translate/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLanguage === "auto" ? null : sourceLanguage,
          targetLanguage,
          toneStyle
        })
      });
      const payload = (await response.json()) as TextTranslationApiSuccess | TranslationApiErrorShape;

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error.message : copy.translateFailed);
      }

      setResult(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.translateFailed);
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyResult() {
    if (!result?.translatedText) {
      return;
    }

    await navigator.clipboard.writeText(result.translatedText);
  }

  function handleExportTxt() {
    if (!result?.translatedText) {
      return;
    }

    const blob = new Blob([result.translatedText], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `translation-${result.detectedSourceLanguage}-${result.targetLanguage}.txt`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]">
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

          <div className="grid grid-cols-3 overflow-hidden rounded-[14px] border border-[var(--border)] bg-white">
            <RoadmapMetric label={copy.live} value={String(roadmapCounts.live)} />
            <RoadmapMetric label={copy.inProgress} value={String(roadmapCounts.in_progress)} />
            <RoadmapMetric label={copy.planned} value={String(roadmapCounts.planned)} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 px-7 py-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="space-y-6">
          <section className="rounded-[16px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    {copy.sourceText}
                  </p>
                  <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                    {copy.outputBody}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[var(--muted)]">
                  <span>{textStats.wordCount} {copy.wordCount.toLowerCase()}</span>
                  <span className="text-[var(--border-strong)]">/</span>
                  <span>{textStats.characterCount} {copy.characterCount.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-3">
                <FieldGroup label={copy.sourceLanguage}>
                  <select
                    value={sourceLanguage}
                    onChange={(event) => setSourceLanguage(event.target.value)}
                    className={INPUT_CLASS_NAME}
                  >
                    <option value="auto">{copy.autoDetect}</option>
                    {languageOptions.map((option) => (
                      <option key={`source-${option.code}`} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldGroup>

                <FieldGroup label={copy.targetLanguage}>
                  <select
                    value={targetLanguage}
                    onChange={(event) => setTargetLanguage(event.target.value)}
                    className={INPUT_CLASS_NAME}
                  >
                    {languageOptions
                      .filter((option) => option.code !== sourceLanguage || sourceLanguage === "auto")
                      .map((option) => (
                        <option key={`target-${option.code}`} value={option.code}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </FieldGroup>

                <FieldGroup label={copy.tone}>
                  <select
                    value={toneStyle}
                    onChange={(event) => setToneStyle(event.target.value as SettingsToneStyle)}
                    className={INPUT_CLASS_NAME}
                  >
                    {TONE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FieldGroup>
              </div>

              <div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={copy.sourcePlaceholder}
                  className="min-h-[280px] w-full rounded-[14px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-[13px] leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                />
              </div>

              {errorMessage ? (
                <div className="rounded-[14px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[12px] text-[var(--danger)]">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-[11.5px] text-[var(--muted)]">
                  <span>{textStats.wordCount} {copy.wordCount}</span>
                  <span>{textStats.characterCount} {copy.characterCount}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleTranslate()}
                  disabled={isSubmitting || text.trim().length === 0}
                  className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[var(--foreground)] px-5 text-[12.5px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSubmitting ? copy.translating : copy.translate}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.outputTitle}
              </p>
              <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                {result ? getLanguageLabel(result.targetLanguage, locale) : copy.emptyState}
              </h2>
              <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">
                {result ? copy.outputBody : copy.emptyStateBody}
              </p>
            </div>

            <div className="space-y-5 px-5 py-5">
              {result ? (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    <ResultMeta
                      label={copy.detectedSource}
                      value={getLanguageLabel(result.detectedSourceLanguage, locale)}
                    />
                    <ResultMeta label={copy.targetLanguage} value={getLanguageLabel(result.targetLanguage, locale)} />
                    <ResultMeta label={copy.toneApplied} value={result.toneStyle} />
                  </div>

                  <div className="rounded-[14px] border border-[var(--border)] bg-[var(--background)] px-4 py-4">
                    <p className="whitespace-pre-wrap text-[13px] leading-6 text-[var(--foreground)]">
                      {result.translatedText}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleCopyResult()}
                      className="rounded-[12px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
                    >
                      {copy.copyResult}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportTxt}
                      className="rounded-[12px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
                    >
                      {copy.exportTxt}
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-8 text-[12px] text-[var(--muted)]">
                  {copy.emptyStateBody}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[16px] border border-[var(--border)] bg-white px-5 py-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.roadmapEyebrow}
            </p>
            <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
              {copy.roadmapTitle}
            </h2>
            <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
              {copy.roadmapBody}
            </p>

            <div className="mt-5 space-y-4">
              {PRODUCT_ROADMAP_PHASES.map((phase) => (
                <div
                  key={phase.id}
                  className="rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                        {phase.horizon}
                      </p>
                      <h3 className="mt-1 text-[14px] font-semibold text-[var(--foreground)]">
                        {phase.title}
                      </h3>
                    </div>
                    <span className={getRoadmapBadgeClassName(phase.status)}>
                      {copy.roadmapLabels[phase.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-[12px] leading-6 text-[var(--muted)]">
                    {phase.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {phase.deliverables.map((item) => (
                      <span
                        key={`${phase.id}-${item}`}
                        className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[10.5px] font-medium text-[var(--foreground)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function RoadmapMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--border-light)] px-4 py-3 last:border-r-0">
      <div className="text-[20px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">{value}</div>
      <div className="text-[11px] text-[var(--muted-soft)]">{label}</div>
    </div>
  );
}

function FieldGroup({
  children,
  label
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[12px] font-medium text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}

function ResultMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">{label}</div>
      <div className="mt-1 text-[13px] font-medium text-[var(--foreground)]">{value}</div>
    </div>
  );
}

function getRoadmapBadgeClassName(status: "live" | "in_progress" | "planned") {
  switch (status) {
    case "live":
      return "rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--success)]";
    case "in_progress":
      return "rounded-full border border-[var(--processing-border)] bg-[var(--processing-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--processing)]";
    case "planned":
    default:
      return "rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]";
  }
}

const INPUT_CLASS_NAME =
  "h-11 w-full rounded-[12px] border border-[var(--border)] bg-white px-3 text-[13px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]";
