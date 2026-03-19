"use client";

import { useState } from "react";

type ProjectUploadZoneProps = {
  files: File[];
  inputId: string;
  onFilesSelected: (files: File[]) => void;
  variant?: "strip" | "workspace";
};

export function ProjectUploadZone({
  files,
  inputId,
  onFilesSelected,
  variant = "strip"
}: ProjectUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    onFilesSelected(Array.from(fileList));
    setIsDragging(false);
  }

  return variant === "strip" ? (
    <section className="rounded-[10px] border border-[var(--border)] bg-white">
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
          "flex cursor-pointer flex-col gap-4 px-[22px] py-[18px] transition lg:flex-row lg:items-center lg:justify-between",
          isDragging ? "bg-[var(--background-strong)]" : "hover:border-[var(--border-strong)]"
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

        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
            <UploadIcon />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--foreground)]">
              Drop files to upload
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--muted-soft)]">
              XLIFF, .po, or .strings - or click to browse
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap gap-[5px]">
          {[".XLIFF", ".PO", ".strings"].map((extension) => (
            <span
              key={extension}
              className="inline-flex items-center rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-2 py-[3px] text-[10.5px] font-medium tracking-[0.03em] text-[var(--muted-soft)]"
            >
              {extension}
            </span>
          ))}
        </div>
      </label>

      {files.length > 0 ? (
        <div className="border-t border-[var(--border-light)] px-[22px] py-3">
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <span
                key={`${file.name}-${file.size}`}
                className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-2 py-[3px] text-[10.5px] font-medium text-[var(--foreground)]"
              >
                {file.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  ) : (
    <section className="rounded-[10px] border border-[var(--border)] bg-white p-5">
      <div className="mb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
          / Upload
        </p>
        <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          Translation files
        </h3>
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
          "flex cursor-pointer flex-col gap-4 rounded-[8px] border border-dashed px-4 py-4 transition lg:flex-row lg:items-center lg:justify-between",
          isDragging
            ? "border-[var(--border-strong)] bg-[var(--background-strong)]"
            : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-strong)]"
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
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border)] bg-white text-[var(--muted)]">
            <UploadIcon />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--foreground)]">
              Upload translation files
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--muted-soft)]">
              .xliff, .po, .strings, .resx
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap gap-[5px]">
          {[".XLIFF", ".PO", ".strings", ".RESX"].map((extension) => (
            <span
              key={extension}
              className="inline-flex items-center rounded-[5px] border border-[var(--border)] bg-white px-2 py-[3px] text-[10.5px] font-medium tracking-[0.03em] text-[var(--muted-soft)]"
            >
              {extension}
            </span>
          ))}
        </div>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {files.length > 0 ? (
          files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-2 py-[3px] text-[10.5px] font-medium text-[var(--foreground)]"
            >
              {file.name}
            </span>
          ))
        ) : (
          <p className="text-[12px] text-[var(--muted-soft)]">No files selected yet.</p>
        )}
      </div>
    </section>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 11V3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M8 3 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m8 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11.5v1A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
