import { TranslationPipelineError } from "@/types/translation";

type StringsUnit = {
  id: string;
  sourceText: string;
  valueStart: number;
  valueEnd: number;
};

export type ParsedStringsDocument = {
  units: StringsUnit[];
};

const STRINGS_ENTRY_PATTERN =
  /("(?:\\.|[^"\\])*")(\s*=\s*")((?:\\.|[^"\\])*)("\s*;)/g;

export function parseStringsDocument(content: string): ParsedStringsDocument {
  const units: StringsUnit[] = [];

  for (const match of content.matchAll(STRINGS_ENTRY_PATTERN)) {
    const fullMatch = match[0] ?? "";
    const keyPart = match[1] ?? "";
    const middlePart = match[2] ?? "";
    const valuePart = match[3] ?? "";
    const start = match.index ?? -1;

    if (start < 0) {
      continue;
    }

    units.push({
      id: `strings-${units.length + 1}`,
      sourceText: unescapeStringsValue(valuePart),
      valueStart: start + keyPart.length + middlePart.length,
      valueEnd: start + keyPart.length + middlePart.length + valuePart.length
    });

    if (fullMatch.length === 0) {
      continue;
    }
  }

  if (units.length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded .strings file does not contain translatable entries.",
      422
    );
  }

  return { units };
}

export function serializeTranslatedStrings(
  originalContent: string,
  parsedDocument: ParsedStringsDocument,
  translations: Map<string, string>
) {
  let nextContent = originalContent;

  for (const unit of [...parsedDocument.units].sort((left, right) => right.valueStart - left.valueStart)) {
    const translatedText = translations.get(unit.id);

    if (typeof translatedText !== "string") {
      continue;
    }

    nextContent =
      nextContent.slice(0, unit.valueStart) +
      escapeStringsValue(translatedText) +
      nextContent.slice(unit.valueEnd);
  }

  return nextContent;
}

function unescapeStringsValue(value: string) {
  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

function escapeStringsValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
}
