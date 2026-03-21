import type {
  GlossaryStatus,
  NewGlossaryTermInput,
  NewGlossaryTranslationInput
} from "@/types/glossary";

export type ParsedGlossaryCsvRow = Omit<NewGlossaryTermInput, "collectionId" | "projectSlug"> & {
  collectionName: string | null;
  projectRef: string | null;
};

const SOURCE_HEADERS = ["source", "source_term", "term"];
const SOURCE_LANGUAGE_HEADERS = ["source_language", "sourcelanguage", "language"];
const STATUS_HEADERS = ["status"];
const PROTECTED_HEADERS = ["is_protected", "isprotected", "protected", "locked"];
const COLLECTION_HEADERS = ["collection", "collection_name", "collectionname"];
const PROJECT_HEADERS = ["project", "project_slug", "projectslug", "project_name", "projectname"];
const RESERVED_HEADERS = new Set([
  ...SOURCE_HEADERS,
  ...SOURCE_LANGUAGE_HEADERS,
  ...STATUS_HEADERS,
  ...PROTECTED_HEADERS,
  ...COLLECTION_HEADERS,
  ...PROJECT_HEADERS
]);

export function normalizeGlossaryStatus(value: string | null | undefined): GlossaryStatus {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case "approved":
      return "Approved";
    case "review":
    case "in review":
      return "Review";
    case "archived":
      return "Archived";
    case "draft":
    case "":
    case undefined:
    case null:
      return "Draft";
    default:
      throw new Error(`Unsupported glossary status "${value}".`);
  }
}

export function parseGlossaryBoolean(value: string | null | undefined): boolean {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  if (["true", "1", "yes", "y", "locked"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }

  throw new Error(`Unsupported glossary boolean value "${value}".`);
}

export function parseGlossaryCsv(csv: string): ParsedGlossaryCsvRow[] {
  const records = parseCsv(csv);

  if (records.length === 0) {
    throw new Error("CSV import is empty.");
  }

  const headerRow = records[0] ?? [];
  const headers = headerRow.map((header) => header.trim());
  const normalizedHeaders = headers.map(normalizeHeader);
  const sourceHeaderIndex = findHeaderIndex(normalizedHeaders, SOURCE_HEADERS);

  if (sourceHeaderIndex === -1) {
    throw new Error("CSV import must include a source column.");
  }

  const sourceLanguageHeaderIndex = findHeaderIndex(normalizedHeaders, SOURCE_LANGUAGE_HEADERS);
  const statusHeaderIndex = findHeaderIndex(normalizedHeaders, STATUS_HEADERS);
  const protectedHeaderIndex = findHeaderIndex(normalizedHeaders, PROTECTED_HEADERS);
  const collectionHeaderIndex = findHeaderIndex(normalizedHeaders, COLLECTION_HEADERS);
  const projectHeaderIndex = findHeaderIndex(normalizedHeaders, PROJECT_HEADERS);
  const translationColumns = headers
    .map((header, index) => ({
      index,
      locale: parseTranslationHeader(header)
    }))
    .filter((column): column is { index: number; locale: string } => Boolean(column.locale));

  const rows: ParsedGlossaryCsvRow[] = [];

  for (const [offset, record] of records.slice(1).entries()) {
    if (record.every((cell) => cell.trim().length === 0)) {
      continue;
    }

    const rowNumber = offset + 2;
    const source = getCell(record, sourceHeaderIndex).trim();

    if (!source) {
      throw new Error(`Row ${rowNumber}: source is required.`);
    }

    const sourceLanguage = getCell(record, sourceLanguageHeaderIndex).trim().toLowerCase() || "en";
    const status = normalizeGlossaryStatus(getCell(record, statusHeaderIndex));
    const isProtected = parseGlossaryBoolean(getCell(record, protectedHeaderIndex));
    const collectionName = getOptionalCell(record, collectionHeaderIndex);
    const projectRef = getOptionalCell(record, projectHeaderIndex);
    const translations = dedupeTranslations(
      translationColumns.flatMap((column) => {
        const term = getCell(record, column.index).trim();

        return term
          ? [
              {
                locale: column.locale,
                term
              }
            ]
          : [];
      })
    );

    rows.push({
      source,
      sourceLanguage,
      status,
      collectionName,
      projectRef,
      isProtected,
      translations
    });
  }

  if (rows.length === 0) {
    throw new Error("CSV import has headers but no glossary rows.");
  }

  return mergeGlossaryCsvRows(rows);
}

export function mergeGlossaryTranslations(
  translations: NewGlossaryTranslationInput[]
): NewGlossaryTranslationInput[] {
  return dedupeTranslations(
    translations.flatMap((translation) => {
      const locale = translation.locale.trim().toLowerCase();
      const term = translation.term.trim();

      return locale && term
        ? [
            {
              locale,
              term
            }
          ]
        : [];
    })
  );
}

function mergeGlossaryCsvRows(rows: ParsedGlossaryCsvRow[]) {
  const merged = new Map<string, ParsedGlossaryCsvRow>();

  for (const row of rows) {
    const key = `${row.sourceLanguage.toLowerCase()}::${row.source.trim().toLowerCase()}`;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, row);
      continue;
    }

    merged.set(key, {
      ...existing,
      source: row.source,
      sourceLanguage: row.sourceLanguage,
      status: row.status,
      isProtected: row.isProtected,
      collectionName: row.collectionName ?? existing.collectionName,
      projectRef: row.projectRef ?? existing.projectRef,
      translations: dedupeTranslations([...existing.translations, ...row.translations])
    });
  }

  return Array.from(merged.values());
}

function dedupeTranslations(translations: NewGlossaryTranslationInput[]) {
  const byLocale = new Map<string, NewGlossaryTranslationInput>();

  for (const translation of translations) {
    byLocale.set(translation.locale, translation);
  }

  return Array.from(byLocale.values()).sort((left, right) => left.locale.localeCompare(right.locale));
}

function parseTranslationHeader(header: string) {
  const trimmed = header.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = normalizeHeader(trimmed);

  if (RESERVED_HEADERS.has(normalized)) {
    return null;
  }

  const prefixedMatch = normalized.match(/^(?:translation|locale)[:_ -]([a-z]{2}(?:-[a-z]{2})?)$/i);

  if (prefixedMatch?.[1]) {
    return prefixedMatch[1].toLowerCase();
  }

  if (/^[a-z]{2}(?:-[a-z]{2})?$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return null;
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (inQuotes) {
      if (character === "\"") {
        if (csv[index + 1] === "\"") {
          currentField += "\"";
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += character;
      }

      continue;
    }

    if (character === "\"") {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (character === "\n") {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      continue;
    }

    if (character === "\r") {
      continue;
    }

    currentField += character;
  }

  if (inQuotes) {
    throw new Error("CSV import has an unclosed quoted field.");
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows[0]?.[0]?.charCodeAt(0) === 0xfeff) {
    rows[0][0] = rows[0][0].slice(1);
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().replace(/\s+/g, "_").toLowerCase();
}

function findHeaderIndex(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(header));
}

function getCell(record: string[], index: number) {
  return index >= 0 ? (record[index] ?? "") : "";
}

function getOptionalCell(record: string[], index: number) {
  const value = getCell(record, index).trim();

  return value || null;
}
