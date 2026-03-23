"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { translateGlossaryStatus } from "@/lib/i18n";
import { getLanguageLabel } from "@/lib/projects/formatters";
import type {
  GlossaryScreenData,
  GlossaryStatus,
  GlossaryTermItem,
  NewGlossaryCollectionInput,
  NewGlossaryTermInput
} from "@/types/glossary";

import { ImportCsvModal } from "@/components/glossary/import-csv-modal";
import { NewCollectionModal } from "@/components/glossary/new-collection-modal";
import { NewTermModal } from "@/components/glossary/new-term-modal";

type GlossaryScreenProps = {
  data: GlossaryScreenData;
};

const STATUS_FILTERS: Array<GlossaryStatus | "All"> = ["All", "Approved", "Review", "Draft", "Archived"];
const FILTER_GRID_CLASS =
  "mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]";
const TERMS_TABLE_GRID_CLASS =
  "grid grid-cols-[minmax(0,1.55fr)_72px_96px_minmax(0,1fr)_minmax(0,0.9fr)_76px] items-center gap-x-3";

export function GlossaryScreen({ data }: GlossaryScreenProps) {
  const locale = useAppLocale();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GlossaryStatus | "All">("All");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showNewTermModal, setShowNewTermModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTermItem | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreatingTerm, setIsCreatingTerm] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [deletingTermId, setDeletingTermId] = useState<string | null>(null);
  const copy =
    locale === "de"
      ? {
          saveError: "Der Glossarbegriff konnte nicht gespeichert werden.",
          updateFlash: (source: string) => `Glossarbegriff „${source}“ aktualisiert.`,
          saveFlash: (source: string) => `Glossarbegriff „${source}“ gespeichert.`,
          createCollectionError: "Die Glossarsammlung konnte nicht erstellt werden.",
          createCollectionFlash: (name: string) => `Sammlung „${name}“ erstellt.`,
          importFailed: "Der Glossar-CSV-Import ist fehlgeschlagen.",
          importFlash: (count: number, collectionCount?: number) =>
            collectionCount
              ? `${count} Begriffe importiert und ${collectionCount} Sammlungen erstellt.`
              : `${count} Glossarbegriffe importiert.`,
          deleteConfirm: (term: string) => `Glossarbegriff „${term}“ löschen?`,
          deleteFailed: "Der Glossarbegriff konnte nicht gelöscht werden.",
          deleteFlash: (term: string) => `Glossarbegriff „${term}“ gelöscht.`,
          eyebrow: "/ Glossar",
          heading: "Glossar",
          importCsv: "CSV importieren",
          newTerm: "Neuer Begriff",
          terms: "/ Begriffe",
          sharedTerms: "Geteilte Lokalisierungsbegriffe",
          termsCount: (filtered: number, total: number) => `${filtered} von ${total} Begriffen`,
          searchPlaceholder: "Begriffe, Übersetzungen, Sammlungen suchen...",
          allStatuses: "Alle Status",
          allCollections: "Alle Sammlungen",
          sharedGlossary: "Geteiltes Glossar",
          allProjects: "Alle Projekte",
          source: "Quelle",
          translations: "Übersetzungen",
          status: "Status",
          collection: "Sammlung",
          project: "Projekt",
          protected: "Geschützt",
          noLocales: "Keine Sprachen",
          shared: "Geteilt",
          edit: "Bearbeiten",
          deleting: "...",
          delete: "Löschen",
          noTermsFiltered: "Keine Glossarbegriffe entsprechen den aktuellen Filtern.",
          noTerms: "Es wurden noch keine Glossarbegriffe hinzugefügt.",
          collections: "/ Sammlungen",
          newCollection: "Neue Sammlung",
          collectionsNote: "Sammlungen sind optional. Nutze sie nur, wenn du Begriffe nach Feature, Marke oder Kunde gruppieren willst.",
          noCollections: "Noch keine Glossarsammlungen.",
          guidance: "/ Hinweise",
          guidanceLines: [
            "Nutze geschützte Begriffe für Markennamen, Produktlabels und Formulierungen, die gesperrt bleiben müssen.",
            "Freigegebene Einträge sollten Übersetzungen für jede Zielsprache enthalten, die du ausliefern willst.",
            "Sammlungen sind optionale Ordner. Wenn du keine Gruppierung brauchst, lass Begriffe im geteilten Glossar.",
            "Der CSV-Import akzeptiert `source`, optionale Metadaten-Spalten und sprachbasierte Übersetzungsspalten."
          ]
        }
      : {
          saveError: "Glossary term could not be saved.",
          updateFlash: (source: string) => `Updated glossary term "${source}".`,
          saveFlash: (source: string) => `Saved glossary term "${source}".`,
          createCollectionError: "Glossary collection could not be created.",
          createCollectionFlash: (name: string) => `Created collection "${name}".`,
          importFailed: "Glossary CSV import failed.",
          importFlash: (count: number, collectionCount?: number) =>
            collectionCount
              ? `Imported ${count} terms and created ${collectionCount} collections.`
              : `Imported ${count} glossary terms.`,
          deleteConfirm: (term: string) => `Delete glossary term "${term}"?`,
          deleteFailed: "Glossary term could not be deleted.",
          deleteFlash: (term: string) => `Deleted glossary term "${term}".`,
          eyebrow: "/ Glossary",
          heading: "Glossary",
          importCsv: "Import CSV",
          newTerm: "New Term",
          terms: "/ Terms",
          sharedTerms: "Shared localization terms",
          termsCount: (filtered: number, total: number) => `${filtered} of ${total} terms`,
          searchPlaceholder: "Search terms, translations, collections...",
          allStatuses: "All statuses",
          allCollections: "All collections",
          sharedGlossary: "Shared glossary",
          allProjects: "All projects",
          source: "Source",
          translations: "Translations",
          status: "Status",
          collection: "Collection",
          project: "Project",
          protected: "Protected",
          noLocales: "No locales",
          shared: "Shared",
          edit: "Edit",
          deleting: "...",
          delete: "Delete",
          noTermsFiltered: "No glossary terms match the current filters.",
          noTerms: "No glossary terms have been added yet.",
          collections: "/ Collections",
          newCollection: "New Collection",
          collectionsNote: "Collections are optional. Use them only if you want to group terms by feature, brand, or client.",
          noCollections: "No glossary collections yet.",
          guidance: "/ Guidance",
          guidanceLines: [
            "Use protected terms for brand names, product labels, and phrases that must stay locked.",
            "Approved entries should contain translations for every target locale you expect to ship.",
            "Collections are optional folders. If you do not need grouping, keep terms in the shared glossary.",
            "CSV import accepts `source`, optional metadata columns, and locale-based translation columns."
          ]
        };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!flashMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFlashMessage(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [flashMessage]);

  const filteredTerms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return data.terms.filter((term) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          term.source,
          term.sourceLanguage,
          term.translationsLabel,
          term.project,
          term.collectionName ?? ""
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus = statusFilter === "All" || term.status === statusFilter;
      const matchesCollection =
        collectionFilter === "all" ||
        (collectionFilter === "shared" ? term.collectionId === null : term.collectionId === collectionFilter);
      const matchesProject =
        projectFilter === "all" || term.projectSlugs.includes(projectFilter);

      return matchesSearch && matchesStatus && matchesCollection && matchesProject;
    });
  }, [collectionFilter, data.terms, projectFilter, search, statusFilter]);

  if (!isHydrated) {
    return <GlossaryScreenFallback data={data} />;
  }

  async function handleSaveTerm(input: NewGlossaryTermInput) {
    setCreateError(null);
    setFlashMessage(null);
    setIsCreatingTerm(true);

    try {
      const isEditing = Boolean(editingTerm);
      const response = await fetch(isEditing ? `/api/glossary/${editingTerm?.id}` : "/api/glossary", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.saveError);
      }

      setShowNewTermModal(false);
      setEditingTerm(null);
      setFlashMessage(isEditing ? copy.updateFlash(input.source) : copy.saveFlash(input.source));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : copy.saveError);
    } finally {
      setIsCreatingTerm(false);
    }
  }

  async function handleCreateCollection(input: NewGlossaryCollectionInput) {
    setCollectionError(null);
    setFlashMessage(null);
    setIsCreatingCollection(true);

    try {
      const response = await fetch("/api/glossary/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.createCollectionError);
      }

      setShowCollectionModal(false);
      setFlashMessage(copy.createCollectionFlash(input.name));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setCollectionError(
        error instanceof Error ? error.message : copy.createCollectionError
      );
    } finally {
      setIsCreatingCollection(false);
    }
  }

  async function handleImportCsv(csv: string) {
    setImportError(null);
    setFlashMessage(null);
    setIsImportingCsv(true);

    try {
      const response = await fetch("/api/glossary/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ csv })
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            importedCount?: number;
            collectionCount?: number;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.importFailed);
      }

      setShowImportModal(false);
      setFlashMessage(copy.importFlash(payload?.importedCount ?? 0, payload?.collectionCount));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : copy.importFailed);
    } finally {
      setIsImportingCsv(false);
    }
  }

  async function handleDeleteTerm(term: GlossaryTermItem) {
    if (deletingTermId) {
      return;
    }

    const confirmed = window.confirm(copy.deleteConfirm(term.source));

    if (!confirmed) {
      return;
    }

    setFlashMessage(null);
    setDeletingTermId(term.id);

    try {
      const response = await fetch(`/api/glossary/${term.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.deleteFailed);
      }

      setFlashMessage(copy.deleteFlash(term.source));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : copy.deleteFailed);
    } finally {
      setDeletingTermId(null);
    }
  }

  return (
    <>
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
          <div className="flex flex-col gap-[1px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.eyebrow}
            </span>
            <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
              {copy.heading}
            </h1>
          </div>

          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              onClick={() => {
                setImportError(null);
                setShowImportModal(true);
              }}
              className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              {copy.importCsv}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                setEditingTerm(null);
                setShowNewTermModal(true);
              }}
              className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-85"
            >
              {copy.newTerm}
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-6 px-7 py-6">
          {flashMessage ? (
            <div className="rounded-[10px] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-[12.5px] text-[var(--success)]">
              {flashMessage}
            </div>
          ) : null}

          <section className="grid grid-cols-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map((metric) => (
              <MetricCell key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.85fr)]">
            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                      {copy.terms}
                    </p>
                    <h2 className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                      {copy.sharedTerms}
                    </h2>
                  </div>
                  <div className="text-right text-[11.5px] text-[var(--muted-soft)]">
                    {copy.termsCount(filteredTerms.length, data.terms.length)}
                  </div>
                </div>

                <div className={FILTER_GRID_CLASS}>
                  <label className="relative min-w-0">
                    <SearchIcon className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--muted-soft)]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={copy.searchPlaceholder}
                      className="w-full rounded-[7px] border border-[var(--border)] bg-white px-[10px] py-[8px] pl-[30px] text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                    />
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as GlossaryStatus | "All")}
                    className="min-w-0 w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                  >
                    {STATUS_FILTERS.map((status) => (
                      <option key={status} value={status}>
                        {status === "All" ? copy.allStatuses : translateGlossaryStatus(status, locale)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={collectionFilter}
                    onChange={(event) => setCollectionFilter(event.target.value)}
                    className="min-w-0 w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                  >
                    <option value="all">{copy.allCollections}</option>
                    <option value="shared">{copy.sharedGlossary}</option>
                    {data.collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                    className="min-w-0 w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                  >
                    <option value="all">{copy.allProjects}</option>
                    {data.projects.map((project) => (
                      <option key={project.id} value={project.slug}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className={[
                  TERMS_TABLE_GRID_CLASS,
                  "border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]"
                ].join(" ")}
              >
                {[copy.source, copy.translations, copy.status, copy.collection, copy.project, ""].map((label) => (
                  <span
                    key={label || "actions"}
                    className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {filteredTerms.length > 0 ? (
                filteredTerms.map((term) => (
                  <div
                    key={term.id}
                    className={[
                      TERMS_TABLE_GRID_CLASS,
                      "border-b border-[var(--border-light)] px-[18px] py-[13px] last:border-b-0"
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-[6px]">
                        <div className="truncate text-[13px] font-medium text-[var(--foreground)]" title={term.source}>
                          {term.source}
                        </div>
                        <span className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-2 py-[2px] text-[10.5px] font-medium uppercase tracking-[0.04em] text-[var(--muted-soft)]">
                          {term.sourceLanguage}
                        </span>
                        {term.isProtected ? (
                          <span className="rounded-[5px] border border-[var(--review-border)] bg-[var(--review-bg)] px-2 py-[2px] text-[10.5px] font-medium text-[var(--review)]">
                            {copy.protected}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 truncate text-[11.5px] text-[var(--muted-soft)]">
                        {getLanguageLabel(term.sourceLanguage, locale)}
                      </div>
                    </div>

                    <div className="truncate text-[11.5px] text-[var(--muted)]" title={term.translationsLabel}>
                      {term.translations.length > 0
                        ? term.translations.map((translation) => translation.locale.toUpperCase()).join(", ")
                        : copy.noLocales}
                    </div>

                    <div>
                      <span className={getStatusClassName(term.status)}>{translateGlossaryStatus(term.status, locale)}</span>
                    </div>

                    <div
                      className="truncate text-[11.5px] text-[var(--muted-soft)]"
                      title={term.collectionName ?? copy.sharedGlossary}
                    >
                      {term.collectionName ?? copy.shared}
                    </div>

                    <div className="truncate text-[11.5px] text-[var(--muted-soft)]" title={term.project}>
                      {term.project}
                    </div>

                    <div className="flex flex-col items-stretch gap-[6px]">
                      <button
                        type="button"
                        onClick={() => {
                          setCreateError(null);
                          setEditingTerm(term);
                          setShowNewTermModal(true);
                        }}
                        className="rounded-[6px] border border-[var(--border)] px-[8px] py-[5px] text-[11px] font-medium text-[var(--muted)] transition hover:border-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        {copy.edit}
                      </button>
                      <button
                        type="button"
                        disabled={deletingTermId === term.id}
                        onClick={() => void handleDeleteTerm(term)}
                        className="rounded-[6px] border border-[var(--error-border)] px-[8px] py-[5px] text-[11px] font-medium text-[var(--error)] transition hover:bg-[var(--error-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingTermId === term.id ? copy.deleting : copy.delete}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-[12px] text-[var(--muted-soft)]">
                  {data.terms.length > 0
                    ? copy.noTermsFiltered
                    : copy.noTerms}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[10px] border border-[var(--border)] bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] px-[18px] py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    {copy.collections}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCollectionError(null);
                      setShowCollectionModal(true);
                    }}
                    className="rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                  >
                    {copy.newCollection}
                  </button>
                </div>
                <div className="space-y-4 px-[18px] py-4">
                  <p className="text-[11.5px] text-[var(--muted-soft)]">
                    {copy.collectionsNote}
                  </p>
                  {data.collections.length > 0 ? (
                    data.collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="rounded-[8px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[12px] font-medium text-[var(--foreground)]">{collection.name}</p>
                          <span className="text-[11.5px] text-[var(--muted)]">{collection.count}</span>
                        </div>
                        <p className="mt-2 text-[11.5px] text-[var(--muted-soft)]">
                          {collection.detail}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11.5px] text-[var(--muted-soft)]">{copy.noCollections}</p>
                  )}
                </div>
              </div>

              <div className="rounded-[10px] border border-[var(--border)] bg-white">
                <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    {copy.guidance}
                  </p>
                </div>
                <div className="space-y-3 px-[18px] py-4 text-[11.5px] text-[var(--muted)]">
                  {copy.guidanceLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showNewTermModal ? (
        <NewTermModal
          key={editingTerm?.id ?? "new-term"}
          open={showNewTermModal}
          collections={data.collections}
          projects={data.projects}
          onClose={() => {
            if (!isCreatingTerm) {
              setShowNewTermModal(false);
              setEditingTerm(null);
            }
          }}
          onCreate={handleSaveTerm}
          submitting={isCreatingTerm}
          errorMessage={createError}
          mode={editingTerm ? "edit" : "create"}
          initialTerm={editingTerm}
        />
      ) : null}

      {showCollectionModal ? (
        <NewCollectionModal
          open={showCollectionModal}
          onClose={() => {
            if (!isCreatingCollection) {
              setShowCollectionModal(false);
            }
          }}
          onCreate={handleCreateCollection}
          submitting={isCreatingCollection}
          errorMessage={collectionError}
        />
      ) : null}

      {showImportModal ? (
        <ImportCsvModal
          open={showImportModal}
          onClose={() => {
            if (!isImportingCsv) {
              setShowImportModal(false);
            }
          }}
          onImport={handleImportCsv}
          submitting={isImportingCsv}
          errorMessage={importError}
        />
      ) : null}
    </>
  );
}

function MetricCell({
  label,
  meta,
  value
}: {
  label: string;
  meta: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-[3px] bg-white px-[18px] py-4">
      <div className="text-[26px] font-semibold leading-none tracking-[-1.5px] text-[var(--foreground)]">
        {value}
      </div>
      <div className="text-[12px] text-[var(--muted-soft)]">{label}</div>
      <div className="mt-[5px] text-[11px] text-[var(--muted-soft)]">{meta}</div>
    </div>
  );
}

function GlossaryScreenFallback({ data }: GlossaryScreenProps) {
  const locale = useAppLocale();
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Glossar",
          heading: "Glossar",
          terms: "/ Begriffe",
          sharedTerms: "Geteilte Lokalisierungsbegriffe",
          termCount: (count: number) => `${count} Begriffe`,
          source: "Quelle",
          translations: "Übersetzungen",
          status: "Status",
          collection: "Sammlung",
          project: "Projekt",
          collections: "/ Sammlungen",
          guidance: "/ Hinweise"
        }
      : {
          eyebrow: "/ Glossary",
          heading: "Glossary",
          terms: "/ Terms",
          sharedTerms: "Shared localization terms",
          termCount: (count: number) => `${count} terms`,
          source: "Source",
          translations: "Translations",
          status: "Status",
          collection: "Collection",
          project: "Project",
          collections: "/ Collections",
          guidance: "/ Guidance"
        };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
        <div className="flex flex-col gap-[1px]">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            {copy.eyebrow}
          </span>
          <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
            {copy.heading}
          </h1>
        </div>

        <div className="flex items-center gap-[6px]">
          <div className="h-[40px] w-[108px] rounded-[7px] border border-[var(--border)] bg-white" />
          <div className="h-[40px] w-[102px] rounded-[7px] bg-[var(--foreground)] opacity-90" />
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="grid grid-cols-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <MetricCell key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.85fr)]">
          <div className="rounded-[10px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-[18px] py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    {copy.terms}
                  </p>
                  <h2 className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                    {copy.sharedTerms}
                  </h2>
                </div>
                <div className="text-right text-[11.5px] text-[var(--muted-soft)]">
                  {copy.termCount(data.terms.length)}
                </div>
              </div>

              <div className={FILTER_GRID_CLASS}>
                <div className="h-[42px] rounded-[7px] border border-[var(--border)] bg-white" />
                <div className="h-[42px] rounded-[7px] border border-[var(--border)] bg-white" />
                <div className="h-[42px] rounded-[7px] border border-[var(--border)] bg-white" />
                <div className="h-[42px] rounded-[7px] border border-[var(--border)] bg-white" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div
                  className={[
                    TERMS_TABLE_GRID_CLASS,
                    "border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]"
                  ].join(" ")}
                >
                  {[copy.source, copy.translations, copy.status, copy.collection, copy.project, ""].map((label) => (
                    <span
                      key={label || "actions"}
                      className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {Array.from({ length: Math.max(1, Math.min(3, data.terms.length || 1)) }).map((_, index) => (
                  <div
                    key={index}
                    className={[
                      TERMS_TABLE_GRID_CLASS,
                      "border-b border-[var(--border-light)] px-[18px] py-[13px] last:border-b-0"
                    ].join(" ")}
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-[var(--background)]" />
                      <div className="h-3 w-16 rounded bg-[var(--background)]" />
                    </div>
                    <div className="h-4 w-16 rounded bg-[var(--background)]" />
                    <div className="h-8 w-20 rounded-[6px] bg-[var(--background)]" />
                    <div className="h-4 w-24 rounded bg-[var(--background)]" />
                    <div className="h-4 w-16 rounded bg-[var(--background)]" />
                    <div className="flex justify-end gap-[6px]">
                      <div className="h-8 w-16 rounded-[6px] bg-[var(--background)]" />
                      <div className="h-8 w-20 rounded-[6px] bg-[var(--background)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.collections}
                </p>
                <div className="h-[40px] w-[124px] rounded-[7px] border border-[var(--border)] bg-white" />
              </div>
              <div className="space-y-4 px-[18px] py-4">
                <div className="h-4 w-3/4 rounded bg-[var(--background)]" />
                <div className="h-16 rounded-[8px] bg-[var(--background)]" />
              </div>
            </div>

            <div className="rounded-[10px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.guidance}
                </p>
              </div>
              <div className="space-y-3 px-[18px] py-4">
                <div className="h-4 w-full rounded bg-[var(--background)]" />
                <div className="h-4 w-11/12 rounded bg-[var(--background)]" />
                <div className="h-4 w-10/12 rounded bg-[var(--background)]" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6.25" cy="6.25" r="4.75" stroke="currentColor" strokeWidth="1.3" />
      <path d="m9.75 9.75 2.75 2.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function getStatusClassName(status: GlossaryStatus) {
  switch (status) {
    case "Approved":
      return "inline-flex rounded-[5px] border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-[3px] text-[11.5px] font-medium text-[var(--success)]";
    case "Review":
      return "inline-flex rounded-[5px] border border-[var(--review-border)] bg-[var(--review-bg)] px-2 py-[3px] text-[11.5px] font-medium text-[var(--review)]";
    case "Archived":
      return "inline-flex rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-2 py-[3px] text-[11.5px] font-medium text-[var(--muted-soft)]";
    case "Draft":
    default:
      return "inline-flex rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-2 py-[3px] text-[11.5px] font-medium text-[var(--muted)]";
  }
}
