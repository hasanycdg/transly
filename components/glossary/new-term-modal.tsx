"use client";

import { useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { translateGlossaryStatus } from "@/lib/i18n";
import { getLanguageOptions } from "@/lib/languages";
import type {
  GlossaryCollectionItem,
  GlossaryProjectOption,
  GlossaryStatus,
  GlossaryTermItem,
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
  mode?: "create" | "edit";
  initialTerm?: GlossaryTermItem | null;
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
  errorMessage = null,
  mode = "create",
  initialTerm = null
}: NewTermModalProps) {
  const locale = useAppLocale();
  const [source, setSource] = useState(initialTerm?.source ?? "");
  const [sourceLanguage, setSourceLanguage] = useState(initialTerm?.sourceLanguage ?? "en");
  const [status, setStatus] = useState<GlossaryStatus>(initialTerm?.status ?? "Draft");
  const [collectionId, setCollectionId] = useState(initialTerm?.collectionId ?? "");
  const [projectSlug, setProjectSlug] = useState(initialTerm?.projectSlugs[0] ?? "");
  const [isProtected, setIsProtected] = useState(initialTerm?.isProtected ?? false);
  const [translations, setTranslations] = useState<TranslationDraft[]>(
    initialTerm && initialTerm.translations.length > 0
      ? initialTerm.translations.map((translation) => ({
          locale: translation.locale,
          term: translation.term
        }))
      : [{ locale: "de", term: "" }]
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const languageOptions = getLanguageOptions(locale);
  const copy =
    locale === "de"
      ? {
          rowError: "Jede Übersetzungszeile braucht sowohl eine Sprache als auch einen Begriff.",
          eyebrow: mode === "edit" ? "/ Begriff bearbeiten" : "/ Neuer Begriff",
          heading: mode === "edit" ? "Glossarbegriff bearbeiten" : "Glossarbegriff hinzufügen",
          intro:
            mode === "edit"
              ? "Aktualisiere Übersetzungen, Status, Geltungsbereich und Schutz-Einstellungen."
              : "Speichere freigegebene Terminologie, geschützte Formulierungen und projektspezifische Sprachpaare.",
          close: "Schließen",
          sourceTerm: "Quellbegriff",
          sourceLanguage: "Quellsprache",
          status: "Status",
          collection: "Sammlung",
          sharedGlossary: "Geteiltes Glossar",
          projectScope: "Projektumfang",
          allProjects: "Alle Projekte",
          protectPhrase: "Begriff schützen",
          protectPhraseDesc: "Markiere Begriffe, die gesperrt bleiben oder nie übersetzt werden sollen.",
          translations: "Übersetzungen",
          translationsDesc: "Lass Zeilen leer, wenn du zuerst nur einen Quell-Entwurf anlegen willst.",
          addTranslation: "Übersetzung hinzufügen",
          removeTranslation: "Übersetzung entfernen",
          cancel: "Abbrechen",
          saving: "Wird gespeichert...",
          saveChanges: "Änderungen speichern",
          saveTerm: "Begriff speichern"
        }
      : {
          rowError: "Each translation row needs both a locale and a term.",
          eyebrow: mode === "edit" ? "/ Edit Term" : "/ New Term",
          heading: mode === "edit" ? "Edit glossary term" : "Add glossary term",
          intro:
            mode === "edit"
              ? "Update translations, status, scope, and protection settings."
              : "Save approved terminology, protected phrases, and project-specific language pairs.",
          close: "Close",
          sourceTerm: "Source term",
          sourceLanguage: "Source language",
          status: "Status",
          collection: "Collection",
          sharedGlossary: "Shared glossary",
          projectScope: "Project scope",
          allProjects: "All projects",
          protectPhrase: "Protect phrase",
          protectPhraseDesc: "Mark terms that should stay locked or never be translated.",
          translations: "Translations",
          translationsDesc: "Leave rows empty if you want to create a source-only draft first.",
          addTranslation: "Add Translation",
          removeTranslation: "Remove translation",
          cancel: "Cancel",
          saving: "Saving...",
          saveChanges: "Save Changes",
          saveTerm: "Save Term"
        };

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
      setLocalError(copy.rowError);
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
              {copy.eyebrow}
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
              {copy.heading}
            </h2>
            <p className="mt-1 text-[12px] text-[var(--muted-soft)]">
              {copy.intro}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-[7px] border border-[var(--border)] px-2 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          >
            {copy.close}
          </button>
        </div>

        {errorMessage || localError ? (
          <div className="mt-4 rounded-[8px] border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-[12px] text-[var(--error)]">
            {localError ?? errorMessage}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-[12px] font-medium text-[var(--foreground)]">{copy.sourceTerm}</span>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Checkout"
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">{copy.sourceLanguage}</span>
            <select
              value={sourceLanguage}
              onChange={(event) => setSourceLanguage(event.target.value)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">{copy.status}</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as GlossaryStatus)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {translateGlossaryStatus(option, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">{copy.collection}</span>
            <select
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              <option value="">{copy.sharedGlossary}</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">{copy.projectScope}</span>
            <select
              value={projectSlug}
              onChange={(event) => setProjectSlug(event.target.value)}
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            >
              <option value="">{copy.allProjects}</option>
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
              <p className="text-[12px] font-medium text-[var(--foreground)]">{copy.protectPhrase}</p>
              <p className="text-[11.5px] text-[var(--muted-soft)]">
                {copy.protectPhraseDesc}
              </p>
            </div>
          </label>
        </div>

        <div className="mt-5 rounded-[10px] border border-[var(--border)] bg-[var(--background)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-[var(--foreground)]">{copy.translations}</p>
              <p className="text-[11.5px] text-[var(--muted-soft)]">
                {copy.translationsDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTranslations((current) => [...current, { locale: "de", term: "" }])}
              className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              {copy.addTranslation}
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
                  {languageOptions.map((option) => (
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
                  aria-label={copy.removeTranslation}
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
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!source.trim() || submitting}
            className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? copy.saving : mode === "edit" ? copy.saveChanges : copy.saveTerm}
          </button>
        </div>
      </div>
    </div>
  );
}
