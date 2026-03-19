"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getProjectStatusTone } from "@/lib/projects/display";
import { formatCompactNumber, formatPercent, formatProjectDate, getLanguageLabel } from "@/lib/projects/formatters";
import { getProjectSummary } from "@/lib/projects/mock-data";
import type { ProjectFileRecord, ProjectFileSyncInput, ProjectRecord } from "@/types/projects";
import type { TranslationApiErrorShape, TranslationApiSuccess } from "@/types/translation";

import { ProgressBar } from "@/components/projects/progress-bar";
import { ProjectFilesTable } from "@/components/projects/project-files-table";
import { ProjectUploadZone } from "@/components/projects/project-upload-zone";
import { StatusBadge } from "@/components/projects/status-badge";

type ProjectWorkspaceScreenProps = {
  project: ProjectRecord | null;
};

type ProjectTranslationOutput = TranslationApiSuccess & {
  id: string;
  sourceFileName: string;
  targetLanguage: string;
};

type ProjectTranslationFailure = {
  id: string;
  sourceFileName: string;
  targetLanguage: string;
  message: string;
};

type UploadedSourceFile = {
  id: string;
  file: File;
  name: string;
  words: number;
  lastUpdated: string;
};

type RuntimeFileState = Pick<ProjectFileRecord, "status" | "progress" | "lastUpdated" | "words">;

export function ProjectWorkspaceScreen({ project }: ProjectWorkspaceScreenProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedSourceFiles, setUploadedSourceFiles] = useState<UploadedSourceFile[]>([]);
  const [persistedFiles, setPersistedFiles] = useState<ProjectFileRecord[]>(project?.files ?? []);
  const [runtimeFileStates, setRuntimeFileStates] = useState<Record<string, RuntimeFileState>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [currentTaskLabel, setCurrentTaskLabel] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationOutputs, setTranslationOutputs] = useState<ProjectTranslationOutput[]>([]);
  const [translationFailures, setTranslationFailures] = useState<ProjectTranslationFailure[]>([]);
  const uploadInputId = `project-upload-${project?.id ?? "unknown"}`;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setPersistedFiles(project?.files ?? []);
  }, [project]);

  useEffect(() => {
    let cancelled = false;

    async function buildSourceFileSnapshots() {
      const snapshots = await Promise.all(
        selectedFiles.map(async (file) => {
          const content = await file.text();

          return {
            id: getClientFileId(file),
            file,
            name: file.name,
            words: countWords(content),
            lastUpdated: new Date(file.lastModified || Date.now()).toISOString()
          };
        })
      );

      if (!cancelled) {
        setUploadedSourceFiles(snapshots);
      }
    }

    void buildSourceFileSnapshots();

    return () => {
      cancelled = true;
    };
  }, [selectedFiles]);

  const runtimeFiles = useMemo(() => {
    if (!project) {
      return [];
    }

    return uploadedSourceFiles.flatMap((sourceFile) =>
      project.targetLanguages.map((targetLanguage) => {
        const runtimeId = buildRuntimeFileId(sourceFile.id, targetLanguage);
        const runtimeState = runtimeFileStates[runtimeId];

        return {
          id: runtimeId,
          name: sourceFile.name,
          sourceLanguage: project.sourceLanguage,
          targetLanguage,
          status: runtimeState?.status ?? "Queued",
          progress: runtimeState?.progress ?? 0,
          lastUpdated: runtimeState?.lastUpdated ?? sourceFile.lastUpdated,
          words: runtimeState?.words ?? sourceFile.words
        } satisfies ProjectFileRecord;
      })
    );
  }, [project, runtimeFileStates, uploadedSourceFiles]);

  const displayFiles = useMemo(() => {
    if (!project) {
      return [];
    }

    return mergeProjectFiles(persistedFiles, runtimeFiles);
  }, [persistedFiles, project, runtimeFiles]);

  const summary = useMemo(() => {
    if (!project) {
      return null;
    }

    return getProjectSummary({
      ...project,
      files: displayFiles
    });
  }, [displayFiles, project]);

  const displayProjectStatus = useMemo(
    () => deriveProjectStatusFromFiles(displayFiles, project?.status ?? "Active"),
    [displayFiles, project?.status]
  );

  useEffect(() => {
    let cancelled = false;

    async function syncUploadedFiles() {
      if (!project || uploadedSourceFiles.length === 0 || project.targetLanguages.length === 0) {
        return;
      }

      try {
        const files = await syncProjectFilesRequest(
          project.id,
          buildProjectFileSyncPayload(project, uploadedSourceFiles, {}),
          "POST"
        );

        if (!cancelled) {
          setPersistedFiles(files);
        }
      } catch {
        // Keep the local runtime summary responsive even if metadata sync fails.
      }
    }

    void syncUploadedFiles();

    return () => {
      cancelled = true;
    };
  }, [project, uploadedSourceFiles]);

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

  const currentProject = project;

  async function handleStartTranslation() {
    if (selectedFiles.length === 0) {
      setTranslationError("Select one or more XLIFF files in Upload Files before starting a translation run.");
      setTranslationOutputs([]);
      setTranslationFailures([]);
      return;
    }

    const unsupportedFiles = selectedFiles.filter((file) => !isSupportedTranslationFile(file.name));

    if (unsupportedFiles.length > 0) {
      setTranslationError(
        `Phase 1 currently translates only .xliff and .xlf files. Unsupported files: ${unsupportedFiles
          .map((file) => file.name)
          .join(", ")}.`
      );
      setTranslationOutputs([]);
      setTranslationFailures([]);
      return;
    }

    if (uploadedSourceFiles.length !== selectedFiles.length) {
      setTranslationError("Files are still being prepared. Try again in a second.");
      return;
    }

    const jobs = uploadedSourceFiles.flatMap((sourceFile) =>
      currentProject.targetLanguages.map((targetLanguage) => ({
        id: buildRuntimeFileId(sourceFile.id, targetLanguage),
        file: sourceFile.file,
        sourceFileName: sourceFile.name,
        targetLanguage,
        words: sourceFile.words
      }))
    );

    if (jobs.length === 0) {
      setTranslationError("This project has no target languages configured yet.");
      setTranslationOutputs([]);
      setTranslationFailures([]);
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);
    setCurrentTaskLabel(null);
    setTranslationError(null);
    setTranslationOutputs([]);
    setTranslationFailures([]);
    setRuntimeFileStates((current) => {
      const next = { ...current };

      for (const job of jobs) {
        next[job.id] = {
          status: "Queued",
          progress: 0,
          lastUpdated: new Date().toISOString(),
          words: job.words
        };
      }

      return next;
    });

    const nextOutputs: ProjectTranslationOutput[] = [];
    const nextFailures: ProjectTranslationFailure[] = [];
    const finalRuntimeStates: Record<string, RuntimeFileState> = {};

    for (const [index, job] of jobs.entries()) {
      setCurrentTaskLabel(`${job.sourceFileName} → ${job.targetLanguage.toUpperCase()}`);
      setRuntimeFileStates((current) => ({
        ...current,
        [job.id]: {
          status: "Processing",
          progress: 48,
          lastUpdated: new Date().toISOString(),
          words: job.words
        }
      }));

      try {
        const formData = new FormData();
        formData.append("file", job.file);
        formData.append("targetLanguage", job.targetLanguage);
        formData.append("sourceLanguage", currentProject.sourceLanguage);

        const response = await fetch("/api/translate", {
          method: "POST",
          body: formData
        });

        const payload = (await response.json()) as TranslationApiSuccess | TranslationApiErrorShape;

        if (!response.ok || "error" in payload) {
          nextFailures.push({
            id: `${job.sourceFileName}-${job.targetLanguage}-${index}`,
            sourceFileName: job.sourceFileName,
            targetLanguage: job.targetLanguage,
            message: "error" in payload ? payload.error.message : "Translation failed."
          });
          setRuntimeFileStates((current) => ({
            ...current,
            [job.id]: {
              status: "Error",
              progress: 100,
              lastUpdated: new Date().toISOString(),
              words: job.words
            }
          }));
        } else {
          nextOutputs.push({
            ...payload,
            id: `${job.sourceFileName}-${job.targetLanguage}-${index}`,
            sourceFileName: job.sourceFileName,
            targetLanguage: job.targetLanguage
          });
          finalRuntimeStates[job.id] = {
            status: "Done",
            progress: 100,
            lastUpdated: new Date().toISOString(),
            words: job.words
          };
          setRuntimeFileStates((current) => ({
            ...current,
            [job.id]: {
              status: "Done",
              progress: 100,
              lastUpdated: new Date().toISOString(),
              words: job.words
            }
          }));
        }
      } catch (error) {
        nextFailures.push({
          id: `${job.sourceFileName}-${job.targetLanguage}-${index}`,
          sourceFileName: job.sourceFileName,
          targetLanguage: job.targetLanguage,
            message: error instanceof Error ? error.message : "Translation failed."
          });
        finalRuntimeStates[job.id] = {
          status: "Error",
          progress: 100,
          lastUpdated: new Date().toISOString(),
          words: job.words
        };
        setRuntimeFileStates((current) => ({
          ...current,
          [job.id]: {
            status: "Error",
            progress: 100,
            lastUpdated: new Date().toISOString(),
            words: job.words
          }
        }));
      } finally {
        setTranslationProgress(Math.round(((index + 1) / jobs.length) * 100));
      }
    }

    try {
      const files = await syncProjectFilesRequest(
        currentProject.id,
        buildProjectFileSyncPayload(currentProject, uploadedSourceFiles, finalRuntimeStates),
        "PATCH"
      );
      setPersistedFiles(files);
    } catch {
      // Keep the successful translation outputs available even when file metadata sync fails.
    }

    setTranslationOutputs(nextOutputs);
    setTranslationFailures(nextFailures);
    setCurrentTaskLabel(null);
    setIsTranslating(false);

    if (nextOutputs.length === 0 && nextFailures.length > 0) {
      setTranslationError(nextFailures[0].message);
      return;
    }

    if (nextFailures.length > 0) {
      setTranslationError(
        `${nextFailures.length} translation ${nextFailures.length === 1 ? "job failed" : "jobs failed"} while ${nextOutputs.length} succeeded.`
      );
    }
  }

  function handleDownloadOutput(output: ProjectTranslationOutput) {
    downloadTextFile(output.fileName, output.translatedContent, "application/xml;charset=utf-8");
  }

  function handleDownloadAllOutputs() {
    for (const output of translationOutputs) {
      handleDownloadOutput(output);
    }
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
              <StatusBadge status={displayProjectStatus} />
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
              onClick={handleStartTranslation}
              disabled={hasMounted ? isTranslating || selectedFiles.length === 0 : undefined}
              className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85"
            >
              {hasMounted && isTranslating ? "Translating..." : "Start Translation"}
            </button>
            <button
              type="button"
              onClick={handleDownloadAllOutputs}
              disabled={hasMounted ? translationOutputs.length === 0 : undefined}
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
              tone={getProjectStatusTone(displayProjectStatus)}
            />
          </div>
        </section>

        <ProjectUploadZone
          inputId={uploadInputId}
          files={selectedFiles}
          onFilesSelected={setSelectedFiles}
          variant="workspace"
        />

        {hasMounted ? (
          <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-[18px] py-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                / Translation Run
              </span>
            </div>

            <div className="space-y-4 px-[18px] py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[var(--foreground)]">
                    {isTranslating
                      ? "Translation in progress"
                      : translationOutputs.length > 0
                        ? "Translation outputs ready"
                        : "Ready to translate"}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--muted-soft)]">
                    {isTranslating
                      ? currentTaskLabel ?? "Preparing translation jobs..."
                      : translationOutputs.length > 0
                        ? `${translationOutputs.length} translated output${translationOutputs.length === 1 ? "" : "s"} ready for download.`
                        : "Uploaded XLIFF files will be translated once for each project target language."}
                  </p>
                </div>

                <div className="min-w-[120px] text-right">
                  <p className="text-[11.5px] font-medium text-[var(--muted)]">
                    {isTranslating ? `${translationProgress}%` : translationOutputs.length > 0 ? "Complete" : "Idle"}
                  </p>
                </div>
              </div>

              <ProgressBar
                value={isTranslating ? translationProgress : translationOutputs.length > 0 ? 100 : 0}
                size="sm"
                tone={
                  translationError && translationOutputs.length === 0
                    ? "danger"
                    : isTranslating
                      ? "processing"
                      : translationOutputs.length > 0
                        ? "success"
                        : "neutral"
                }
              />

              {translationError ? (
                <div className="rounded-[8px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2 text-[12px] text-[var(--danger)]">
                  {translationError}
                </div>
              ) : null}

              {translationOutputs.length > 0 ? (
                <div className="overflow-hidden rounded-[8px] border border-[var(--border)]">
                  <div className="grid grid-cols-[minmax(0,1.8fr)_110px_90px_110px] border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]">
                    {["Output", "Target", "Units", ""].map((label) => (
                      <span
                        key={label || "download"}
                        className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  {translationOutputs.map((output) => (
                    <div
                      key={output.id}
                      className="grid grid-cols-[minmax(0,1.8fr)_110px_90px_110px] items-center border-b border-[var(--border-light)] px-[18px] py-[13px] last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                          {output.fileName}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-[var(--muted-soft)]">
                          {output.sourceFileName}
                          {output.warnings.length > 0 ? ` · ${output.warnings.length} warning${output.warnings.length === 1 ? "" : "s"}` : ""}
                        </p>
                      </div>
                      <div className="text-[12px] text-[var(--muted)]">
                        {output.targetLanguage.toUpperCase()}
                      </div>
                      <div className="text-[12px] font-medium text-[var(--foreground)]">
                        {output.translatedUnitCount}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDownloadOutput(output)}
                          className="rounded-[6px] border border-[var(--border)] px-[11px] py-[5px] text-[11.5px] font-medium text-[var(--muted)] transition hover:border-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {translationFailures.length > 0 ? (
                <div className="space-y-2">
                  {translationFailures.map((failure) => (
                    <div
                      key={failure.id}
                      className="rounded-[8px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2"
                    >
                      <p className="text-[12px] font-medium text-[var(--danger)]">
                        {failure.sourceFileName} → {failure.targetLanguage.toUpperCase()}
                      </p>
                      <p className="mt-1 text-[11.5px] text-[var(--danger)]">{failure.message}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

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
          <ProjectFilesTable files={displayFiles} title={null} />
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

function isSupportedTranslationFile(fileName: string) {
  return /\.(xliff|xlf)$/i.test(fileName);
}

function buildRuntimeFileId(sourceFileId: string, targetLanguage: string) {
  return `runtime:${sourceFileId}:${targetLanguage}`;
}

function getClientFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function countWords(content: string) {
  const plainText = content
    .replace(/<[^>]+>/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .trim();

  if (!plainText) {
    return 0;
  }

  return plainText.split(/\s+/).length;
}

function mergeProjectFiles(existingFiles: ProjectFileRecord[], runtimeFiles: ProjectFileRecord[]) {
  const merged = new Map<string, ProjectFileRecord>();

  for (const file of existingFiles) {
    merged.set(getProjectFileMergeKey(file), file);
  }

  for (const file of runtimeFiles) {
    merged.set(getProjectFileMergeKey(file), file);
  }

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime()
  );
}

async function syncProjectFilesRequest(
  projectId: string,
  files: ProjectFileSyncInput[],
  method: "POST" | "PATCH"
) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/files`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ files })
  });

  const payload = (await response.json()) as {
    error?: string;
    files?: ProjectFileRecord[];
  };

  if (!response.ok || !payload.files) {
    throw new Error(payload.error ?? "Failed to sync project files.");
  }

  return payload.files;
}

function buildProjectFileSyncPayload(
  project: Pick<ProjectRecord, "sourceLanguage" | "targetLanguages">,
  sourceFiles: UploadedSourceFile[],
  runtimeStates: Record<string, RuntimeFileState>
): ProjectFileSyncInput[] {
  return sourceFiles.flatMap((sourceFile) =>
    project.targetLanguages.map((targetLanguage) => {
      const runtimeId = buildRuntimeFileId(sourceFile.id, targetLanguage);
      const runtimeState = runtimeStates[runtimeId];

      return {
        clientId: sourceFile.id,
        name: sourceFile.name,
        sourceLanguage: project.sourceLanguage,
        targetLanguage,
        words: runtimeState?.words ?? sourceFile.words,
        status: runtimeState?.status ?? "Queued",
        progress: runtimeState?.progress ?? 0
      };
    })
  );
}

function getProjectFileMergeKey(file: Pick<ProjectFileRecord, "name" | "targetLanguage">) {
  return `${file.name.toLowerCase()}::${file.targetLanguage.toLowerCase()}`;
}

function deriveProjectStatusFromFiles(files: ProjectFileRecord[], fallbackStatus: ProjectRecord["status"]) {
  if (files.some((file) => file.status === "Error")) {
    return "Error";
  }

  if (files.length > 0 && files.every((file) => file.status === "Done")) {
    return "Completed";
  }

  if (files.some((file) => file.status === "Review")) {
    return "In Review";
  }

  if (files.length > 0) {
    return "Active";
  }

  return fallbackStatus;
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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
