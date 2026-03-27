"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { countMeaningfulTextContent } from "@/lib/translation/word-count";
import { getLanguageLabel } from "@/lib/projects/formatters";
import { getLanguageOptions } from "@/lib/languages";
import type { SettingsToneStyle } from "@/types/workspace";
import type {
  TextTranslationApiSuccess,
  TranslationApiErrorShape
} from "@/types/translation";

const TONE_OPTIONS: SettingsToneStyle[] = ["Neutral", "Formal", "Informal", "Marketing", "Technical"];
const RECENT_LANGUAGE_STORAGE_KEY = "translayr.recent-language-codes";

type TextTranslationScreenProps = {
  defaultTargetLanguage: string;
  defaultToneStyle: SettingsToneStyle;
};

export function TextTranslationScreen({
  defaultTargetLanguage,
  defaultToneStyle
}: TextTranslationScreenProps) {
  const locale = useAppLocale();
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLanguage);
  const [toneStyle, setToneStyle] = useState<SettingsToneStyle>(defaultToneStyle);
  const [recentLanguageCodes, setRecentLanguageCodes] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextTranslationApiSuccess | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const languageOptions = useMemo(
    () =>
      getLanguageOptions(locale, [
        ...recentLanguageCodes,
        sourceLanguage !== "auto" ? sourceLanguage : "",
        targetLanguage
      ]),
    [locale, recentLanguageCodes, sourceLanguage, targetLanguage]
  );
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Translate",
          heading: "Text übersetzen",
          intro:
            "Direkter Text-Flow für schnelle Übersetzungen, QA-Snippets und kurze Produkttexte.",
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
          emptyStateBody: "Nutze diese Fläche für schnellen Text-Output und kurze Übersetzungen.",
          translateFailed: "Textübersetzung fehlgeschlagen."
        }
      : {
          eyebrow: "/ Translate",
          heading: "Translate text",
          intro:
            "A direct text flow for quick translations, QA snippets, and short product copy.",
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
          emptyStateBody: "Use this surface for fast text output and short translations.",
          translateFailed: "Text translation failed."
        };

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(RECENT_LANGUAGE_STORAGE_KEY);

      if (!rawValue) {
        return;
      }

      const parsedValue = JSON.parse(rawValue) as unknown;

      if (Array.isArray(parsedValue)) {
        setRecentLanguageCodes(parsedValue.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      // Ignore malformed local storage and fall back to static language ordering.
    }
  }, []);

  const textStats = useMemo(() => {
    return {
      wordCount: countMeaningfulTextContent(text),
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
      persistRecentLanguages([
        payload.detectedSourceLanguage,
        payload.targetLanguage
      ]);
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

  function persistRecentLanguages(codes: string[]) {
    const nextCodes = Array.from(
      new Set(
        [...codes, ...recentLanguageCodes].filter((value): value is string => typeof value === "string" && value.length > 0)
      )
    ).slice(0, 8);

    setRecentLanguageCodes(nextCodes);

    try {
      window.localStorage.setItem(RECENT_LANGUAGE_STORAGE_KEY, JSON.stringify(nextCodes));
    } catch {
      // Ignore storage failures and keep recent language priority in memory.
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
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
      </header>

      <div className="px-7 py-6">
        <div className="max-w-[1100px] space-y-6">
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

      </div>
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

const INPUT_CLASS_NAME =
  "h-11 w-full rounded-[12px] border border-[var(--border)] bg-white px-3 text-[13px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]";
