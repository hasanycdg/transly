"use client";

import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { translateProjectFilterLabel } from "@/lib/i18n";
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
  const locale = useAppLocale();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const [showModal, setShowModal] = useState(false);
  const [overviewFiles, setOverviewFiles] = useState<File[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);

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

  const stats = useMemo(() => getOverviewStatsDisplay(projects, locale), [locale, projects]);
  const copy =
    locale === "de"
      ? {
          createError: "Das Projekt konnte nicht erstellt werden.",
          projectsEyebrow: "/ Projekte",
          heading: "Alle Projekte",
          newProject: "Neues Projekt",
          activeProjects: "Aktive Projekte",
          filesInProgress: "Dateien in Bearbeitung",
          averageCompletion: "Durchschn. Fortschritt",
          languagesActive: "Aktive Sprachen",
          recentProjects: "/ Letzte Projekte",
          search: "Suchen...",
          project: "Projekt",
          languages: "Sprachen",
          files: "Dateien",
          progress: "Fortschritt",
          updated: "Aktualisiert",
          open: "Öffnen →",
          noProjects: "Keine Projekte entsprechen der aktuellen Suche oder dem Filter."
          ,
          rename: "Umbenennen",
          renamePrompt: "Neuen Projektnamen eingeben",
          renameFailed: "Projekt konnte nicht umbenannt werden."
        }
      : {
          createError: "Project could not be created.",
          projectsEyebrow: "/ Projects",
          heading: "All Projects",
          newProject: "New Project",
          activeProjects: "Active projects",
          filesInProgress: "Files in progress",
          averageCompletion: "Avg. completion",
          languagesActive: "Languages active",
          recentProjects: "/ Recent Projects",
          search: "Search...",
          project: "Project",
          languages: "Languages",
          files: "Files",
          progress: "Progress",
          updated: "Updated",
          open: "Open →",
          noProjects: "No projects match the current search or filter.",
          rename: "Rename",
          renamePrompt: "Enter a new project name",
          renameFailed: "Project could not be renamed."
        };

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
        throw new Error(payload.error ?? copy.createError);
      }

      setShowModal(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : copy.createError);
    } finally {
      setIsCreatingProject(false);
    }
  }

  async function handleRenameProject(project: ProjectRecord) {
    if (renamingProjectId) {
      return;
    }

    const nextName = window.prompt(copy.renamePrompt, project.name)?.trim();

    if (!nextName || nextName === project.name) {
      return;
    }

    try {
      setRenamingProjectId(project.id);

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nextName
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; slug?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.renameFailed);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : copy.renameFailed);
    } finally {
      setRenamingProjectId(null);
    }
  }

  return (
    <>
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
          <div className="flex flex-col gap-[1px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.projectsEyebrow}
            </span>
            <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
              {copy.heading}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[var(--foreground)] px-[15px] py-2 text-[12.5px] font-medium text-white transition hover:opacity-85"
          >
            <PlusIcon />
            {copy.newProject}
          </button>
        </header>

        <div className="flex flex-col gap-6 px-7 py-6">
          <section className="grid grid-cols-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
            <StatsCell
              value={stats.activeProjects}
              label={copy.activeProjects}
              meta={stats.activeProjectsMeta}
              metaTone="positive"
            />
            <StatsCell
              value={stats.filesInProgress}
              label={copy.filesInProgress}
              meta={stats.filesInProgressMeta}
            />
            <StatsCell
              value={stats.averageCompletion}
              label={copy.averageCompletion}
              meta={stats.averageCompletionMeta}
              metaTone="positive"
            />
            <StatsCell
              value={stats.languagesActive}
              label={copy.languagesActive}
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
                {copy.recentProjects}
              </span>

              <div className="flex items-center gap-[6px]">
                <label className="relative">
                  <SearchIcon className="pointer-events-none absolute left-[9px] top-1/2 -translate-y-1/2 text-[var(--muted-soft)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={copy.search}
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
                      {translateProjectFilterLabel(item, locale)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_55px_140px_75px_136px] border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]">
                {[copy.project, copy.languages, copy.files, copy.progress, copy.updated, ""].map((label) => (
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
                      className="grid cursor-pointer grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_55px_140px_75px_136px] items-center border-b border-[var(--border-light)] px-[18px] py-[13px] transition hover:bg-[var(--background-strong)] last:border-b-0"
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
                        <div className="flex items-center gap-2.5">
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
                        {formatProjectDate(display.updated, locale)}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleRenameProject(project);
                          }}
                          disabled={renamingProjectId === project.id}
                          className="rounded-[6px] border border-[var(--border)] px-[10px] py-[5px] text-[11.5px] font-medium text-[var(--muted)] transition hover:border-[var(--muted)] hover:text-[var(--foreground)] disabled:cursor-progress disabled:opacity-45"
                        >
                          {renamingProjectId === project.id ? "…" : copy.rename}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/projects/${project.id}`);
                          }}
                          className="rounded-[6px] border border-[var(--border)] px-[11px] py-[5px] text-[11.5px] font-medium text-[var(--muted)] transition hover:border-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          {copy.open}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-10 text-center text-[12px] text-[var(--muted-soft)]">
                  {copy.noProjects}
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
