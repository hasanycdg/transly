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
    <section className="rounded-[22px] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] md:p-5">
      <div>
        <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          Upload Zone
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
          "mt-4 flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-6 py-8 text-center transition",
          isDragging
            ? "border-[rgba(20,20,20,0.22)] bg-[rgba(20,20,20,0.03)]"
            : "border-[rgba(20,20,20,0.14)] bg-[rgba(249,249,248,0.85)] hover:border-[rgba(20,20,20,0.2)]"
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
        <div className="flex h-14 w-14 items-center justify-center text-[var(--foreground)]">
          <UploadIcon />
        </div>
        <p className="mt-5 text-[18px] font-medium text-[var(--foreground)]">
          Drop XLIFF, .po, or .strings files here
        </p>
        <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted)]">
          or click to browse from your computer
        </p>
        <span className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-[rgba(20,20,20,0.22)] bg-white px-5 text-sm font-medium text-[var(--foreground)]">
          Browse Files
        </span>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {files.length > 0 ? (
          files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              className="rounded-full border border-[var(--border)] bg-[rgba(20,20,20,0.03)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
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
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.75 18.25h8.5a3.75 3.75 0 0 0 .46-7.47 5.25 5.25 0 0 0-10.25-1.2 3.75 3.75 0 0 0 1.29 7.67Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 8.75v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m8.75 11.75 3.25-3.25 3.25 3.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
