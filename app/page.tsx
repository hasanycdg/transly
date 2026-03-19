"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { LanguageSelector } from "@/components/language-selector";
import { TranslationStatus } from "@/components/translation-status";
import { UploadDropzone } from "@/components/upload-dropzone";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import type { TranslationApiErrorShape, TranslationApiSuccess } from "@/types/translation";
import type { XliffWarning } from "@/types/xliff";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguageFallback, setSourceLanguageFallback] = useState("");
  const [showSourceLanguageFallback, setShowSourceLanguageFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<XliffWarning[]>([]);
  const [result, setResult] = useState<TranslationApiSuccess | null>(null);

  const canTranslate = useMemo(() => {
    if (!file || !targetLanguage || isLoading) {
      return false;
    }

    if (showSourceLanguageFallback && !sourceLanguageFallback) {
      return false;
    }

    return true;
  }, [file, isLoading, showSourceLanguageFallback, sourceLanguageFallback, targetLanguage]);

  async function handleTranslate() {
    if (!file || !targetLanguage) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLanguage", targetLanguage);

    if (sourceLanguageFallback) {
      formData.append("sourceLanguage", sourceLanguageFallback);
    }

    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    setWarnings([]);
    setResult(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as TranslationApiSuccess | TranslationApiErrorShape;

      if (!response.ok) {
        const errorPayload = payload as TranslationApiErrorShape;
        setError(errorPayload.error.message);
        setErrorCode(errorPayload.error.code);

        if (errorPayload.error.code === "missing_source_language") {
          setShowSourceLanguageFallback(true);
        }

        return;
      }

      const successPayload = payload as TranslationApiSuccess;
      setWarnings(successPayload.warnings);
      setResult(successPayload);
      setShowSourceLanguageFallback(false);
    } catch {
      setError("The request failed before a translated file could be returned.");
      setErrorCode("translation_provider_error");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownload() {
    if (!result) {
      return;
    }

    const blob = new Blob([result.translatedContent], {
      type: "application/xliff+xml;charset=utf-8"
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = result.fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-5xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                Structure-safe AI localization for XLIFF files
              </div>
              <h1 className="mt-8 max-w-3xl font-[var(--font-serif)] text-5xl leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-6xl">
                Translayr turns raw XLIFF into reliable translated output without
                breaking tags.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
                This MVP is intentionally narrow: upload one XLIFF file, protect inline
                XML and placeholders, translate safely with AI, validate the result, and
                download the rebuilt file immediately.
              </p>
            </div>

            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] lg:max-w-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                New UI Available
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Multi-project workspace
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                The new SaaS dashboard with Projects overview, project detail pages,
                uploads, progress tracking, and file tables is now live.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/projects"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-5 text-sm font-medium text-white transition hover:bg-black"
                >
                  Open Projects Workspace
                </Link>
                <Link
                  href="/projects/wpml-platform-refresh"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  View Example Project
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                  Phase 1 MVP
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  Single-file translation flow
                </h2>
              </div>
              <div className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                In memory only
              </div>
            </div>

            <div className="mt-8">
              <UploadDropzone
                file={file}
                onFileSelect={(nextFile) => {
                  setFile(nextFile);
                  setError(null);
                  setErrorCode(null);
                  setWarnings([]);
                  setResult(null);
                }}
                disabled={isLoading}
              />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <LanguageSelector
                id="target-language"
                label="Target language"
                value={targetLanguage}
                options={LANGUAGE_OPTIONS.filter((option) => option.code !== sourceLanguageFallback)}
                onChange={setTargetLanguage}
                placeholder="Choose target language"
                disabled={isLoading}
                hint="This is the language used for the rebuilt target nodes."
              />

              {showSourceLanguageFallback ? (
                <LanguageSelector
                  id="source-language"
                  label="Source language fallback"
                  value={sourceLanguageFallback}
                  options={LANGUAGE_OPTIONS.filter((option) => option.code !== targetLanguage)}
                  onChange={setSourceLanguageFallback}
                  placeholder="Choose source language"
                  disabled={isLoading}
                  hint="Shown because the uploaded file did not expose reliable source-language metadata."
                />
              ) : (
                <div className="rounded-[28px] border border-[var(--border)] bg-white/55 p-4 text-sm leading-6 text-[var(--muted)]">
                  <p className="font-medium text-[var(--foreground)]">Source language</p>
                  <p className="mt-2">
                    Read automatically from the XLIFF file when available. A manual
                    fallback field only appears if the file metadata is missing.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleTranslate}
                disabled={!canTranslate}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[color:rgba(31,26,20,0.35)]"
              >
                {isLoading ? "Translating..." : "Translate file"}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!result}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:text-[var(--muted)]"
              >
                Download translated XLIFF
              </button>
            </div>
          </section>

          <TranslationStatus
            isLoading={isLoading}
            error={error}
            errorCode={errorCode}
            result={result}
            warnings={warnings}
          />
        </div>
      </div>
    </main>
  );
}
