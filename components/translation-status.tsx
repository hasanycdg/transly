import type { TranslationApiSuccess } from "@/types/translation";
import type { XliffWarning } from "@/types/xliff";

type TranslationStatusProps = {
  isLoading: boolean;
  error: string | null;
  errorCode?: string | null;
  result: TranslationApiSuccess | null;
  warnings: XliffWarning[];
};

export function TranslationStatus({
  isLoading,
  error,
  errorCode,
  result,
  warnings
}: TranslationStatusProps) {
  const tone = error ? "error" : result ? "success" : isLoading ? "loading" : "idle";

  return (
    <section
      className={[
        "rounded-[32px] border p-6 shadow-[var(--shadow)] backdrop-blur",
        tone === "error"
          ? "border-[color:var(--danger-soft)] bg-[color:rgba(255,247,244,0.9)]"
          : tone === "success"
            ? "border-[color:var(--accent-soft)] bg-[color:rgba(245,255,252,0.9)]"
            : "border-[var(--border)] bg-[var(--surface)]"
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Status</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {isLoading
              ? "Translating your file"
              : error
                ? "Translation blocked"
                : result
                  ? "Translated file ready"
                  : "Ready for upload"}
          </h2>
        </div>
        <div
          className={[
            "h-3 w-3 rounded-full",
            isLoading
              ? "bg-[var(--warning)]"
              : error
                ? "bg-[var(--danger)]"
                : result
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--muted)]"
          ].join(" ")}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {isLoading
          ? "The file is being parsed, masked, translated, and rebuilt in memory."
          : error
            ? error
            : result
              ? "The structure passed validation and the translated XLIFF is ready to download."
              : "Upload a single XLIFF file, select a target language, and run the translation pipeline."}
      </p>

      {errorCode ? (
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--danger)]">
          {errorCode.replaceAll("_", " ")}
        </p>
      ) : null}

      {result ? (
        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-3xl border border-[var(--border)] bg-white/70 p-4 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Detected source</dt>
            <dd className="mt-1 font-medium text-[var(--foreground)]">
              {result.detectedSourceLanguage}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Target</dt>
            <dd className="mt-1 font-medium text-[var(--foreground)]">
              {result.detectedTargetLanguage}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">XLIFF version</dt>
            <dd className="mt-1 font-medium text-[var(--foreground)]">{result.xliffVersion}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Units written</dt>
            <dd className="mt-1 font-medium text-[var(--foreground)]">
              {result.translatedUnitCount}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Validation notes</h3>
        {warnings.length > 0 ? (
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.code}-${warning.unitInternalId ?? "doc"}-${index}`}
                className="rounded-2xl border border-[var(--border)] bg-white/65 px-4 py-3"
              >
                <span className="font-medium text-[var(--foreground)]">{warning.code}</span>
                <span className="ml-2">{warning.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-[var(--border)] bg-white/65 px-4 py-3 text-sm text-[var(--muted)]">
            No validation warnings yet.
          </p>
        )}
      </div>
    </section>
  );
}
