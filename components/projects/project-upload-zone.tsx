"use client";

import { useState } from "react";

type ProjectUploadZoneProps = {
  files: File[];
  inputId: string;
  onFilesSelected: (files: File[]) => void;
};

export function ProjectUploadZone({
  files,
  inputId,
  onFilesSelected
}: ProjectUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    onFilesSelected(Array.from(fileList));
    setIsDragging(false);
  }

  return (
    <section className="rounded-[28px] border border-[rgba(36,39,32,0.09)] bg-white p-6 shadow-[0_16px_48px_rgba(27,31,24,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Upload translation files
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Supports `.xliff`, `.po`, `.strings`, and `.resx`. Multiple file uploads are
            ready for project-based translation runs.
          </p>
        </div>
        <span className="rounded-full border border-[rgba(36,39,32,0.08)] bg-[rgba(36,39,32,0.03)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
          Multi-file ready
        </span>
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        className={[
          "mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-8 text-center transition",
          isDragging
            ? "border-[var(--accent)] bg-[rgba(29,92,77,0.08)]"
            : "border-[rgba(36,39,32,0.16)] bg-[rgba(248,248,245,0.8)] hover:border-[var(--accent)] hover:bg-[rgba(29,92,77,0.04)]"
        ].join(" ")}
      >
        <input
          id={inputId}
          type="file"
          accept=".xliff,.xlf,.po,.strings,.resx"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(36,39,32,0.1)] bg-white text-sm font-semibold text-[var(--foreground)]">
          Files
        </div>
        <p className="mt-5 text-lg font-medium text-[var(--foreground)]">
          Drop translation files here
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          Drag a full release bundle into the workspace or click to browse files from
          your machine.
        </p>
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        {files.length > 0 ? (
          files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              className="rounded-full border border-[rgba(36,39,32,0.08)] bg-[rgba(36,39,32,0.03)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
            >
              {file.name}
            </span>
          ))
        ) : (
          <p className="text-sm text-[var(--muted)]">No files selected yet.</p>
        )}
      </div>
    </section>
  );
}
