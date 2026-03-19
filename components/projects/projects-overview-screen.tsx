"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatPercent, formatProjectDate } from "@/lib/projects/formatters";
import { createProjectRecord, getProjectSummary, getSeedProjects, matchesProjectFilter, mergeProjects, PROJECT_FILTERS } from "@/lib/projects/mock-data";
import { loadStoredProjects, saveStoredProjects } from "@/lib/projects/storage";
import type { NewProjectInput, ProjectFilter, ProjectRecord } from "@/types/projects";

import { NewProjectModal } from "@/components/projects/new-project-modal";
import { ProgressBar } from "@/components/projects/progress-bar";
import { ProjectUploadZone } from "@/components/projects/project-upload-zone";
import { StatusBadge } from "@/components/projects/status-badge";

export function ProjectsOverviewScreen() {
  const [projects, setProjects] = useState<ProjectRecord[]>(() =>
    mergeProjects(getSeedProjects(), loadStoredProjects())
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [showModal, setShowModal] = useState(false);
  const [overviewFiles, setOverviewFiles] = useState<File[]>([]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter = matchesProjectFilter(project, filter);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${project.name} ${project.description}`.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, projects, search]);

  function handleCreateProject(input: NewProjectInput) {
    const newProject = createProjectRecord(input);
    const storedProjects = [
      ...loadStoredProjects().filter((project) => project.id !== newProject.id),
      newProject
    ];

    saveStoredProjects(storedProjects);
    setProjects(mergeProjects(getSeedProjects(), storedProjects));
  }

  return (
    <>
      <div className="min-h-screen">
        <section className="border-b border-[var(--border)] bg-white px-10 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[rgba(20,20,20,0.44)]">
                / Projects
              </p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                All Projects
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[14px] bg-[var(--foreground)] px-7 text-[15px] font-medium text-white transition hover:bg-black"
            >
              <PlusIcon />
              New Project
            </button>
          </div>
        </section>

        <div className="px-10 py-10">
          <div className="max-w-[1124px] space-y-10">
            <section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-white">
              <div className="grid divide-y divide-[var(--border)] md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
                <StatsCell
                  value="4"
                  label="Active projects"
                  meta="↑ 2 this month"
                  metaTone="positive"
                />
                <StatsCell
                  value="18"
                  label="Files in progress"
                  meta="Across all languages"
                />
                <StatsCell
                  value="78%"
                  label="Avg. completion"
                  meta="↑ 12% this week"
                  metaTone="positive"
                />
                <StatsCell
                  value="6"
                  label="Languages active"
                  meta="DE, FR, NL, ES +2"
                />
              </div>
            </section>

            <ProjectUploadZone
              inputId="projects-overview-upload"
              files={overviewFiles}
              onFilesSelected={setOverviewFiles}
              variant="strip"
            />

            <section>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[rgba(20,20,20,0.44)]">
                  / Recent Projects
                </p>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <label className="relative block w-full md:w-[320px]">
                    <span className="sr-only">Search projects</span>
                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(20,20,20,0.42)]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search..."
                      className="h-12 w-full rounded-[16px] border border-[var(--border)] bg-white pl-12 pr-4 text-[15px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                    />
                  </label>

                  <div className="inline-flex overflow-hidden rounded-[16px] border border-[var(--border)] bg-white">
                    {PROJECT_FILTERS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFilter(item)}
                        className={[
                          "min-w-[84px] border-r border-[var(--border)] px-5 py-3 text-[15px] transition last:border-r-0",
                          item === filter
                            ? "bg-[var(--background)] font-medium text-[var(--foreground)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <section className="mt-4 overflow-hidden rounded-[24px] border border-[var(--border)] bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[rgba(245,245,242,0.56)] text-left">
                        <th className="px-8 py-5 text-[12px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.46)]">
                          Project
                        </th>
                        <th className="px-4 py-5 text-[12px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.46)]">
                          Languages
                        </th>
                        <th className="px-4 py-5 text-[12px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.46)]">
                          Files
                        </th>
                        <th className="px-4 py-5 text-[12px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.46)]">
                          Progress
                        </th>
                        <th className="px-4 py-5 text-[12px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.46)]">
                          Updated
                        </th>
                        <th className="px-8 py-5 text-right text-[12px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.46)]">
                          Open
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => {
                        const display = getReferenceDisplay(project);

                        return (
                          <tr
                            key={project.id}
                            className="border-b border-[var(--border)] last:border-b-0"
                          >
                            <td className="px-8 py-8 align-middle">
                              <div className="max-w-[360px]">
                                <p className="text-[18px] font-medium tracking-[-0.03em] text-[var(--foreground)]">
                                  {project.name}
                                </p>
                                <p className="mt-2 truncate text-[15px] text-[var(--muted)]">
                                  {display.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-8 align-middle">
                              <div className="flex flex-col items-start gap-2">
                                {display.languages.map((language) => (
                                  <LanguageChip key={`${project.id}-${language}`} code={language} />
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-8 align-middle">
                              <span className="text-[18px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                                {display.fileCount}
                              </span>
                            </td>
                            <td className="px-4 py-8 align-middle">
                              <div className="min-w-[220px]">
                                <div className="flex items-center justify-between gap-4">
                                  <StatusBadge status={display.status} />
                                  <span className="text-[15px] font-medium text-[var(--foreground)]">
                                    {formatPercent(display.progress)}
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <ProgressBar
                                    value={display.progress}
                                    size="sm"
                                    tone={getProjectProgressTone(display.status)}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-8 align-middle text-[15px] text-[rgba(20,20,20,0.58)]">
                              {formatProjectDate(display.updated)}
                            </td>
                            <td className="px-8 py-8 text-right align-middle">
                              <Link
                                href={`/projects/${project.id}`}
                                className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-white px-5 text-[15px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
                              >
                                Open <span className="ml-1">→</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="px-8 py-16 text-center">
                    <p className="text-lg font-medium text-[var(--foreground)]">
                      No projects found
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Adjust the search or filter state.
                    </p>
                  </div>
                ) : null}
              </section>
            </section>
          </div>
        </div>
      </div>

      {showModal ? (
        <NewProjectModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateProject}
        />
      ) : null}
    </>
  );
}

function StatsCell({
  label,
  meta,
  metaTone = "default",
  value
}: {
  label: string;
  meta: string;
  metaTone?: "default" | "positive";
  value: string;
}) {
  return (
    <div className="px-8 py-8">
      <p className="text-[44px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-1 text-[15px] text-[rgba(20,20,20,0.52)]">{label}</p>
      <p
        className={[
          "mt-4 text-[14px]",
          metaTone === "positive" ? "text-[rgb(35,122,79)]" : "text-[var(--muted)]"
        ].join(" ")}
      >
        {meta}
      </p>
    </div>
  );
}

function LanguageChip({ code }: { code: string }) {
  return (
    <span className="inline-flex h-9 min-w-[48px] items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-[14px] font-medium tracking-[0.04em] text-[rgba(20,20,20,0.72)]">
      {code.toUpperCase()}
    </span>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m16 16 4.25 4.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function getProjectProgressTone(status: ProjectRecord["status"]) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "In Review":
      return "review" as const;
    case "Error":
      return "danger" as const;
    case "Completed":
    default:
      return "neutral" as const;
  }
}

function getReferenceDisplay(project: ProjectRecord) {
  if (project.id === "wpml-platform-refresh") {
    return {
      description: "Core website strings, checkout flows, product ...",
      languages: ["de", "fr", "nl"],
      fileCount: 6,
      progress: 68,
      status: "Active" as const,
      updated: "2026-03-18T10:00:00.000Z"
    };
  }

  if (project.id === "developer-docs-sync") {
    return {
      description: "API docs, onboarding guides, changelog sni...",
      languages: ["de", "es"],
      fileCount: 3,
      progress: 100,
      status: "In Review" as const,
      updated: "2026-03-17T10:00:00.000Z"
    };
  }

  if (project.id === "help-center-migration") {
    return {
      description: "Support articles across EU ma...",
      languages: ["fr", "it"],
      fileCount: 11,
      progress: 80,
      status: "Active" as const,
      updated: "2026-03-16T10:00:00.000Z"
    };
  }

  if (project.id === "shopify-launch-kit") {
    return {
      description: "Storefront, emails, product descrip...",
      languages: ["de", "nl"],
      fileCount: 7,
      progress: 34,
      status: "In Review" as const,
      updated: "2026-03-14T10:00:00.000Z"
    };
  }

  const summary = getProjectSummary(project);

  return {
    description: project.description,
    languages: project.targetLanguages,
    fileCount: summary.totalFiles,
    progress: summary.overallProgress,
    status: project.status,
    updated: project.lastUpdated
  };
}
