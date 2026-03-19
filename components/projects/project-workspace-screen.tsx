"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getProjectStatusTone } from "@/lib/projects/display";
import { formatCompactNumber, formatPercent, formatProjectDate, getLanguageLabel } from "@/lib/projects/formatters";
import { getProjectById, getProjectSummary } from "@/lib/projects/mock-data";
import { loadStoredProjects } from "@/lib/projects/storage";

import { ProgressBar } from "@/components/projects/progress-bar";
import { ProjectFilesTable } from "@/components/projects/project-files-table";
import { ProjectUploadZone } from "@/components/projects/project-upload-zone";
import { StatusBadge } from "@/components/projects/status-badge";

type ProjectWorkspaceScreenProps = {
  projectId: string;
};

export function ProjectWorkspaceScreen({ projectId }: ProjectWorkspaceScreenProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const uploadInputId = `project-upload-${projectId}`;
  const project = useMemo(
    () => getProjectById(projectId, loadStoredProjects()),
    [projectId]
  );
  const summary = useMemo(() => (project ? getProjectSummary(project) : null), [project]);

  if (!project || !summary) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
          <div className="flex flex-col gap-[1px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / Projects
            </span>
            <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
              Project not found
            </h1>
          </div>
        </header>

        <div className="px-7 py-6">
          <div className="rounded-[10px] border border-[var(--border)] bg-white p-6">
            <p className="text-[12px] text-[var(--muted)]">
              This workspace is not available in the current mock dataset or local browser storage.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-flex rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              <Link href="/projects" className="transition hover:text-[var(--muted)]">
                / Projects
              </Link>
              <span>/</span>
              <span>Workspace</span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            <p className="mt-1 truncate text-[12px] text-[var(--muted-soft)]">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-[6px]">
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById(uploadInputId) as HTMLInputElement | null;
                input?.click();
              }}
              className="rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12.5px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              Upload Files
            </button>
            <button
              type="button"
              className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85"
            >
              Start Translation
            </button>
            <button
              type="button"
              className="rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12.5px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              Export All
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
          <div className="grid grid-cols-2 bg-[var(--border)] md:grid-cols-3 xl:grid-cols-6">
            <SummaryCell label="Total files" value={String(summary.totalFiles)} />
            <SummaryCell label="Completed" value={String(summary.completedFiles)} />
            <SummaryCell label="In review" value={String(summary.reviewFiles)} />
            <SummaryCell label="Failed" value={String(summary.failedFiles)} />
            <SummaryCell label="Total words" value={formatCompactNumber(summary.totalWords)} />
            <SummaryCell label="Quality score" value={project.qualityScore > 0 ? `${project.qualityScore}` : "0"} />
          </div>

          <div className="border-t border-[var(--border-light)] px-[18px] py-4">
            <div className="mb-[6px] flex items-center justify-between gap-3">
              <span className="text-[12px] text-[var(--muted)]">Overall progress</span>
              <span className="text-[11.5px] font-medium text-[var(--muted)]">
                {formatPercent(summary.overallProgress)}
              </span>
            </div>
            <ProgressBar
              value={summary.overallProgress}
              size="sm"
              tone={getProjectStatusTone(project.status)}
            />
          </div>
        </section>

        <ProjectUploadZone
          inputId={uploadInputId}
          files={selectedFiles}
          onFilesSelected={setSelectedFiles}
          variant="workspace"
        />

        <section>
          <div className="mb-[10px] flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / Files
            </span>
            <div className="text-[12px] text-[var(--muted-soft)]">
              Source {getLanguageLabel(project.sourceLanguage)} · Targets{" "}
              {project.targetLanguages.map(getLanguageLabel).join(", ")}
            </div>
          </div>
          <ProjectFilesTable files={project.files} title={null} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[10px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-[18px] py-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                / Workspace Stats
              </span>
            </div>
            <div className="space-y-3 px-[18px] py-4">
              <StatRow label="Glossary enabled" value={project.glossaryEnabled ? "Yes" : "No"} />
              <StatRow label="Credits used" value={formatCompactNumber(project.creditsUsed)} />
              <StatRow
                label="Quality score average"
                value={project.qualityScore > 0 ? `${project.qualityScore}/100` : "Pending"}
              />
              <StatRow
                label="Latest export"
                value={
                  project.latestExport
                    ? `${project.latestExport.label} · ${project.latestExport.format}`
                    : "No export yet"
                }
              />
              <StatRow label="Last updated" value={formatProjectDate(project.lastUpdated)} />
            </div>
          </div>

          <div className="rounded-[10px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-[18px] py-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                / Recent Activity
              </span>
            </div>
            <div className="px-[18px] py-4">
              {project.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="border-b border-[var(--border-light)] py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <p className="text-[13px] font-medium text-[var(--foreground)]">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--muted)]">
                    {activity.detail}
                  </p>
                  <p className="mt-2 text-[11px] text-[var(--muted-soft)]">
                    {formatProjectDate(activity.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-r border-b border-[var(--border)] bg-white px-[18px] py-4 even:border-r-0 md:[&:nth-child(3)]:border-r-0 xl:border-b-0 xl:[&:nth-child(3)]:border-r xl:[&:nth-child(6)]:border-r-0">
      <p className="text-[22px] font-semibold leading-none tracking-[-1px] text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-[var(--muted-soft)]">{label}</p>
    </div>
  );
}

function StatRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12px]">
      <span className="text-[var(--muted-soft)]">{label}</span>
      <span className="text-right font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
