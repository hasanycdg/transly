"use client";

import { useState } from "react";

type ProjectUploadZoneProps = {
  files: File[];
  inputId: string;
  onFilesSelected: (files: File[]) => void;
  variant?: "card" | "strip";
};

export function ProjectUploadZone({
  files,
  inputId,
  onFilesSelected,
  variant = "card"
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
    <section className="rounded-[24px] border border-[var(--border)] bg-white">
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
          "flex cursor-pointer flex-col gap-5 px-9 py-8 transition lg:flex-row lg:items-center lg:justify-between",
          isDragging ? "bg-[rgba(20,20,20,0.02)]" : ""
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

        <div className="flex items-center gap-7">
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[16px] border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)]">
            <UploadIcon />
          </div>
          <div>
            <p className="text-[18px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Drop files to upload
            </p>
            <p className="mt-1 text-[15px] text-[var(--muted)]">
              XLIFF, .po, or .strings - or click to browse
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[".XLIFF", ".PO", ".strings"].map((extension) => (
            <span
              key={extension}
              className="inline-flex h-10 items-center rounded-[12px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-[14px] font-medium text-[rgba(20,20,20,0.48)]"
            >
              {extension}
            </span>
          ))}
        </div>
      </label>

      {files.length > 0 ? (
        <div className="border-t border-[var(--border)] px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <span
                key={`${file.name}-${file.size}`}
                className="rounded-[12px] border border-[var(--border)] bg-[var(--background-strong)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
              >
                {file.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  ) : (
    <section className="rounded-[26px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] md:p-6">
      <div>
        <h3 className="text-[24px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          Upload translation files
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Support for .xliff, .po, .strings, and .resx with multi-file uploads.
        </p>
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
          "mt-5 flex min-h-[228px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed px-6 py-8 text-center transition",
          isDragging
            ? "border-[var(--border-strong)] bg-[rgba(20,20,20,0.03)]"
            : "border-[rgba(20,20,20,0.14)] bg-[var(--background)] hover:border-[var(--border-strong)]"
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
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--border)] bg-white text-[var(--foreground)]">
          <UploadIcon />
        </div>
        <p className="mt-5 text-[18px] font-medium text-[var(--foreground)]">
          Drop XLIFF, .po, or .strings files here
        </p>
        <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted)]">
          or click to browse from your computer
        </p>
        <span className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[14px] border border-[var(--border-strong)] bg-white px-5 text-sm font-medium text-[var(--foreground)]">
          Browse Files
        </span>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {files.length > 0 ? (
          files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              className="rounded-[12px] border border-[var(--border)] bg-[var(--background-strong)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
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

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.75 18.25h10.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M12 5.75v8.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m8.75 9.25 3.25-3.5 3.25 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
