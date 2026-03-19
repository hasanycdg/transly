"use client";

import { useMemo, useState } from "react";

import { formatCompactNumber } from "@/lib/projects/formatters";
import { createProjectRecord, getProjectSummary, getSeedProjects, matchesProjectFilter, mergeProjects, PROJECT_FILTERS } from "@/lib/projects/mock-data";
import { loadStoredProjects, saveStoredProjects } from "@/lib/projects/storage";
import type { NewProjectInput, ProjectFilter, ProjectRecord } from "@/types/projects";

import { NewProjectModal } from "@/components/projects/new-project-modal";
import { ProjectCard } from "@/components/projects/project-card";

export function ProjectsOverviewScreen() {
  const [projects, setProjects] = useState<ProjectRecord[]>(() =>
    mergeProjects(getSeedProjects(), loadStoredProjects())
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [showModal, setShowModal] = useState(false);

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

  const overviewStats = useMemo(() => {
    const totalProjects = projects.length;
    const totalFiles = projects.reduce(
      (sum, project) => sum + getProjectSummary(project).totalFiles,
      0
    );
    const totalWords = projects.reduce(
      (sum, project) => sum + getProjectSummary(project).totalWords,
      0
    );
    const activeProjects = projects.filter((project) => project.status === "Active").length;

    return {
      totalProjects,
      totalFiles,
      totalWords,
      activeProjects
    };
  }, [projects]);

  function handleCreateProject(input: NewProjectInput) {
    const newProject = createProjectRecord(input);
    const storedProjects = [...loadStoredProjects().filter((project) => project.id !== newProject.id), newProject];

    saveStoredProjects(storedProjects);
    setProjects(mergeProjects(getSeedProjects(), storedProjects));
  }

  return (
    <>
      <section className="rounded-[32px] border border-[rgba(36,39,32,0.08)] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_20px_60px_rgba(21,25,19,0.05)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] md:text-5xl">
              Projects
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
              Organize translation work by release, customer, or product surface. Track
              every file, review state, and export milestone from a single premium workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-white transition hover:bg-black"
          >
            New Project
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <OverviewStat label="Total projects" value={String(overviewStats.totalProjects)} />
          <OverviewStat label="Active now" value={String(overviewStats.activeProjects)} />
          <OverviewStat label="Files in workspace" value={String(overviewStats.totalFiles)} />
          <OverviewStat label="Managed words" value={formatCompactNumber(overviewStats.totalWords)} />
        </div>
      </section>

      <section className="mt-6 rounded-[32px] border border-[rgba(36,39,32,0.08)] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_20px_60px_rgba(21,25,19,0.05)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="block w-full max-w-md">
            <span className="sr-only">Search projects</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects, releases, or notes"
              className="w-full rounded-2xl border border-[rgba(36,39,32,0.1)] bg-[rgba(247,247,244,0.8)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {PROJECT_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  item === filter
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                    : "border-[rgba(36,39,32,0.1)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

          {filteredProjects.length === 0 ? (
            <div className="xl:col-span-2 rounded-[28px] border border-dashed border-[rgba(36,39,32,0.14)] bg-[rgba(247,247,244,0.7)] px-8 py-16 text-center">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                No projects match this view
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Try another status filter or create a new project to start a fresh localization workflow.
              </p>
            </div>
          ) : null}
        </div>
      </section>

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

function OverviewStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(36,39,32,0.08)] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}
