import { containsMeaningfulText } from "@/lib/masking/tokens";
import { TranslationPipelineError } from "@/types/translation";

type CsvCellUnit = {
  id: string;
  sourceText: string;
  rowIndex: number;
  cellIndex: number;
};

export type ParsedCsvDocument = {
  units: CsvCellUnit[];
  rows: string[][];
  delimiter: "," | ";" | "\t";
  newline: "\r\n" | "\n";
};

export function parseCsvDocument(content: string): ParsedCsvDocument {
  if (content.trim().length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded CSV file is empty.",
      422
    );
  }

  const rows = parseDelimitedRows(content);

  if (rows.length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded CSV file could not be parsed.",
      422
    );
  }

  const delimiter = detectDelimiter(rows);
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const units: CsvCellUnit[] = [];

  for (const [rowIndex, row] of rows.entries()) {
    for (const [cellIndex, cell] of row.entries()) {
      const normalizedCell = cell.trim();

      if (!shouldTranslateCsvCell(normalizedCell)) {
        continue;
      }

      units.push({
        id: `csv-${units.length + 1}`,
        sourceText: cell,
        rowIndex,
        cellIndex
      });
    }
  }

  if (units.length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded CSV file does not contain translatable text cells.",
      422
    );
  }

  return {
    units,
    rows,
    delimiter,
    newline
  };
}

export function serializeTranslatedCsv(
  parsedDocument: ParsedCsvDocument,
  translations: Map<string, string>
) {
  const nextRows = parsedDocument.rows.map((row) => [...row]);

  for (const unit of parsedDocument.units) {
    const translatedText = translations.get(unit.id);

    if (typeof translatedText !== "string") {
      continue;
    }

    if (!nextRows[unit.rowIndex]) {
      continue;
    }

    nextRows[unit.rowIndex][unit.cellIndex] = translatedText;
  }

  return nextRows
    .map((row) => row.map((cell) => escapeCsvCell(cell, parsedDocument.delimiter)).join(parsedDocument.delimiter))
    .join(parsedDocument.newline);
}

function parseDelimitedRows(content: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index] ?? "";
    const nextCharacter = content[index + 1] ?? "";

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && (character === "," || character === ";" || character === "\t")) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!inQuotes && character === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    if (!inQuotes && character === "\r" && nextCharacter === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      index += 1;
      continue;
    }

    currentCell += character;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.filter((row) => !(row.length === 1 && row[0] === "" && rows.length > 1));
}

function detectDelimiter(rows: string[][]): "," | ";" | "\t" {
  const sample = rows.slice(0, 8);
  const delimiterScores = new Map<"," | ";" | "\t", number>([
    [",", 0],
    [";", 0],
    ["\t", 0]
  ]);

  for (const row of sample) {
    for (const delimiter of delimiterScores.keys()) {
      delimiterScores.set(delimiter, Math.max(delimiterScores.get(delimiter) ?? 0, row.length));
    }
  }

  const [bestDelimiter] = [...delimiterScores.entries()].sort((left, right) => right[1] - left[1])[0] ?? [[",", 0]];
  return bestDelimiter;
}

function shouldTranslateCsvCell(value: string) {
  if (!containsMeaningfulText(value)) {
    return false;
  }

  if (/^[-+]?(\d+([.,]\d+)?|\d{1,4}[/-]\d{1,2}[/-]\d{1,4})$/.test(value)) {
    return false;
  }

  if (/^[=+\-@]/.test(value)) {
    return false;
  }

  return /[A-Za-zÀ-ÿ]/.test(value);
}

function escapeCsvCell(value: string, delimiter: "," | ";" | "\t") {
  if (
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r") ||
    value.includes(delimiter)
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
