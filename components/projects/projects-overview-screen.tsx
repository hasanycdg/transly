"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCompactNumber, formatPercent, formatProjectDate, getLanguageLabel } from "@/lib/projects/formatters";
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
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Projects
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Create and manage multi-file localization projects with review and export tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[rgba(20,20,20,0.18)] bg-[var(--foreground)] px-5 text-sm font-medium text-white transition hover:bg-black"
          >
            New Project
          </button>
        </section>

        <ProjectUploadZone
          inputId="projects-overview-upload"
          files={overviewFiles}
          onFilesSelected={setOverviewFiles}
        />

        <section className="rounded-[22px] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Recent Projects
            </h2>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="block w-full md:w-[300px]">
                <span className="sr-only">Search projects</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects"
                  className="w-full rounded-xl border border-[var(--border)] bg-[rgba(247,247,245,0.9)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(20,20,20,0.18)]"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {PROJECT_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={[
                      "rounded-full px-3 py-1.5 text-sm transition",
                      item === filter
                        ? "bg-[rgba(20,20,20,0.06)] font-medium text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    ].join(" ")}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-sm text-[var(--muted)]">
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Languages</th>
                  <th className="pb-3 font-medium">Files</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Last Updated</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const summary = getProjectSummary(project);

                  return (
                    <tr key={project.id} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="py-4 pr-6 align-middle">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{project.name}</p>
                          <p className="mt-1 max-w-[340px] text-sm text-[var(--muted)]">
                            {project.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 pr-6 align-middle text-sm text-[var(--foreground)]">
                        {getLanguageLabel(project.sourceLanguage)} to{" "}
                        {project.targetLanguages.map(getLanguageLabel).join(", ")}
                      </td>
                      <td className="py-4 pr-6 align-middle text-sm text-[var(--foreground)]">
                        {summary.totalFiles}
                      </td>
                      <td className="py-4 pr-6 align-middle">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="py-4 pr-6 align-middle">
                        <div className="min-w-32">
                          <div className="mb-2 text-xs text-[var(--muted)]">
                            {formatPercent(summary.overallProgress)}
                          </div>
                          <ProgressBar value={summary.overallProgress} size="sm" tone="neutral" />
                        </div>
                      </td>
                      <td className="py-4 pr-6 align-middle text-sm text-[var(--muted)]">
                        {formatProjectDate(project.lastUpdated)}
                      </td>
                      <td className="py-4 text-right align-middle">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(20,20,20,0.18)]"
                        >
                          Open Project
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-medium text-[var(--foreground)]">No projects found</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Adjust the filters or create a new project.
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
            <span>{filteredProjects.length} visible projects</span>
            <span>{formatCompactNumber(projects.reduce((sum, project) => sum + getProjectSummary(project).totalWords, 0))} total words</span>
          </div>
        </section>
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
