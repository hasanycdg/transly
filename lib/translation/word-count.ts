import { GENERATED_TOKEN_PATTERN, maskProtectedTokens } from "@/lib/masking/tokens";
import { parseCsvDocument } from "@/lib/file-formats/csv";
import { parseOfficeDocument } from "@/lib/file-formats/office";
import { parsePoDocument } from "@/lib/file-formats/po";
import { parseResxDocument } from "@/lib/file-formats/resx";
import { parseStringsDocument } from "@/lib/file-formats/strings";
import { parseTxtDocument } from "@/lib/file-formats/txt";
import { parseXliffDocument } from "@/lib/xliff/parser";
import type { ParsedTranslationUnit } from "@/types/xliff";

const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu;
const LETTER_PATTERN = /\p{L}/u;

type CountableTextFormat = "xliff" | "po" | "strings" | "resx" | "csv" | "txt";

export function countMeaningfulWords(text: string): number {
  const { maskedText } = maskProtectedTokens(text);
  const normalized = maskedText
    .replace(GENERATED_TOKEN_PATTERN, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .trim();

  if (!normalized) {
    return 0;
  }

  const matches = normalized.match(WORD_PATTERN) ?? [];

  return matches.filter((token) => LETTER_PATTERN.test(token)).length;
}

export function countWordsFromTranslationUnits(
  units: Array<Pick<ParsedTranslationUnit, "sourceText">>
): number {
  return countWordsFromSourceTexts(units);
}

export function countWordsFromSourceTexts(
  units: Array<{ sourceText: string }>
): number {
  return units.reduce((sum, unit) => sum + countMeaningfulWords(unit.sourceText), 0);
}

export function estimateTranslationFileWordCount(fileName: string, content: string): number {
  const format = detectCountableTextFormat(fileName);

  if (!format) {
    return countMeaningfulTextContent(content);
  }

  try {
    return countWordsFromSourceTexts(parseTextDocumentUnits(format, content));
  } catch {
    return countMeaningfulTextContent(content);
  }
}

export async function estimateBinaryTranslationFileWordCount(
  fileName: string,
  buffer: ArrayBuffer
): Promise<number> {
  const format = detectOfficeFormat(fileName);

  if (!format) {
    return 0;
  }

  try {
    const parsedDocument = await parseOfficeDocument(buffer, format);
    return countWordsFromSourceTexts(parsedDocument.units);
  } catch {
    return 0;
  }
}

export function countMeaningfulTextContent(content: string) {
  return countMeaningfulWords(stripMarkup(content));
}

function stripMarkup(content: string) {
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTextDocumentUnits(format: CountableTextFormat, content: string) {
  switch (format) {
    case "xliff":
      return parseXliffDocument(content).units;
    case "po":
      return parsePoDocument(content).units;
    case "strings":
      return parseStringsDocument(content).units;
    case "resx":
      return parseResxDocument(content).units;
    case "csv":
      return parseCsvDocument(content).units;
    case "txt":
      return parseTxtDocument(content).units;
  }
}

function detectCountableTextFormat(fileName: string): CountableTextFormat | null {
  if (/\.(xliff|xlf)$/i.test(fileName)) {
    return "xliff";
  }

  if (/\.po$/i.test(fileName)) {
    return "po";
  }

  if (/\.strings$/i.test(fileName)) {
    return "strings";
  }

  if (/\.(resx|xml)$/i.test(fileName)) {
    return "resx";
  }

  if (/\.csv$/i.test(fileName)) {
    return "csv";
  }

  if (/\.txt$/i.test(fileName)) {
    return "txt";
  }

  return null;
}

function detectOfficeFormat(fileName: string) {
  if (/\.docx$/i.test(fileName)) {
    return "docx" as const;
  }

  if (/\.pptx$/i.test(fileName)) {
    return "pptx" as const;
  }

  return null;
}
