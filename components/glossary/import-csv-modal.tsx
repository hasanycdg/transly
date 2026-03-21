"use client";

import { useRef, useState } from "react";

type ImportCsvModalProps = {
  open: boolean;
  onClose: () => void;
  onImport: (csv: string) => Promise<void> | void;
  submitting?: boolean;
  errorMessage?: string | null;
};

const CSV_TEMPLATE = `source,source_language,status,collection,project,de,fr
Checkout,en,approved,Commerce,wpml-platform-refresh,Kasse,Paiement
Brand Kit,en,approved,Brand,,Brand Kit,Brand Kit`;

export function ImportCsvModal({
  open,
  onClose,
  onImport,
  submitting = false,
  errorMessage = null
}: ImportCsvModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    try {
      const nextCsv = await file.text();
      setCsv(nextCsv);
      setFileName(file.name);
      setLocalError(null);
    } catch {
      setLocalError("CSV file could not be read.");
    }
  }

  async function handleImport() {
    if (!csv.trim() || submitting) {
      return;
    }

    setLocalError(null);
    await onImport(csv);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,16,0.16)] px-4 py-10">
      <div className="w-full max-w-[760px] rounded-[10px] border border-[var(--border)] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / Import CSV
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
              Import glossary terms
            </h2>
            <p className="mt-1 text-[12px] text-[var(--muted-soft)]">
              Use `source` plus locale columns like `de`, `fr`, or `translation:de`.
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

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[12px] font-medium text-[var(--foreground)]">CSV content</p>
              <div className="flex items-center gap-[6px]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                >
                  Choose File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCsv(CSV_TEMPLATE);
                    setFileName("template.csv");
                    setLocalError(null);
                  }}
                  className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                >
                  Load Example
                </button>
              </div>
            </div>

            <textarea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              placeholder={CSV_TEMPLATE}
              rows={14}
              className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-3 py-3 font-mono text-[12px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
            />

            <div className="mt-2 text-[11.5px] text-[var(--muted-soft)]">
              {fileName ? `Loaded: ${fileName}` : "Paste CSV here or load it from a file."}
            </div>
          </div>

          <div className="rounded-[10px] border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-[12px] font-medium text-[var(--foreground)]">Supported columns</p>
            <div className="mt-3 space-y-2 text-[11.5px] text-[var(--muted)]">
              <p>`source` is required.</p>
              <p>`source_language`, `status`, `collection`, `project`, and `protected` are optional.</p>
              <p>Any locale header like `de`, `fr`, or `translation:de` becomes a translation column.</p>
              <p>Repeated rows for the same source term are merged during import.</p>
            </div>

            <div className="mt-4">
              <p className="text-[12px] font-medium text-[var(--foreground)]">Example</p>
              <pre className="mt-2 overflow-x-auto rounded-[8px] border border-[var(--border)] bg-white p-3 text-[11px] text-[var(--muted)]">
                {CSV_TEMPLATE}
              </pre>
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
            onClick={handleImport}
            disabled={!csv.trim() || submitting}
            className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Importing..." : "Import Terms"}
          </button>
        </div>
      </div>
    </div>
  );
}
