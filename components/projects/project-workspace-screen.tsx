"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
      <section className="rounded-[22px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
        <p className="text-sm text-[var(--muted)]">Projects</p>
        <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          Project not found
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
          This workspace is not available in the current mock dataset or local browser storage.
        </p>
        <Link
          href="/projects"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(20,20,20,0.18)]"
        >
          Back to Projects
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <Link href="/projects" className="transition hover:text-[var(--foreground)]">
                Projects
              </Link>
              <span>/</span>
              <span className="text-[var(--foreground)]">{project.name}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              {project.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
              <InfoChip label={`Source: ${getLanguageLabel(project.sourceLanguage)}`} />
              <InfoChip label={`Targets: ${project.targetLanguages.map(getLanguageLabel).join(", ")}`} />
              <InfoChip label={`Updated ${formatProjectDate(project.lastUpdated)}`} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById(uploadInputId) as HTMLInputElement | null;
                input?.click();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(20,20,20,0.18)]"
            >
              Upload Files
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--foreground)] px-5 text-sm font-medium text-white transition hover:bg-black"
            >
              Start Translation
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(20,20,20,0.18)]"
            >
              Export All
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Project Summary
          </h2>
          <div className="text-sm text-[var(--muted)]">
            Overall progress <span className="ml-2 font-medium text-[var(--foreground)]">{formatPercent(summary.overallProgress)}</span>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={summary.overallProgress} size="md" tone={summary.failedFiles > 0 ? "danger" : "neutral"} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <SummaryTile label="Total files" value={String(summary.totalFiles)} />
          <SummaryTile label="Completed" value={String(summary.completedFiles)} />
          <SummaryTile label="In review" value={String(summary.reviewFiles)} />
          <SummaryTile label="Failed" value={String(summary.failedFiles)} />
          <SummaryTile label="Total words" value={formatCompactNumber(summary.totalWords)} />
          <SummaryTile label="Quality" value={project.qualityScore > 0 ? `${project.qualityScore}%` : "Pending"} />
        </div>
      </section>

      <ProjectUploadZone
        inputId={uploadInputId}
        files={selectedFiles}
        onFilesSelected={setSelectedFiles}
      />

      <ProjectFilesTable files={project.files} />

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Workspace Stats
          </h3>
          <div className="mt-5 space-y-3">
            <StatRow label="Glossary enabled" value={project.glossaryEnabled ? "Yes" : "No"} />
            <StatRow label="Credits used" value={formatCompactNumber(project.creditsUsed)} />
            <StatRow label="Quality score average" value={project.qualityScore > 0 ? `${project.qualityScore}/100` : "Pending"} />
            <StatRow
              label="Latest export"
              value={
                project.latestExport
                  ? `${project.latestExport.label} · ${project.latestExport.format}`
                  : "No export yet"
              }
            />
          </div>
        </div>

        <div className="rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Recent Activity
          </h3>
          <div className="mt-5 space-y-4">
            {project.recentActivity.map((activity) => (
              <div key={activity.id} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                <p className="font-medium text-[var(--foreground)]">{activity.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{activity.detail}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {formatProjectDate(activity.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoChip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-[rgba(20,20,20,0.04)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]">
      {label}
    </span>
  );
}

function SummaryTile({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] bg-[rgba(247,247,245,0.9)] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
        {value}
      </p>
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
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
