"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { translateProjectFilterLabel } from "@/lib/i18n";
import { getRoadmapStatusCounts, PRODUCT_ROADMAP_PHASES } from "@/lib/product-roadmap";
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
  const roadmapCounts = getRoadmapStatusCounts();

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
          strategyEyebrow: "/ Produkt-Richtung",
          strategyTitle: "Von XLIFF-Workflow zu Translation Workspace",
          strategyBody:
            "Die aktuelle Basis bleibt stark in Projekten, Glossar, Usage und Billing. Phase 1 erweitert das Produkt jetzt sichtbar um Textübersetzung und eine klarere Roadmap direkt im Dashboard.",
          openTextTranslation: "Textübersetzung öffnen",
          roadmapSummary: "Roadmap-Status",
          roadmapLive: "Live",
          roadmapInProgress: "In Arbeit",
          roadmapPlanned: "Geplant",
          nowShipping: "Jetzt in Umsetzung",
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
          strategyEyebrow: "/ Product Direction",
          strategyTitle: "From XLIFF workflow to translation workspace",
          strategyBody:
            "The current base is already strong in projects, glossary, usage, and billing. Phase 1 now expands the product with direct text translation and a clearer roadmap inside the dashboard.",
          openTextTranslation: "Open text translation",
          roadmapSummary: "Roadmap status",
          roadmapLive: "Live",
          roadmapInProgress: "In progress",
          roadmapPlanned: "Planned",
          nowShipping: "Now shipping",
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
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <div className="rounded-[14px] border border-[var(--border)] bg-white px-5 py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.strategyEyebrow}
              </p>
              <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
                {copy.strategyTitle}
              </h2>
              <p className="mt-2 max-w-[760px] text-[12.5px] leading-6 text-[var(--muted)]">
                {copy.strategyBody}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/translate"
                  className="inline-flex items-center justify-center rounded-[10px] bg-[var(--foreground)] px-4 py-2.5 text-[12.5px] font-medium text-white transition hover:opacity-90"
                >
                  {copy.openTextTranslation}
                </Link>
                <span className="rounded-full border border-[var(--processing-border)] bg-[var(--processing-bg)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--processing)]">
                  {copy.nowShipping}
                </span>
              </div>
            </div>

            <div className="rounded-[14px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.roadmapSummary}
                </p>
              </div>
              <div className="grid grid-cols-3 border-b border-[var(--border-light)]">
                <RoadmapCount label={copy.roadmapLive} value={String(roadmapCounts.live)} />
                <RoadmapCount label={copy.roadmapInProgress} value={String(roadmapCounts.in_progress)} />
                <RoadmapCount label={copy.roadmapPlanned} value={String(roadmapCounts.planned)} />
              </div>
              <div className="space-y-3 px-5 py-4">
                {PRODUCT_ROADMAP_PHASES.map((phase) => (
                  <div
                    key={phase.id}
                    className="rounded-[10px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                          {phase.horizon}
                        </p>
                        <h3 className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                          {phase.title}
                        </h3>
                      </div>
                      <span className={getRoadmapBadgeClassName(phase.status)}>
                        {phase.status === "live"
                          ? copy.roadmapLive
                          : phase.status === "in_progress"
                            ? copy.roadmapInProgress
                            : copy.roadmapPlanned}
                      </span>
                    </div>
                    <p className="mt-2 text-[11.5px] leading-5 text-[var(--muted)]">
                      {phase.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

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

function RoadmapCount({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--border-light)] px-5 py-4 last:border-r-0">
      <div className="text-[24px] font-semibold leading-none tracking-[-0.06em] text-[var(--foreground)]">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[var(--muted-soft)]">{label}</div>
    </div>
  );
}

function getRoadmapBadgeClassName(status: "live" | "in_progress" | "planned") {
  switch (status) {
    case "live":
      return "rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--success)]";
    case "in_progress":
      return "rounded-full border border-[var(--processing-border)] bg-[var(--processing-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--processing)]";
    case "planned":
    default:
      return "rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]";
  }
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
