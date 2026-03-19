"use client";

import { useState } from "react";

import { LANGUAGE_OPTIONS } from "@/lib/languages";
import type { NewProjectInput } from "@/types/projects";

type NewProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewProjectInput) => void;
};

export function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
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

  function handleCreate() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || targetLanguages.length === 0) {
      return;
    }

    onCreate({
      name: trimmedName,
      description:
        trimmedDescription || "New localization workspace ready for file uploads and review.",
      sourceLanguage,
      targetLanguages
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,21,18,0.22)] px-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-[rgba(36,39,32,0.1)] bg-white p-8 shadow-[0_32px_80px_rgba(18,21,18,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              New Project
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Create a translation workspace
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Start a new project, pick your source language, and define the markets
              you want to localize before files enter the pipeline.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(36,39,32,0.1)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ×
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Project name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="WPML Agency Rollout"
              className="w-full rounded-2xl border border-[rgba(36,39,32,0.1)] bg-[rgba(247,247,244,0.8)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Localized product pages, legal strings, and user flows for launch markets."
              rows={4}
              className="w-full rounded-2xl border border-[rgba(36,39,32,0.1)] bg-[rgba(247,247,244,0.8)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Source language</span>
            <select
              value={sourceLanguage}
              onChange={(event) => setSourceLanguage(event.target.value)}
              className="w-full rounded-2xl border border-[rgba(36,39,32,0.1)] bg-[rgba(247,247,244,0.8)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Target languages</span>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-[rgba(36,39,32,0.1)] bg-[rgba(247,247,244,0.8)] p-3">
              {LANGUAGE_OPTIONS.filter((option) => option.code !== sourceLanguage).map((option) => {
                const selected = targetLanguages.includes(option.code);

                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => toggleTargetLanguage(option.code)}
                    className={[
                      "rounded-full border px-3 py-2 text-xs font-medium transition",
                      selected
                        ? "border-[var(--accent)] bg-[rgba(29,92,77,0.1)] text-[var(--accent)]"
                        : "border-[rgba(36,39,32,0.1)] bg-white text-[var(--foreground)]"
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(36,39,32,0.12)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || targetLanguages.length === 0}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[rgba(31,26,20,0.35)]"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
