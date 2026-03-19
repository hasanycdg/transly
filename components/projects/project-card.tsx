import Link from "next/link";

import { formatCompactNumber, formatLanguagePair, formatPercent, formatProjectDate } from "@/lib/projects/formatters";
import { getProjectSummary } from "@/lib/projects/mock-data";
import type { ProjectRecord } from "@/types/projects";

import { ProgressBar } from "@/components/projects/progress-bar";
import { StatusBadge } from "@/components/projects/status-badge";

type ProjectCardProps = {
  project: ProjectRecord;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const summary = getProjectSummary(project);

  return (
    <article className="rounded-[28px] border border-[rgba(36,39,32,0.09)] bg-white p-6 shadow-[0_16px_48px_rgba(27,31,24,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            {formatProjectDate(project.lastUpdated)}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {project.name}
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">
            {project.description}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(36,39,32,0.08)] bg-[rgba(36,39,32,0.03)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
          {formatLanguagePair(project.sourceLanguage, project.targetLanguages)}
        </span>
        <span className="rounded-full border border-[rgba(36,39,32,0.08)] bg-[rgba(36,39,32,0.03)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
          {summary.totalFiles} files
        </span>
        <span className="rounded-full border border-[rgba(36,39,32,0.08)] bg-[rgba(36,39,32,0.03)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
          {formatCompactNumber(summary.totalWords)} words
        </span>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Overall progress</span>
          <span className="font-medium text-[var(--foreground)]">
            {formatPercent(summary.overallProgress)}
          </span>
        </div>
        <ProgressBar value={summary.overallProgress} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="text-sm text-[var(--muted)]">
          <p>Last updated</p>
          <p className="mt-1 font-medium text-[var(--foreground)]">
            {formatProjectDate(project.lastUpdated)}
          </p>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(36,39,32,0.12)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Open Project
        </Link>
      </div>
    </article>
  );
}
