"use client";

import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { getLanguageLabel } from "@/lib/projects/formatters";
import type { GlossaryScreenData, GlossaryStatus, NewGlossaryTermInput } from "@/types/glossary";

import { ImportCsvModal } from "@/components/glossary/import-csv-modal";
import { NewTermModal } from "@/components/glossary/new-term-modal";

type GlossaryScreenProps = {
  data: GlossaryScreenData;
};

const STATUS_FILTERS: Array<GlossaryStatus | "All"> = ["All", "Approved", "Review", "Draft", "Archived"];

export function GlossaryScreen({ data }: GlossaryScreenProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GlossaryStatus | "All">("All");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showNewTermModal, setShowNewTermModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [isCreatingTerm, setIsCreatingTerm] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);

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

  async function handleCreateTerm(input: NewGlossaryTermInput) {
    setCreateError(null);
    setFlashMessage(null);
    setIsCreatingTerm(true);

    try {
      const response = await fetch("/api/glossary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Glossary term could not be saved.");
      }

      setShowNewTermModal(false);
      setFlashMessage(`Saved glossary term "${input.source}".`);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Glossary term could not be saved.");
    } finally {
      setIsCreatingTerm(false);
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
        throw new Error(payload?.error ?? "Glossary CSV import failed.");
      }

      setShowImportModal(false);
      setFlashMessage(
        payload?.collectionCount
          ? `Imported ${payload.importedCount ?? 0} terms and created ${payload.collectionCount} collections.`
          : `Imported ${payload?.importedCount ?? 0} glossary terms.`
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Glossary CSV import failed.");
    } finally {
      setIsImportingCsv(false);
    }
  }

  return (
    <>
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-7 py-4">
          <div className="flex flex-col gap-[1px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              / Glossary
            </span>
            <h1 className="text-[18px] font-semibold tracking-[-0.4px] text-[var(--foreground)]">
              Glossary
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
              Import CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                setShowNewTermModal(true);
              }}
              className="rounded-[7px] bg-[var(--foreground)] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-85"
            >
              New Term
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
                      / Terms
                    </p>
                    <h2 className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                      Shared localization terms
                    </h2>
                  </div>
                  <div className="text-right text-[11.5px] text-[var(--muted-soft)]">
                    {filteredTerms.length} of {data.terms.length} terms
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_150px_170px_160px]">
                  <label className="relative">
                    <SearchIcon className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--muted-soft)]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search terms, translations, collections..."
                      className="w-full rounded-[7px] border border-[var(--border)] bg-white px-[10px] py-[8px] pl-[30px] text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                    />
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as GlossaryStatus | "All")}
                    className="w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                  >
                    {STATUS_FILTERS.map((status) => (
                      <option key={status} value={status}>
                        {status === "All" ? "All statuses" : status}
                      </option>
                    ))}
                  </select>

                  <select
                    value={collectionFilter}
                    onChange={(event) => setCollectionFilter(event.target.value)}
                    className="w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                  >
                    <option value="all">All collections</option>
                    <option value="shared">Shared glossary</option>
                    {data.collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                    className="w-full rounded-[7px] border border-[var(--border)] bg-white px-3 py-2 text-[12.5px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]"
                  >
                    <option value="all">All projects</option>
                    {data.projects.map((project) => (
                      <option key={project.id} value={project.slug}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_100px_150px_150px] border-b border-[var(--border-light)] bg-[var(--background)] px-[18px] py-[9px]">
                {["Source", "Translations", "Status", "Collection", "Project"].map((label) => (
                  <span
                    key={label}
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
                    className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_100px_150px_150px] items-center border-b border-[var(--border-light)] px-[18px] py-[13px] last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-[6px]">
                        <div className="text-[13px] font-medium text-[var(--foreground)]">{term.source}</div>
                        <span className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-2 py-[2px] text-[10.5px] font-medium uppercase tracking-[0.04em] text-[var(--muted-soft)]">
                          {term.sourceLanguage}
                        </span>
                        {term.isProtected ? (
                          <span className="rounded-[5px] border border-[var(--review-border)] bg-[var(--review-bg)] px-2 py-[2px] text-[10.5px] font-medium text-[var(--review)]">
                            Protected
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-[11.5px] text-[var(--muted-soft)]">
                        {getLanguageLabel(term.sourceLanguage)}
                      </div>
                    </div>

                    <div className="truncate pr-4 text-[11.5px] text-[var(--muted)]">
                      {term.translationsLabel}
                    </div>

                    <div>
                      <span className={getStatusClassName(term.status)}>{term.status}</span>
                    </div>

                    <div className="pr-4 text-[11.5px] text-[var(--muted-soft)]">
                      {term.collectionName ?? "Shared glossary"}
                    </div>

                    <div className="text-[11.5px] text-[var(--muted-soft)]">{term.project}</div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-[12px] text-[var(--muted-soft)]">
                  {data.terms.length > 0
                    ? "No glossary terms match the current filters."
                    : "No glossary terms have been added yet."}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[10px] border border-[var(--border)] bg-white">
                <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    / Collections
                  </p>
                </div>
                <div className="space-y-4 px-[18px] py-4">
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
                    <p className="text-[11.5px] text-[var(--muted-soft)]">No glossary collections yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[10px] border border-[var(--border)] bg-white">
                <div className="border-b border-[var(--border-light)] px-[18px] py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    / Guidance
                  </p>
                </div>
                <div className="space-y-3 px-[18px] py-4 text-[11.5px] text-[var(--muted)]">
                  <p>Use protected terms for brand names, product labels, and phrases that must stay locked.</p>
                  <p>Approved entries should contain translations for every target locale you expect to ship.</p>
                  <p>CSV import accepts `source`, optional metadata columns, and locale-based translation columns.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showNewTermModal ? (
        <NewTermModal
          open={showNewTermModal}
          collections={data.collections}
          projects={data.projects}
          onClose={() => {
            if (!isCreatingTerm) {
              setShowNewTermModal(false);
            }
          }}
          onCreate={handleCreateTerm}
          submitting={isCreatingTerm}
          errorMessage={createError}
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
