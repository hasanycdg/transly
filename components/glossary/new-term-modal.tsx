"use client";

import { useState } from "react";

import { LANGUAGE_OPTIONS } from "@/lib/languages";
import type {
  GlossaryCollectionItem,
  GlossaryProjectOption,
  GlossaryStatus,
  NewGlossaryTermInput
} from "@/types/glossary";

type NewTermModalProps = {
  open: boolean;
  collections: GlossaryCollectionItem[];
  projects: GlossaryProjectOption[];
  onClose: () => void;
  onCreate: (input: NewGlossaryTermInput) => Promise<void> | void;
  submitting?: boolean;
  errorMessage?: string | null;
};

type TranslationDraft = {
  locale: string;
  term: string;
};

const STATUS_OPTIONS: GlossaryStatus[] = ["Draft", "Review", "Approved", "Archived"];

export function NewTermModal({
  open,
  collections,
  projects,
  onClose,
  onCreate,
  submitting = false,
  errorMessage = null
}: NewTermModalProps) {
  const [source, setSource] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [status, setStatus] = useState<GlossaryStatus>("Draft");
  const [collectionId, setCollectionId] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [translations, setTranslations] = useState<TranslationDraft[]>([{ locale: "de", term: "" }]);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleCreate() {
    const trimmedSource = source.trim();

    if (!trimmedSource || submitting) {
      return;
    }

    const hasPartialTranslation = translations.some(
      (translation) =>
        (translation.locale.trim().length > 0 && translation.term.trim().length === 0) ||
        (translation.locale.trim().length === 0 && translation.term.trim().length > 0)
    );

    if (hasPartialTranslation) {
      setLocalError("Each translation row needs both a locale and a term.");
      return;
    }

    setLocalError(null);

    await onCreate({
      source: trimmedSource,
      sourceLanguage,
      status,
      collectionId: collectionId || null,
      projectSlug: projectSlug || null,
      isProtected,
      translations: translations
        .filter((translation) => translation.locale.trim() && translation.term.trim())
        .map((translation) => ({
          locale: translation.locale.trim().toLowerCase(),
          term: translation.term.trim()
        }))
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,16,0.16)] px-4 py-10">
      <div className="w-full max-w-[760px] rounded-[10px] border border-[var(--border)] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / New Term
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
              Add glossary term
            </h2>
            <p className="mt-1 text-[12px] text-[var(--muted-soft)]">
              Save approved terminology, protected phrases, and project-specific language pairs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-[7px] border border-[var(--border)] px-2 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          >
            Close
          </button>
        </div>

        {errorMessage || localError ? (
          <div className="mt-4 rounded-[8px] border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-[12px] text-[var(--error)]">
            {localError ?? errorMessage}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Source term</span>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Checkout"
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Source language</span>
            <select
              value={sourceLanguage}
              onChange={(event) => setSourceLanguage(event.target.value)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as GlossaryStatus)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Collection</span>
            <select
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              <option value="">Shared glossary</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Project scope</span>
            <select
              value={projectSlug}
              onChange={(event) => setProjectSlug(event.target.value)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.slug}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 md:col-span-2">
            <input
              type="checkbox"
              checked={isProtected}
              onChange={(event) => setIsProtected(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <div>
              <p className="text-[12px] font-medium text-[var(--foreground)]">Protect phrase</p>
              <p className="text-[11.5px] text-[var(--muted-soft)]">
                Mark terms that should stay locked or never be translated.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-5 rounded-[10px] border border-[var(--border)] bg-[var(--background)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-[var(--foreground)]">Translations</p>
              <p className="text-[11.5px] text-[var(--muted-soft)]">
                Leave rows empty if you want to create a source-only draft first.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTranslations((current) => [...current, { locale: "de", term: "" }])}
              className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              Add Translation
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {translations.map((translation, index) => (
              <div key={`${index}-${translation.locale}`} className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_44px]">
                <select
                  value={translation.locale}
                  onChange={(event) =>
                    setTranslations((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, locale: event.target.value }
                          : item
                      )
                    )
                  }
                  className="w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={`${index}-${option.code}`} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  value={translation.term}
                  onChange={(event) =>
                    setTranslations((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, term: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Kasse"
                  className="w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setTranslations((current) =>
                      current.length === 1 ? [{ locale: "de", term: "" }] : current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  className="rounded-[7px] border border-[var(--border)] bg-white px-2 py-2 text-[12px] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                  aria-label="Remove translation"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-[6px]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12.5px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!source.trim() || submitting}
            className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Saving..." : "Save Term"}
          </button>
        </div>
      </div>
    </div>
  );
}
