"use client";

import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import {
  getOverviewProjectDisplay,
  getOverviewStatsDisplay,
  getProjectStatusTone,
  matchesOverviewProjectFilter
} from "@/lib/projects/display";
import { formatProjectDate } from "@/lib/projects/formatters";
import { PROJECT_FILTERS } from "@/lib/projects/mock-data";
import type { NewProjectInput, ProjectFilter, ProjectRecord } from "@/types/projects";

import { NewProjectModal } from "@/components/projects/new-project-modal";
import { ProgressBar } from "@/components/projects/progress-bar";
import { ProjectUploadZone } from "@/components/projects/project-upload-zone";
import { StatusBadge } from "@/components/projects/status-badge";

type ProjectsOverviewScreenProps = {
  initialProjects: ProjectRecord[];
};

export function ProjectsOverviewScreen({ initialProjects }: ProjectsOverviewScreenProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [showModal, setShowModal] = useState(false);
  const [overviewFiles, setOverviewFiles] = useState<File[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const projects = initialProjects;

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const display = getOverviewProjectDisplay(project);
      const matchesFilter = matchesOverviewProjectFilter(project, filter);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${project.name} ${display.description}`.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, projects, search]);

  const stats = useMemo(() => getOverviewStatsDisplay(projects), [projects]);

  async function handleCreateProject(input: NewProjectInput) {
    setCreateError(null);
    setIsCreatingProject(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Project could not be created.");
      }

      setShowModal(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Project could not be created.");
    } finally {
      setIsCreatingProject(false);
    }
  }

  return (
    <>
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
          <div className="flex flex-col gap-[1px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / Projects
            </span>
            <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
              All Projects
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[var(--foreground)] px-[15px] py-2 text-[12.5px] font-medium text-white transition hover:opacity-85"
          >
            <PlusIcon />
            New Project
          </button>
        </header>

        <div className="flex flex-col gap-6 px-7 py-6">
          <section className="grid grid-cols-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
            <StatsCell
              value={stats.activeProjects}
              label="Active projects"
              meta={stats.activeProjectsMeta}
              metaTone="positive"
            />
            <StatsCell
              value={stats.filesInProgress}
              label="Files in progress"
              meta={stats.filesInProgressMeta}
            />
            <StatsCell
              value={stats.averageCompletion}
              label="Avg. completion"
              meta={stats.averageCompletionMeta}
              metaTone="positive"
            />
            <StatsCell
              value={stats.languagesActive}
              label="Languages active"
              meta={stats.languagesActiveMeta}
            />
          </section>

          <ProjectUploadZone
            inputId="projects-overview-upload"
            files={overviewFiles}
            onFilesSelected={setOverviewFiles}
            variant="strip"
          />

          <section>
            <div className="mb-[10px] flex items-center justify-between gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                / Recent Projects
              </span>

              <div className="flex items-center gap-[6px]">
                <label className="relative">
                  <SearchIcon className="pointer-events-none absolute left-[9px] top-1/2 -translate-y-1/2 text-[var(--muted-soft)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search..."
                    className="w-[190px] rounded-[7px] border border-[var(--border)] bg-white px-[10px] py-[6px] pl-[27px] text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                  />
                </label>

                <div className="inline-flex overflow-hidden rounded-[7px] border border-[var(--border)] bg-white">
                  {PROJECT_FILTERS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={[
                        "border-r border-[var(--border)] px-3 py-[5px] text-[12px] text-[var(--muted-soft)] transition last:border-r-0",
                        item === filter
                          ? "bg-[var(--background)] font-medium text-[var(--foreground)]"
                          : "hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                      ].join(" ")}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_55px_140px_75px_80px] border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]">
                {["Project", "Languages", "Files", "Progress", "Updated", ""].map((label) => (
                  <span
                    key={label || "open"}
                    className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const display = getOverviewProjectDisplay(project);

                  return (
                    <div
                      key={project.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/projects/${project.id}`);
                        }
                      }}
                      className="grid cursor-pointer grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_55px_140px_75px_80px] items-center border-b border-[var(--border-light)] px-[18px] py-[13px] transition hover:bg-[var(--background-strong)] last:border-b-0"
                    >
                      <div>
                        <p className="mb-0.5 text-[13px] font-medium text-[var(--foreground)]">
                          {project.name}
                        </p>
                        <p className="max-w-[93%] truncate text-[11.5px] text-[var(--muted-soft)]">
                          {display.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-[3px]">
                        {display.languages.map((language) => (
                          <LanguageChip key={`${project.id}-${language}`} code={language} />
                        ))}
                      </div>

                      <div className="text-[13px] font-medium text-[var(--foreground)]">
                        {display.fileCount}
                      </div>

                      <div className="flex flex-col gap-[5px]">
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={display.status} />
                          <span className="text-[11.5px] font-medium text-[var(--muted)]">
                            {display.progress}%
                          </span>
                        </div>
                        <ProgressBar
                          value={display.progress}
                          size="sm"
                          tone={getProjectStatusTone(display.status)}
                        />
                      </div>

                      <div className="text-[12px] text-[var(--muted-soft)]">
                        {formatProjectDate(display.updated)}
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/projects/${project.id}`);
                          }}
                          className="rounded-[6px] border border-[var(--border)] px-[11px] py-[5px] text-[11.5px] font-medium text-[var(--muted)] transition hover:border-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          Open →
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-10 text-center text-[12px] text-[var(--muted-soft)]">
                  No projects match the current search or filter.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showModal ? (
        <NewProjectModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateProject}
          errorMessage={createError}
          submitting={isCreatingProject}
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
    <div className="flex flex-col gap-[3px] bg-white px-[18px] py-4">
      <div className="text-[26px] font-semibold leading-none tracking-[-1.5px] text-[var(--foreground)]">
        {value}
      </div>
      <div className="text-[12px] text-[var(--muted-soft)]">{label}</div>
      <div
        className={[
          "mt-[5px] text-[11px]",
          metaTone === "positive" ? "text-[var(--success)]" : "text-[var(--muted-soft)]"
        ].join(" ")}
      >
        {meta}
      </div>
    </div>
  );
}

function LanguageChip({ code }: { code: string }) {
  return (
    <span className="rounded-[4px] border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--muted)]">
      {code.toUpperCase()}
    </span>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 8 10.5 10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M5.5 1v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
