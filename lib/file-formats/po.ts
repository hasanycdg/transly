import { containsMeaningfulText } from "@/lib/masking/tokens";
import { TranslationPipelineError } from "@/types/translation";
import type { XliffWarning } from "@/types/xliff";

type PoUnit = {
  id: string;
  sourceText: string;
  msgstrStart: number;
  msgstrEnd: number;
  msgstrHasTrailingNewline: boolean;
};

export type ParsedPoDocument = {
  units: PoUnit[];
  warnings: XliffWarning[];
};

type PoLine = {
  raw: string;
  text: string;
  start: number;
  end: number;
};

export function parsePoDocument(content: string): ParsedPoDocument {
  const lines = splitLines(content);
  const units: PoUnit[] = [];
  const warnings: XliffWarning[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^msgid(?:\s|")/.test(lines[index]?.text ?? "")) {
      continue;
    }

    const msgid = readPoStringBlock(lines, index, /^msgid(?:\s|")/);
    let cursor = msgid.nextIndex;

    if (/^msgid_plural(?:\s|")/.test(lines[cursor]?.text ?? "")) {
      warnings.push({
        code: "unsupported_unit_structure",
        message: "Skipped a pluralized PO entry because plural writeback is not implemented yet.",
        unitInternalId: `po-${index + 1}`
      });
      index = moveToNextPoEntry(lines, cursor);
      continue;
    }

    while (
      cursor < lines.length &&
      !/^msgstr(?:\[\d+\])?(?:\s|")/.test(lines[cursor]?.text ?? "") &&
      !/^msgid(?:\s|")/.test(lines[cursor]?.text ?? "")
    ) {
      cursor += 1;
    }

    if (!/^msgstr(?:\[\d+\])?(?:\s|")/.test(lines[cursor]?.text ?? "")) {
      continue;
    }

    const msgstr = readPoStringBlock(lines, cursor, /^msgstr(?:\[\d+\])?(?:\s|")/);

    if (!containsMeaningfulText(msgid.value)) {
      index = msgstr.nextIndex - 1;
      continue;
    }

    units.push({
      id: `po-${units.length + 1}`,
      sourceText: msgid.value,
      msgstrStart: msgstr.start,
      msgstrEnd: msgstr.end,
      msgstrHasTrailingNewline: content.slice(msgstr.start, msgstr.end).endsWith("\n")
    });

    index = msgstr.nextIndex - 1;
  }

  if (units.length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded PO file does not contain translatable singular entries.",
      422
    );
  }

  return {
    units,
    warnings
  };
}

export function serializeTranslatedPo(
  originalContent: string,
  parsedDocument: ParsedPoDocument,
  translations: Map<string, string>
) {
  let nextContent = originalContent;

  for (const unit of [...parsedDocument.units].sort((left, right) => right.msgstrStart - left.msgstrStart)) {
    const translatedText = translations.get(unit.id);

    if (typeof translatedText !== "string") {
      continue;
    }

    const replacement = formatPoStringBlock(translatedText, unit.msgstrHasTrailingNewline);
    nextContent =
      nextContent.slice(0, unit.msgstrStart) +
      replacement +
      nextContent.slice(unit.msgstrEnd);
  }

  return nextContent;
}

function splitLines(content: string): PoLine[] {
  const lines = content.match(/.*?(?:\r\n|\n|$)/g) ?? [];
  const resolved: PoLine[] = [];
  let offset = 0;

  for (const raw of lines) {
    if (raw.length === 0) {
      continue;
    }

    resolved.push({
      raw,
      text: raw.replace(/\r?\n$/, ""),
      start: offset,
      end: offset + raw.length
    });
    offset += raw.length;
  }

  return resolved;
}

function readPoStringBlock(lines: PoLine[], startIndex: number, labelPattern: RegExp) {
  const firstLine = lines[startIndex];

  if (!firstLine || !labelPattern.test(firstLine.text)) {
    throw new TranslationPipelineError(
      "validation_error",
      "Failed to parse a PO string block.",
      422
    );
  }

  const valueParts: string[] = [extractQuotedString(firstLine.text)];
  let nextIndex = startIndex + 1;

  while (/^"/.test(lines[nextIndex]?.text ?? "")) {
    valueParts.push(extractQuotedString(lines[nextIndex]!.text));
    nextIndex += 1;
  }

  return {
    value: valueParts.join(""),
    start: firstLine.start,
    end: lines[nextIndex - 1]?.end ?? firstLine.end,
    nextIndex
  };
}

function moveToNextPoEntry(lines: PoLine[], startIndex: number) {
  let index = startIndex;

  while (index < lines.length && !/^msgid(?:\s|")/.test(lines[index]?.text ?? "")) {
    index += 1;
  }

  return Math.max(index - 1, startIndex);
}

function extractQuotedString(line: string) {
  const match = line.match(/"((?:\\.|[^"\\])*)"/);

  if (!match) {
    return "";
  }

  return unescapePoString(match[1] ?? "");
}

function unescapePoString(value: string) {
  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

function escapePoString(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
}

function formatPoStringBlock(value: string, includeTrailingNewline: boolean) {
  const escaped = escapePoString(value);
  return `msgstr "${escaped}"${includeTrailingNewline ? "\n" : ""}`;
}
