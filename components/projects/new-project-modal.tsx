"use client";

import { useState } from "react";

import { LANGUAGE_OPTIONS } from "@/lib/languages";
import type { NewProjectInput } from "@/types/projects";

type NewProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewProjectInput) => Promise<void> | void;
  submitting?: boolean;
  errorMessage?: string | null;
};

export function NewProjectModal({
  open,
  onClose,
  onCreate,
  submitting = false,
  errorMessage = null
}: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["de"]);

  if (!open) {
    return null;
  }

  function toggleTargetLanguage(code: string) {
    setTargetLanguages((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    );
  }

  async function handleCreate() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || targetLanguages.length === 0 || submitting) {
      return;
    }

    await onCreate({
      name: trimmedName,
      description:
        trimmedDescription || "New localization workspace ready for file uploads and review.",
      sourceLanguage,
      targetLanguages
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,16,0.16)] px-4 py-10">
      <div className="w-full max-w-[640px] rounded-[10px] border border-[var(--border)] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / New Project
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
              Create translation workspace
            </h2>
            <p className="mt-1 text-[12px] text-[var(--muted-soft)]">
              Pick source and target languages, then start uploading localization files.
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

        {errorMessage ? (
          <div className="mt-4 rounded-[8px] border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-[12px] text-[var(--error)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Project name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="WPML Agency Rollout"
              className="w-full rounded-[7px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Localized product pages, legal strings, and user flows for launch markets."
              rows={3}
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

          <div className="space-y-1">
            <span className="text-[12px] font-medium text-[var(--foreground)]">Target languages</span>
            <div className="flex flex-wrap gap-[6px] rounded-[7px] border border-[var(--border)] bg-[var(--background)] p-2">
              {LANGUAGE_OPTIONS.filter((option) => option.code !== sourceLanguage).map((option) => {
                const selected = targetLanguages.includes(option.code);

                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => toggleTargetLanguage(option.code)}
                    className={[
                      "rounded-[5px] border px-2 py-[5px] text-[11.5px] font-medium transition",
                      selected
                        ? "border-[var(--foreground)] bg-white text-[var(--foreground)]"
                        : "border-[var(--border)] bg-white text-[var(--muted)]"
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
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
            disabled={!name.trim() || targetLanguages.length === 0 || submitting}
            className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
