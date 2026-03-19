import type { ReactNode } from "react";

import { formatCompactNumber, formatPercent, formatProjectDate, getLanguageLabel } from "@/lib/projects/formatters";
import type { ProjectFileRecord } from "@/types/projects";

import { ProgressBar } from "@/components/projects/progress-bar";
import { StatusBadge } from "@/components/projects/status-badge";

type ProjectFilesTableProps = {
  files: ProjectFileRecord[];
  title?: string;
};

export function ProjectFilesTable({
  files,
  title = "Recent Translations"
}: ProjectFilesTableProps) {
  return (
    <section className="rounded-[22px] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] md:p-5">
      <div>
        <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          {title}
        </h3>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--muted)]">
              <th className="pb-3 font-medium">Filename</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Progress</th>
              <th className="pb-3 font-medium">Language</th>
              <th className="pb-3 font-medium">Last Updated</th>
              <th className="pb-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-b border-[var(--border)] last:border-b-0">
                <td className="py-4 pr-6 align-middle">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{file.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {formatCompactNumber(file.words)} words
                    </p>
                  </div>
                </td>
                <td className="py-4 pr-6 align-middle">
                  <StatusBadge status={file.status} />
                </td>
                <td className="py-4 pr-6 align-middle">
                  <div className="min-w-36">
                    <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
                      <span>{formatPercent(file.progress)}</span>
                    </div>
                    <ProgressBar
                      value={file.progress}
                      size="sm"
                      tone={file.status === "Error" ? "danger" : "neutral"}
                    />
                  </div>
                </td>
                <td className="py-4 pr-6 align-middle text-sm text-[var(--foreground)]">
                  {getLanguageLabel(file.sourceLanguage)} to {getLanguageLabel(file.targetLanguage)}
                </td>
                <td className="py-4 pr-6 align-middle text-sm text-[var(--muted)]">
                  {formatProjectDate(file.lastUpdated)}
                </td>
                <td className="py-4 align-middle">
                  <div className="flex items-center justify-end gap-3">
                    <ActionIcon label="Review" disabled={file.status !== "Review"}>
                      <ReviewIcon />
                    </ActionIcon>
                    <ActionIcon label="Download" disabled={file.status !== "Done"}>
                      <DownloadIcon />
                    </ActionIcon>
                    <ActionIcon label="Retry" disabled={file.status !== "Error"}>
                      <RetryIcon />
                    </ActionIcon>
                    <ActionIcon label="Delete">
                      <DeleteIcon />
                    </ActionIcon>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActionIcon({
  children,
  disabled = false,
  label
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)] transition hover:bg-[rgba(20,20,20,0.05)] disabled:cursor-not-allowed disabled:text-[rgba(20,20,20,0.28)]"
    >
      {children}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4.75v10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m8.5 11.75 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 18.75h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.75 6.75A2 2 0 0 1 6.75 4.75h10.5a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H10l-4.25 4v-4h-1a1 1 0 0 1-1-1v-7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.25 8.5V4.75H15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.8 13a7 7 0 1 1-2.1-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5.75 7.25h12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.25 7.25V5.5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v1.75" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m7.25 7.25.65 10.42a1 1 0 0 0 1 .93h6.2a1 1 0 0 0 1-.93l.65-10.42" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
