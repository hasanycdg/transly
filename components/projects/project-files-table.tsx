import { formatCompactNumber, formatPercent, formatProjectDate } from "@/lib/projects/formatters";
import { getFileStatusTone } from "@/lib/projects/display";
import type { ProjectFileRecord } from "@/types/projects";

import { ProgressBar } from "@/components/projects/progress-bar";
import { StatusBadge } from "@/components/projects/status-badge";

type ProjectFilesTableProps = {
  files: ProjectFileRecord[];
  title?: string | null;
};

export function ProjectFilesTable({
  files,
  title = "Project Files"
}: ProjectFilesTableProps) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
      {title ? (
        <div className="border-b border-[var(--border-light)] px-[18px] py-3">
          <h3 className="text-[13px] font-medium text-[var(--foreground)]">{title}</h3>
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,2.1fr)_130px_110px_150px_95px_190px] border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]">
        {["Filename", "Language", "Status", "Progress", "Updated", "Actions"].map((label) => (
          <span
            key={label}
            className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]"
          >
            {label}
          </span>
        ))}
      </div>

      {files.length > 0 ? (
        files.map((file) => (
          <div
            key={file.id}
            className="grid grid-cols-[minmax(0,2.1fr)_130px_110px_150px_95px_190px] items-center border-b border-[var(--border-light)] px-[18px] py-[13px] last:border-b-0"
          >
            <div>
              <p className="text-[13px] font-medium text-[var(--foreground)]">{file.name}</p>
              <p className="text-[11.5px] text-[var(--muted-soft)]">
                {formatCompactNumber(file.words)} words
              </p>
            </div>

            <div className="text-[12px] text-[var(--muted)]">
              {file.sourceLanguage.toUpperCase()} → {file.targetLanguage.toUpperCase()}
            </div>

            <div>
              <StatusBadge status={file.status} />
            </div>

            <div className="flex flex-col gap-[5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-medium text-[var(--muted)]">
                  {formatPercent(file.progress)}
                </span>
              </div>
              <ProgressBar value={file.progress} size="sm" tone={getFileStatusTone(file.status)} />
            </div>

            <div className="text-[12px] text-[var(--muted-soft)]">
              {formatProjectDate(file.lastUpdated)}
            </div>

            <div className="flex flex-wrap gap-[6px]">
              <ActionButton label="Review" disabled={file.status !== "Review"} />
              <ActionButton label="Download" disabled={file.status !== "Done"} />
              <ActionButton label="Retry" disabled={file.status !== "Error"} />
              <ActionButton label="Delete" />
            </div>
          </div>
        ))
      ) : (
        <div className="px-6 py-10 text-center text-[12px] text-[var(--muted-soft)]">
          No files uploaded yet.
        </div>
      )}
    </section>
  );
}

function ActionButton({
  disabled = false,
  label
}: {
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="rounded-[6px] border border-[var(--border)] px-[9px] py-[5px] text-[11.5px] font-medium text-[var(--muted)] transition hover:border-[var(--muted)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:border-[var(--border-light)] disabled:text-[var(--muted-soft)]"
    >
      {label}
    </button>
  );
}
