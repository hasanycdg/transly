"use client";

import { useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import type { NewGlossaryCollectionInput } from "@/types/glossary";

type NewCollectionModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewGlossaryCollectionInput) => Promise<void> | void;
  submitting?: boolean;
  errorMessage?: string | null;
};

export function NewCollectionModal({
  open,
  onClose,
  onCreate,
  submitting = false,
  errorMessage = null
}: NewCollectionModalProps) {
  const locale = useAppLocale();
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Neue Sammlung",
          heading: "Glossarsammlung erstellen",
          intro: "Sammlungen sind optionale Gruppen für marken-, feature- oder projektspezifische Terminologie.",
          close: "Schließen",
          collectionName: "Sammlungsname",
          description: "Beschreibung",
          cancel: "Abbrechen",
          creating: "Wird erstellt...",
          createCollection: "Sammlung erstellen"
        }
      : {
          eyebrow: "/ New Collection",
          heading: "Create glossary collection",
          intro: "Collections are optional groups for brand-, feature-, or project-specific terminology.",
          close: "Close",
          collectionName: "Collection name",
          description: "Description",
          cancel: "Cancel",
          creating: "Creating...",
          createCollection: "Create Collection"
        };

  if (!open) {
    return null;
  }

  async function handleCreate() {
    const trimmedName = name.trim();

    if (!trimmedName || submitting) {
      return;
    }

    await onCreate({
      name: trimmedName,
      detail: detail.trim() || null
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,16,0.16)] px-4 py-10">
      <div className="w-full max-w-[560px] rounded-[10px] border border-[var(--border)] bg-white p-6">
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

        {errorMessage ? (
          <div className="mt-4 rounded-[8px] border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-[12px] text-[var(--error)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">{copy.collectionName}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Checkout terminology"
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">{copy.description}</span>
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              rows={4}
              placeholder="Optional context about where this terminology set should be used."
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            />
          </label>
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
            disabled={!name.trim() || submitting}
            className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? copy.creating : copy.createCollection}
          </button>
        </div>
      </div>
    </div>
  );
}
