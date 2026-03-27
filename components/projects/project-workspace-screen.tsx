"use client";

import JSZip from "jszip";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { getProjectStatusTone } from "@/lib/projects/display";
import { formatCompactNumber, formatPercent, formatProjectDate, getLanguageLabel } from "@/lib/projects/formatters";
import { getProjectSummary } from "@/lib/projects/mock-data";
import { estimateTranslationFileWordCount } from "@/lib/translation/word-count";
import {
  buildTranslatedArchivePath,
  createUniqueArchivePaths,
  expandProjectUploadSelection
} from "@/lib/uploads/project-archive";
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
  sourceArchiveName?: string;
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
  content: string;
  words: number;
  lastUpdated: string;
  sourceArchiveName?: string;
};

type RuntimeFileState = Pick<ProjectFileRecord, "status" | "progress" | "lastUpdated" | "words">;
type SelectedUploadFile = Pick<UploadedSourceFile, "file" | "name" | "sourceArchiveName"> & {
  size: number;
};

export function ProjectWorkspaceScreen({ project }: ProjectWorkspaceScreenProps) {
  const locale = useAppLocale();
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedUploadFile[]>([]);
  const [uploadedSourceFiles, setUploadedSourceFiles] = useState<UploadedSourceFile[]>([]);
  const [persistedFiles, setPersistedFiles] = useState<ProjectFileRecord[]>(project?.files ?? []);
  const [reviewFileId, setReviewFileId] = useState<string | null>(null);
  const [runtimeFileStates, setRuntimeFileStates] = useState<Record<string, RuntimeFileState>>({});
  const [isPreparingUploads, setIsPreparingUploads] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [currentTaskLabel, setCurrentTaskLabel] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationOutputs, setTranslationOutputs] = useState<ProjectTranslationOutput[]>([]);
  const [translationFailures, setTranslationFailures] = useState<ProjectTranslationFailure[]>([]);
  const autoDownloadedOutputIdsRef = useRef<Set<string>>(new Set());
  const uploadInputId = `project-upload-${project?.id ?? "unknown"}`;
  const copy =
    locale === "de"
      ? {
          notFoundTitle: "Projekt nicht gefunden",
          notFoundDesc: "Das angeforderte Projekt konnte in diesem Workspace nicht gefunden werden.",
          backToProjects: "Zurück zu Projekten",
          uploadFiles: "Dateien hochladen",
          startTranslation: "Übersetzung starten",
          translating: "Übersetzt...",
          preparing: "Wird vorbereitet...",
          exportAll: "Alle exportieren",
          exportZip: "ZIP exportieren",
          buildingZip: "ZIP wird erstellt...",
          summary: {
            totalFiles: "Dateien gesamt",
            completed: "Abgeschlossen",
            inReview: "In Prüfung",
            failed: "Fehlgeschlagen",
            totalWords: "Wörter gesamt",
            qualityScore: "Qualität"
          },
          overallProgress: "Gesamtfortschritt",
          translationRun: "/ Übersetzungslauf",
          preparingUploadedFiles: "Hochgeladene Dateien werden vorbereitet",
          translationInProgress: "Übersetzung läuft",
          translationOutputsReady: "Übersetzungsausgaben bereit",
          readyToTranslate: "Bereit zur Übersetzung",
          zipAnalyzing: "ZIP-Inhalte werden entpackt und analysiert.",
          preparingJobs: "Übersetzungsjobs werden vorbereitet...",
          readyOutputs: (count: number) =>
            `${count} übersetzte Ausgabe${count === 1 ? "" : "n"} bereit für Download oder ZIP-Export.`,
          defaultRunDesc: "Hochgeladene Übersetzungsdateien werden einmal pro Projekt-Zielsprache übersetzt.",
          complete: "Fertig",
          idle: "Leerlauf",
          output: "Ausgabe",
          target: "Ziel",
          units: "Einheiten",
          warningLabel: (count: number) => `${count} Warnung${count === 1 ? "" : "en"}`,
          download: "Herunterladen",
          files: "/ Dateien",
          review: "/ Prüfung",
          close: "Schließen",
          languagePair: "Sprachpaar",
          status: "Status",
          progress: "Fortschritt",
          words: "Wörter",
          updated: "Aktualisiert",
          reviewSideBySide: "Nebeneinander prüfen",
          reviewDesc: "Vergleiche die Originaldatei parallel mit der übersetzten Ausgabe.",
          downloadOutput: "Ausgabe herunterladen",
          original: "Original",
          originalLoaded: "Quelldatei ist aktuell in dieser Sitzung geladen.",
          originalUnavailableHelper:
            "Originalinhalt ist erst verfügbar, nachdem diese Datei in der aktuellen Sitzung hochgeladen wurde.",
          originalUnavailable: "Original nicht verfügbar",
          originalUnavailableDesc:
            "Lade diese Datei in der aktuellen Sitzung hoch oder wähle sie erneut aus, um den Originalinhalt hier zu prüfen.",
          translated: "Übersetzt",
          translatedHelper: (targetLanguage: string) => `Erzeugte Ausgabe für ${targetLanguage.toUpperCase()}.`,
          translatedUnavailableHelper: "Übersetzter Inhalt ist nach einem erfolgreichen Übersetzungslauf verfügbar.",
          translatedUnavailable: "Übersetzung nicht verfügbar",
          translatedUnavailableDesc:
            "Starte die Übersetzung für diese Datei in der aktuellen Sitzung, um die übersetzte Ausgabe hier zu prüfen.",
          workspaceStats: "/ Workspace-Statistiken",
          glossaryEnabled: "Glossar aktiv",
          yes: "Ja",
          no: "Nein",
          creditsUsed: "Verbrauchte Credits",
          qualityScoreAverage: "Durchschnittliche Qualität",
          pending: "Ausstehend",
          latestExport: "Letzter Export",
          noExport: "Noch kein Export",
          lastUpdated: "Zuletzt aktualisiert",
          recentActivity: "/ Letzte Aktivität",
          noSupportedFiles: "In den ausgewählten ZIP-Archiven wurden keine unterstützten Übersetzungsdateien gefunden.",
          uploadNotice: (extractedCount: number, archiveCount: number, ignoredCount: number) =>
            `Es wurden ${extractedCount} Datei${extractedCount === 1 ? "" : "en"} aus ${archiveCount} ZIP-Archiv${archiveCount === 1 ? "" : "en"} extrahiert${ignoredCount > 0 ? ` und ${ignoredCount} nicht unterstützte oder System-Einträge ignoriert` : ""}.`,
          prepareError: "Die ausgewählten Dateien konnten nicht vorbereitet werden.",
          selectFiles: "Wähle in Upload Files eine oder mehrere Übersetzungsdateien aus, bevor du einen Übersetzungslauf startest.",
          filesStillPreparing: "Dateien werden noch vorbereitet. Bitte in einem Moment erneut versuchen.",
          unsupportedFiles: (names: string) =>
            `Aktuell unterstützt sind .xliff, .xlf, .po, .strings, .resx, .xml und .txt. Nicht unterstützte Dateien: ${names}.`,
          noTargets: "Für dieses Projekt sind noch keine Zielsprachen konfiguriert.",
          translationFailed: "Übersetzung fehlgeschlagen.",
          translationSummary: (failed: number, succeeded: number) =>
            `${failed} Übersetzungsjob${failed === 1 ? "" : "s"} fehlgeschlagen, während ${succeeded} erfolgreich waren.`
        }
      : {
          notFoundTitle: "Project not found",
          notFoundDesc: "The requested project could not be found in this workspace.",
          backToProjects: "Back to Projects",
          uploadFiles: "Upload Files",
          startTranslation: "Start Translation",
          translating: "Translating...",
          preparing: "Preparing...",
          exportAll: "Export All",
          exportZip: "Export ZIP",
          buildingZip: "Building ZIP...",
          summary: {
            totalFiles: "Total files",
            completed: "Completed",
            inReview: "In review",
            failed: "Failed",
            totalWords: "Total words",
            qualityScore: "Quality score"
          },
          overallProgress: "Overall progress",
          translationRun: "/ Translation Run",
          preparingUploadedFiles: "Preparing uploaded files",
          translationInProgress: "Translation in progress",
          translationOutputsReady: "Translation outputs ready",
          readyToTranslate: "Ready to translate",
          zipAnalyzing: "ZIP contents are being unpacked and analyzed.",
          preparingJobs: "Preparing translation jobs...",
          readyOutputs: (count: number) => `${count} translated output${count === 1 ? "" : "s"} ready for download or ZIP export.`,
          defaultRunDesc: "Uploaded translation files will be translated once for each project target language.",
          complete: "Complete",
          idle: "Idle",
          output: "Output",
          target: "Target",
          units: "Units",
          warningLabel: (count: number) => `${count} warning${count === 1 ? "" : "s"}`,
          download: "Download",
          files: "/ Files",
          review: "/ Review",
          close: "Close",
          languagePair: "Language pair",
          status: "Status",
          progress: "Progress",
          words: "Words",
          updated: "Updated",
          reviewSideBySide: "Review side by side",
          reviewDesc: "Compare the original file with the translated output in parallel.",
          downloadOutput: "Download output",
          original: "Original",
          originalLoaded: "Source file currently loaded in this session.",
          originalUnavailableHelper: "Original content is only available after uploading this file in the current session.",
          originalUnavailable: "Original unavailable",
          originalUnavailableDesc: "Upload or re-select this file in the current session to inspect the original source content here.",
          translated: "Translated",
          translatedHelper: (targetLanguage: string) => `Generated output for ${targetLanguage.toUpperCase()}.`,
          translatedUnavailableHelper: "Translated content is available after a successful translation run.",
          translatedUnavailable: "Translation unavailable",
          translatedUnavailableDesc: "Run the translation for this file in the current session to inspect the translated output here.",
          workspaceStats: "/ Workspace Stats",
          glossaryEnabled: "Glossary enabled",
          yes: "Yes",
          no: "No",
          creditsUsed: "Credits used",
          qualityScoreAverage: "Quality score average",
          pending: "Pending",
          latestExport: "Latest export",
          noExport: "No export yet",
          lastUpdated: "Last updated",
          recentActivity: "/ Recent Activity",
          noSupportedFiles: "No supported translation files were found in the selected ZIP archives.",
          uploadNotice: (extractedCount: number, archiveCount: number, ignoredCount: number) =>
            `Extracted ${extractedCount} file${extractedCount === 1 ? "" : "s"} from ${archiveCount} ZIP archive${archiveCount === 1 ? "" : "s"}${ignoredCount > 0 ? ` and ignored ${ignoredCount} unsupported or system entr${ignoredCount === 1 ? "y" : "ies"}` : ""}.`,
          prepareError: "The selected files could not be prepared.",
          selectFiles: "Select one or more translation files in Upload Files before starting a translation run.",
          filesStillPreparing: "Files are still being prepared. Try again in a second.",
          unsupportedFiles: (names: string) =>
            `Currently supported formats are .xliff, .xlf, .po, .strings, .resx, .xml, and .txt. Unsupported files: ${names}.`,
          noTargets: "This project has no target languages configured yet.",
          translationFailed: "Translation failed.",
          translationSummary: (failed: number, succeeded: number) =>
            `${failed} translation ${failed === 1 ? "job failed" : "jobs failed"} while ${succeeded} succeeded.`
        };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setPersistedFiles(project?.files ?? []);
  }, [project]);

  useEffect(() => {
    for (const output of translationOutputs) {
      if (!output.autoDownloadAfterTranslation || autoDownloadedOutputIdsRef.current.has(output.id)) {
        continue;
      }

      autoDownloadedOutputIdsRef.current.add(output.id);
      downloadTextFile(output.fileName, output.translatedContent, "application/xml;charset=utf-8");
    }
  }, [translationOutputs]);

  async function handleFilesSelected(rawFiles: File[]) {
    setUploadError(null);
    setUploadNotice(null);
    setCurrentTaskLabel(null);
    setReviewFileId(null);
    setTranslationError(null);
    setTranslationOutputs([]);
    setTranslationFailures([]);
    setRuntimeFileStates({});
    autoDownloadedOutputIdsRef.current.clear();

    if (rawFiles.length === 0) {
      setSelectedFiles([]);
      setUploadedSourceFiles([]);
      return;
    }

    setIsPreparingUploads(true);

    try {
      const expandedSelection = await expandProjectUploadSelection(rawFiles);

      if (expandedSelection.files.length === 0) {
        setSelectedFiles([]);
        setUploadedSourceFiles([]);
        setUploadError(copy.noSupportedFiles);
        return;
      }

      const sourceSnapshots = await Promise.all(
        expandedSelection.files.map(async (file) => {
          const content = await file.file.text();

          return {
            id: getClientFileId(file.name, file.file),
            file: file.file,
            name: file.name,
            content,
            words: estimateTranslationFileWordCount(file.name, content),
            lastUpdated: new Date(file.file.lastModified || Date.now()).toISOString(),
            sourceArchiveName: file.sourceArchiveName
          } satisfies UploadedSourceFile;
        })
      );

      setSelectedFiles(
        expandedSelection.files.map((file) => ({
          file: file.file,
          name: file.name,
          size: file.file.size,
          sourceArchiveName: file.sourceArchiveName
        }))
      );
      setUploadedSourceFiles(sourceSnapshots);

      const extractedCount = expandedSelection.archives.reduce(
        (sum, archive) => sum + archive.extractedCount,
        0
      );
      const ignoredCount = expandedSelection.archives.reduce(
        (sum, archive) => sum + archive.ignoredCount,
        0
      );

      if (expandedSelection.archives.length > 0) {
        setUploadNotice(copy.uploadNotice(extractedCount, expandedSelection.archives.length, ignoredCount));
      }
    } catch (error) {
      setSelectedFiles([]);
      setUploadedSourceFiles([]);
      setUploadError(error instanceof Error ? error.message : copy.prepareError);
    } finally {
      setIsPreparingUploads(false);
    }
  }

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

  const reviewFile = useMemo(
    () => displayFiles.find((file) => file.id === reviewFileId) ?? null,
    [displayFiles, reviewFileId]
  );

  const reviewOutput = useMemo(() => {
    if (!reviewFile) {
      return null;
    }

    return (
      translationOutputs.find(
        (output) =>
          output.sourceFileName === reviewFile.name &&
          output.targetLanguage.toLowerCase() === reviewFile.targetLanguage.toLowerCase()
      ) ?? null
    );
  }, [reviewFile, translationOutputs]);

  const reviewSourceFile = useMemo(() => {
    if (!reviewFile) {
      return null;
    }

    return uploadedSourceFiles.find((file) => file.name === reviewFile.name) ?? null;
  }, [reviewFile, uploadedSourceFiles]);

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
              {locale === "de" ? "/ Projekte" : "/ Projects"}
            </span>
            <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
              {copy.notFoundTitle}
            </h1>
          </div>
        </header>

        <div className="px-7 py-6">
          <div className="rounded-[10px] border border-[var(--border)] bg-white p-6">
            <p className="text-[12px] text-[var(--muted)]">
              {copy.notFoundDesc}
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-flex rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
            >
              {copy.backToProjects}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentProject = project;

  async function handleStartTranslation() {
    if (selectedFiles.length === 0) {
      setTranslationError(copy.selectFiles);
      setTranslationOutputs([]);
      setTranslationFailures([]);
      return;
    }

    if (isPreparingUploads) {
      setTranslationError(copy.filesStillPreparing);
      return;
    }

    const unsupportedFiles = selectedFiles.filter((file) => !isSupportedTranslationFile(file.name));

    if (unsupportedFiles.length > 0) {
      setTranslationError(
        copy.unsupportedFiles(unsupportedFiles.map((file) => file.name).join(", "))
      );
      setTranslationOutputs([]);
      setTranslationFailures([]);
      return;
    }

    if (uploadedSourceFiles.length !== selectedFiles.length) {
      setTranslationError(copy.filesStillPreparing);
      return;
    }

    const jobs = uploadedSourceFiles.flatMap((sourceFile) =>
      currentProject.targetLanguages.map((targetLanguage) => ({
        id: buildRuntimeFileId(sourceFile.id, targetLanguage),
        file: sourceFile.file,
        sourceFileName: sourceFile.name,
        targetLanguage,
        words: sourceFile.words,
        sourceArchiveName: sourceFile.sourceArchiveName
      }))
    );

    if (jobs.length === 0) {
      setTranslationError(copy.noTargets);
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
    autoDownloadedOutputIdsRef.current.clear();
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
        formData.append("projectSlug", currentProject.id);

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
            message: "error" in payload ? payload.error.message : copy.translationFailed
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
            targetLanguage: job.targetLanguage,
            sourceArchiveName: job.sourceArchiveName
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
            message: error instanceof Error ? error.message : copy.translationFailed
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
        copy.translationSummary(nextFailures.length, nextOutputs.length)
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

  async function handleDownloadOutputZip() {
    if (translationOutputs.length === 0 || isExportingZip) {
      return;
    }

    setIsExportingZip(true);

    try {
      const zip = new JSZip();
      const archivePaths = createUniqueArchivePaths(
        translationOutputs.map((output) => ({
          preferredPath: buildTranslatedArchivePath(output.sourceFileName, output.fileName),
          sourcePath: output.sourceFileName
        }))
      );

      translationOutputs.forEach((output, index) => {
        zip.file(archivePaths[index] ?? output.fileName, output.translatedContent);
      });

      const bundle = await zip.generateAsync({ type: "blob" });
      downloadBlob(buildTranslationBundleFileName(currentProject.id), bundle);
    } finally {
      setIsExportingZip(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              <Link href="/projects" className="transition hover:text-[var(--muted)]">
                {locale === "de" ? "/ Projekte" : "/ Projects"}
              </Link>
              <span>/</span>
              <span>{locale === "de" ? "Workspace" : "Workspace"}</span>
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
              {copy.uploadFiles}
            </button>
            <button
              type="button"
              onClick={handleStartTranslation}
              disabled={hasMounted ? isTranslating || isPreparingUploads || selectedFiles.length === 0 : undefined}
              className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12.5px] font-medium text-white transition hover:opacity-85"
            >
              {hasMounted && isTranslating ? copy.translating : isPreparingUploads ? copy.preparing : copy.startTranslation}
            </button>
            <button
              type="button"
              onClick={handleDownloadAllOutputs}
              disabled={hasMounted ? translationOutputs.length === 0 : undefined}
              className="rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12.5px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              {copy.exportAll}
            </button>
            <button
              type="button"
              onClick={handleDownloadOutputZip}
              disabled={hasMounted ? translationOutputs.length === 0 || isExportingZip : undefined}
              className="rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12.5px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              {isExportingZip ? copy.buildingZip : copy.exportZip}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
          <div className="grid grid-cols-2 bg-[var(--border)] md:grid-cols-3 xl:grid-cols-6">
            <SummaryCell label={copy.summary.totalFiles} value={String(summary.totalFiles)} />
            <SummaryCell label={copy.summary.completed} value={String(summary.completedFiles)} />
            <SummaryCell label={copy.summary.inReview} value={String(summary.reviewFiles)} />
            <SummaryCell label={copy.summary.failed} value={String(summary.failedFiles)} />
            <SummaryCell label={copy.summary.totalWords} value={formatCompactNumber(summary.totalWords, locale)} />
            <SummaryCell label={copy.summary.qualityScore} value={project.qualityScore > 0 ? `${project.qualityScore}` : "0"} />
          </div>

          <div className="border-t border-[var(--border-light)] px-[18px] py-4">
            <div className="mb-[6px] flex items-center justify-between gap-3">
              <span className="text-[12px] text-[var(--muted)]">{copy.overallProgress}</span>
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
          onFilesSelected={handleFilesSelected}
          variant="workspace"
        />

        {uploadError ? (
          <div className="rounded-[10px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[12px] text-[var(--danger)]">
            {uploadError}
          </div>
        ) : null}

        {uploadNotice ? (
          <div className="rounded-[10px] border border-[var(--border)] bg-white px-4 py-3 text-[12px] text-[var(--muted)]">
            {uploadNotice}
          </div>
        ) : null}

        {hasMounted ? (
          <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-[18px] py-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.translationRun}
              </span>
            </div>

            <div className="space-y-4 px-[18px] py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[var(--foreground)]">
                    {isPreparingUploads
                      ? copy.preparingUploadedFiles
                      : isTranslating
                      ? copy.translationInProgress
                      : translationOutputs.length > 0
                        ? copy.translationOutputsReady
                        : copy.readyToTranslate}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--muted-soft)]">
                    {isPreparingUploads
                      ? copy.zipAnalyzing
                      : isTranslating
                      ? currentTaskLabel ?? copy.preparingJobs
                      : translationOutputs.length > 0
                        ? copy.readyOutputs(translationOutputs.length)
                        : copy.defaultRunDesc}
                  </p>
                </div>

                <div className="min-w-[120px] text-right">
                  <p className="text-[11.5px] font-medium text-[var(--muted)]">
                    {isPreparingUploads ? copy.preparing : isTranslating ? `${translationProgress}%` : translationOutputs.length > 0 ? copy.complete : copy.idle}
                  </p>
                </div>
              </div>

              <ProgressBar
                value={isPreparingUploads ? 8 : isTranslating ? translationProgress : translationOutputs.length > 0 ? 100 : 0}
                size="sm"
                tone={
                  translationError && translationOutputs.length === 0
                    ? "danger"
                    : isPreparingUploads || isTranslating
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
                    {[copy.output, copy.target, copy.units, ""].map((label) => (
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
                          {output.warnings.length > 0 ? ` · ${copy.warningLabel(output.warnings.length)}` : ""}
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
                          {copy.download}
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
              {copy.files}
            </span>
            <div className="text-[12px] text-[var(--muted-soft)]">
              {locale === "de" ? "Quelle" : "Source"} {getLanguageLabel(project.sourceLanguage, locale)} ·{" "}
              {locale === "de" ? "Ziele" : "Targets"}{" "}
              {project.targetLanguages.map((targetLanguage) => getLanguageLabel(targetLanguage, locale)).join(", ")}
            </div>
          </div>
          <ProjectFilesTable files={displayFiles} title={null} onReviewFile={(file) => setReviewFileId(file.id)} />
        </section>

        {reviewFile ? (
          <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border-light)] px-[18px] py-3">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.review}
                </span>
                <h3 className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                  {reviewFile.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewFileId(null)}
                className="rounded-[7px] border border-[var(--border)] px-2.5 py-1.5 text-[12px] text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
              >
                {copy.close}
              </button>
            </div>

            <div className="grid gap-6 px-[18px] py-4 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-3">
                <ReviewMetaRow label={copy.languagePair} value={`${reviewFile.sourceLanguage.toUpperCase()} → ${reviewFile.targetLanguage.toUpperCase()}`} />
                <ReviewMetaRow label={copy.status} value={reviewFile.status} />
                <ReviewMetaRow label={copy.progress} value={formatPercent(reviewFile.progress)} />
                <ReviewMetaRow label={copy.words} value={formatCompactNumber(reviewFile.words, locale)} />
                <ReviewMetaRow label={copy.updated} value={formatProjectDate(reviewFile.lastUpdated, locale)} />
              </div>

              <div className="min-w-0">
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--foreground)]">
                        {copy.reviewSideBySide}
                      </p>
                      <p className="mt-1 text-[12px] text-[var(--muted-soft)]">
                        {copy.reviewDesc}
                      </p>
                    </div>
                    {reviewOutput ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadOutput(reviewOutput)}
                        className="rounded-[7px] border border-[var(--border)] px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                      >
                        {copy.downloadOutput}
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <ReviewContentPanel
                      label={copy.original}
                      helperText={
                        reviewSourceFile
                          ? copy.originalLoaded
                          : copy.originalUnavailableHelper
                      }
                      content={reviewSourceFile?.content ?? null}
                      emptyTitle={copy.originalUnavailable}
                      emptyText={copy.originalUnavailableDesc}
                    />

                    <ReviewContentPanel
                      label={copy.translated}
                      helperText={
                        reviewOutput
                          ? copy.translatedHelper(reviewFile.targetLanguage)
                          : copy.translatedUnavailableHelper
                      }
                      content={reviewOutput?.translatedContent ?? null}
                      emptyTitle={copy.translatedUnavailable}
                      emptyText={copy.translatedUnavailableDesc}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[10px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-[18px] py-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.workspaceStats}
              </span>
            </div>
            <div className="space-y-3 px-[18px] py-4">
              <StatRow label={copy.glossaryEnabled} value={project.glossaryEnabled ? copy.yes : copy.no} />
              <StatRow label={copy.creditsUsed} value={formatCompactNumber(project.creditsUsed, locale)} />
              <StatRow
                label={copy.qualityScoreAverage}
                value={project.qualityScore > 0 ? `${project.qualityScore}/100` : copy.pending}
              />
              <StatRow
                label={copy.latestExport}
                value={
                  project.latestExport
                    ? `${project.latestExport.label} · ${project.latestExport.format}`
                    : copy.noExport
                }
              />
              <StatRow label={copy.lastUpdated} value={formatProjectDate(project.lastUpdated, locale)} />
            </div>
          </div>

          <div className="rounded-[10px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-[18px] py-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.recentActivity}
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
                    {formatProjectDate(activity.timestamp, locale)}
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
  return /\.(xliff|xlf|po|strings|resx|xml|txt)$/i.test(fileName);
}

function buildRuntimeFileId(sourceFileId: string, targetLanguage: string) {
  return `runtime:${sourceFileId}:${targetLanguage}`;
}

function getClientFileId(logicalName: string, file: File) {
  return `${logicalName}-${file.size}-${file.lastModified}`;
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
        content: sourceFile.content,
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

function buildTranslationBundleFileName(projectId: string) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  return `${projectId}-translations-${dateStamp}.zip`;
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(fileName, blob);
}

function downloadBlob(fileName: string, blob: Blob) {
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

function ReviewMetaRow({
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

function ReviewContentPanel({
  label,
  helperText,
  content,
  emptyTitle,
  emptyText
}: {
  label: string;
  helperText: string;
  content: string | null;
  emptyTitle: string;
  emptyText: string;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-[var(--border-light)] bg-[var(--background)]">
      <div className="border-b border-[var(--border-light)] px-4 py-3">
        <p className="text-[12px] font-medium text-[var(--foreground)]">{label}</p>
        <p className="mt-1 text-[11.5px] text-[var(--muted-soft)]">{helperText}</p>
      </div>

      {content ? (
        <pre className="max-h-[460px] overflow-auto p-4 text-[11.5px] leading-6 text-[var(--foreground)]">
          <code>{content}</code>
        </pre>
      ) : (
        <div className="px-4 py-4">
          <p className="text-[13px] font-medium text-[var(--foreground)]">{emptyTitle}</p>
          <p className="mt-1 text-[12px] text-[var(--muted-soft)]">{emptyText}</p>
        </div>
      )}
    </section>
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
