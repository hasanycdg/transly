"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCompactNumber, formatPercent, formatProjectDate, getLanguageLabel } from "@/lib/projects/formatters";
import { getProjectById, getProjectSummary } from "@/lib/projects/mock-data";
import { loadStoredProjects } from "@/lib/projects/storage";

import { ProjectFilesTable } from "@/components/projects/project-files-table";
import { ProgressBar } from "@/components/projects/progress-bar";
import { ProjectSummaryCard } from "@/components/projects/project-summary-card";
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
      <section className="rounded-[32px] border border-[rgba(36,39,32,0.08)] bg-[rgba(255,255,255,0.86)] p-8 shadow-[0_20px_60px_rgba(21,25,19,0.05)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Projects</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
          Project not found
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
          This workspace is not available in the current mock dataset or local browser storage.
        </p>
        <Link
          href="/projects"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-white transition hover:bg-black"
        >
          Back to Projects
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(36,39,32,0.08)] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_20px_60px_rgba(21,25,19,0.05)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/projects" className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]">
                Projects
              </Link>
              <span className="text-[var(--muted)]">/</span>
              <span className="text-sm font-medium text-[var(--foreground)]">{project.name}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] md:text-5xl">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base">
              {project.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Chip label={`Source: ${getLanguageLabel(project.sourceLanguage)}`} />
              <Chip label={`Targets: ${project.targetLanguages.map(getLanguageLabel).join(", ")}`} />
              <Chip label={`Updated ${formatProjectDate(project.lastUpdated)}`} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById(uploadInputId) as HTMLInputElement | null;
                input?.click();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(36,39,32,0.12)] bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Upload Files
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-5 text-sm font-medium text-white transition hover:bg-black"
            >
              Start Translation
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(36,39,32,0.12)] bg-white px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Export All
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[rgba(36,39,32,0.08)] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_20px_60px_rgba(21,25,19,0.05)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Progress Summary</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Project delivery status
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--muted)]">Overall project progress</p>
            <p className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
              {formatPercent(summary.overallProgress)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ProgressBar value={summary.overallProgress} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <ProjectSummaryCard label="Total files" value={String(summary.totalFiles)} hint="Files currently in this workspace" />
          <ProjectSummaryCard label="Completed" value={String(summary.completedFiles)} hint="Ready for export" />
          <ProjectSummaryCard label="In review" value={String(summary.reviewFiles)} hint="Waiting for sign-off" />
          <ProjectSummaryCard label="Failed" value={String(summary.failedFiles)} hint="Require manual attention" />
          <ProjectSummaryCard label="Words" value={formatCompactNumber(summary.totalWords)} hint="Across all active files" />
          <ProjectSummaryCard label="Progress" value={formatPercent(summary.overallProgress)} hint="Weighted by file completion" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="space-y-6">
          <ProjectUploadZone
            inputId={uploadInputId}
            files={selectedFiles}
            onFilesSelected={setSelectedFiles}
          />
          <ProjectFilesTable files={project.files} />
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-[rgba(36,39,32,0.09)] bg-white p-6 shadow-[0_16px_48px_rgba(27,31,24,0.05)]">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Workspace stats
            </h3>
            <div className="mt-6 space-y-4">
              <StatRow label="Glossary enabled" value={project.glossaryEnabled ? "Yes" : "No"} />
              <StatRow label="Credits used" value={formatCompactNumber(project.creditsUsed)} />
              <StatRow label="Quality score" value={project.qualityScore > 0 ? `${project.qualityScore}/100` : "Pending"} />
              <StatRow
                label="Latest export"
                value={
                  project.latestExport
                    ? `${project.latestExport.label} · ${project.latestExport.format}`
                    : "No export yet"
                }
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-[rgba(36,39,32,0.09)] bg-white p-6 shadow-[0_16px_48px_rgba(27,31,24,0.05)]">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Recent activity
            </h3>
            <div className="mt-5 space-y-4">
              {project.recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-[22px] border border-[rgba(36,39,32,0.08)] bg-[rgba(247,247,244,0.72)] p-4">
                  <p className="font-medium text-[var(--foreground)]">{activity.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{activity.detail}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    {formatProjectDate(activity.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[rgba(36,39,32,0.08)] bg-[rgba(36,39,32,0.03)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
      {label}
    </span>
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
