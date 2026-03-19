import { formatCompactNumber, formatPercent, formatProjectDate, getLanguageLabel } from "@/lib/projects/formatters";
import type { ProjectFileRecord } from "@/types/projects";

import { ProgressBar } from "@/components/projects/progress-bar";
import { StatusBadge } from "@/components/projects/status-badge";

type ProjectFilesTableProps = {
  files: ProjectFileRecord[];
};

export function ProjectFilesTable({ files }: ProjectFilesTableProps) {
  return (
    <section className="rounded-[28px] border border-[rgba(36,39,32,0.09)] bg-white p-6 shadow-[0_16px_48px_rgba(27,31,24,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Project files
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Track translation state, review readiness, and download or retry outputs at
            the file level.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              <th className="px-3 pb-2 font-medium">Filename</th>
              <th className="px-3 pb-2 font-medium">Source</th>
              <th className="px-3 pb-2 font-medium">Target</th>
              <th className="px-3 pb-2 font-medium">Status</th>
              <th className="px-3 pb-2 font-medium">Progress</th>
              <th className="px-3 pb-2 font-medium">Last Updated</th>
              <th className="px-3 pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="rounded-[20px] bg-[rgba(247,247,244,0.72)]">
                <td className="rounded-l-[18px] px-3 py-4">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{file.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {formatCompactNumber(file.words)} words
                    </p>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-[var(--foreground)]">
                  {getLanguageLabel(file.sourceLanguage)}
                </td>
                <td className="px-3 py-4 text-sm text-[var(--foreground)]">
                  {getLanguageLabel(file.targetLanguage)}
                </td>
                <td className="px-3 py-4">
                  <StatusBadge status={file.status} />
                </td>
                <td className="px-3 py-4">
                  <div className="min-w-40">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">Pipeline</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {formatPercent(file.progress)}
                      </span>
                    </div>
                    <ProgressBar
                      value={file.progress}
                      size="sm"
                      tone={file.status === "Error" ? "danger" : "accent"}
                    />
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-[var(--muted)]">
                  {formatProjectDate(file.lastUpdated)}
                </td>
                <td className="rounded-r-[18px] px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <ActionPill label="Review" disabled={file.status !== "Review"} />
                    <ActionPill label="Download" disabled={file.status !== "Done"} />
                    <ActionPill label="Retry" disabled={file.status !== "Error"} />
                    <ActionPill label="Delete" />
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

function ActionPill({
  label,
  disabled = false
}: {
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="inline-flex min-h-9 items-center justify-center rounded-full border border-[rgba(36,39,32,0.12)] px-3 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:border-[rgba(36,39,32,0.06)] disabled:text-[rgba(31,26,20,0.35)]"
    >
      {label}
    </button>
  );
}
