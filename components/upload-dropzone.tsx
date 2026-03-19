"use client";

import { useRef, useState } from "react";

type UploadDropzoneProps = {
  file: File | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
};

export function UploadDropzone({
  file,
  disabled = false,
  onFileSelect
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileList(fileList: FileList | null) {
    const nextFile = fileList?.[0] ?? null;
    onFileSelect(nextFile);
    setIsDragging(false);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (disabled) {
            return;
          }

          handleFileList(event.dataTransfer.files);
        }}
        className={[
          "group relative flex min-h-52 w-full flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-8 text-center transition",
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border-strong)] bg-white/55 hover:border-[var(--accent)] hover:bg-white/70",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xliff,.xlf,application/xliff+xml,text/xml,application/xml"
          className="hidden"
          disabled={disabled}
          onChange={(event) => handleFileList(event.target.files)}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background-strong)] text-lg">
          XML
        </div>
        <p className="mt-5 text-lg font-medium text-[var(--foreground)]">
          Drop an XLIFF file here
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Upload a single `.xliff` or `.xlf` file. Translayr keeps inline tags and
          placeholders protected throughout the translation pipeline.
        </p>
        <span className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)]">
          Choose file
        </span>
      </button>

      <div className="rounded-2xl border border-[var(--border)] bg-white/65 px-4 py-3 text-sm text-[var(--muted)]">
        {file ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[var(--foreground)]">{file.name}</p>
              <p>{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-[var(--danger)]"
              onClick={() => onFileSelect(null)}
            >
              Remove
            </button>
          </div>
        ) : (
          <p>No file selected yet.</p>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
