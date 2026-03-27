import JSZip from "jszip";
import { XMLSerializer } from "@xmldom/xmldom";

import { containsMeaningfulText } from "@/lib/masking/tokens";
import { parseXmlDocument } from "@/lib/xliff/parser";
import { TranslationPipelineError } from "@/types/translation";

export type OfficeArchiveFormat = "docx" | "pptx";

type OfficeUnit = {
  id: string;
  sourceText: string;
  entryName: string;
  nodePath: number[];
};

export type ParsedOfficeDocument = {
  units: OfficeUnit[];
  previewText: string;
};

const serializer = new XMLSerializer();

export async function parseOfficeDocument(
  buffer: ArrayBuffer,
  format: OfficeArchiveFormat
): Promise<ParsedOfficeDocument> {
  const archive = await loadArchive(buffer);
  const entryNames = getOfficeEntryNames(archive, format);
  const units: OfficeUnit[] = [];
  const previewTexts: string[] = [];

  for (const entryName of entryNames) {
    const entry = archive.file(entryName);

    if (!entry) {
      continue;
    }

    const xml = await entry.async("string");
    const { document, issues } = parseXmlDocument(xml);
    const blockingIssues = issues.filter((issue) => issue.level !== "warning");

    if (blockingIssues.length > 0) {
      throw new TranslationPipelineError(
        "malformed_xml",
        `The uploaded ${format.toUpperCase()} file contains invalid XML in ${entryName}.`,
        422
      );
    }

    const textElements = Array.from(document.getElementsByTagName("*")).filter((element) =>
      isTranslatableOfficeTextElement(element, format)
    );

    for (const element of textElements) {
      const sourceText = element.textContent ?? "";
      const normalizedSourceText = sourceText.trim();

      if (!containsMeaningfulText(normalizedSourceText)) {
        continue;
      }

      units.push({
        id: `${format}-${units.length + 1}`,
        sourceText,
        entryName,
        nodePath: buildNodePath(element)
      });
      previewTexts.push(normalizedSourceText);
    }
  }

  if (units.length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      `The uploaded ${format.toUpperCase()} file does not contain translatable text runs.`,
      422
    );
  }

  return {
    units,
    previewText: previewTexts.join("\n")
  };
}

export async function serializeTranslatedOffice(
  buffer: ArrayBuffer,
  parsedDocument: ParsedOfficeDocument,
  translations: Map<string, string>
) {
  const archive = await loadArchive(buffer);
  const unitsByEntryName = new Map<string, OfficeUnit[]>();

  for (const unit of parsedDocument.units) {
    const grouped = unitsByEntryName.get(unit.entryName) ?? [];
    grouped.push(unit);
    unitsByEntryName.set(unit.entryName, grouped);
  }

  for (const [entryName, entryUnits] of unitsByEntryName.entries()) {
    const entry = archive.file(entryName);

    if (!entry) {
      continue;
    }

    const xml = await entry.async("string");
    const { document, issues } = parseXmlDocument(xml);
    const blockingIssues = issues.filter((issue) => issue.level !== "warning");

    if (blockingIssues.length > 0) {
      throw new TranslationPipelineError(
        "malformed_xml",
        `Failed to rebuild ${entryName} while translating the Office document.`,
        500
      );
    }

    for (const unit of entryUnits) {
      const translatedText = translations.get(unit.id);

      if (typeof translatedText !== "string") {
        continue;
      }

      const node = resolveNodePath(document, unit.nodePath);

      if (!node || node.nodeType !== 1) {
        throw new TranslationPipelineError(
          "validation_error",
          "Failed to resolve an Office text node while rebuilding the file.",
          500,
          {
            unitInternalId: unit.id,
            entryName
          }
        );
      }

      node.textContent = translatedText;
    }

    archive.file(entryName, serializer.serializeToString(document));
  }

  return archive.generateAsync({ type: "uint8array" });
}

async function loadArchive(buffer: ArrayBuffer) {
  try {
    return await JSZip.loadAsync(buffer);
  } catch {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded Office file could not be opened as a ZIP package.",
      422
    );
  }
}

function getOfficeEntryNames(archive: JSZip, format: OfficeArchiveFormat) {
  const entryPattern =
    format === "docx"
      ? /^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/i
      : /^ppt\/slides\/slide\d+\.xml$/i;

  return Object.keys(archive.files)
    .filter((entryName) => entryPattern.test(entryName))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function isTranslatableOfficeTextElement(element: Element, format: OfficeArchiveFormat) {
  const localName = element.localName ?? element.nodeName.split(":").pop() ?? element.nodeName;
  return format === "docx" ? localName === "t" : localName === "t";
}

function buildNodePath(node: Node) {
  const path: number[] = [];
  let current: Node | null = node;

  while (current?.parentNode) {
    const siblings: NodeList = current.parentNode.childNodes;
    let index = -1;

    for (let siblingIndex = 0; siblingIndex < siblings.length; siblingIndex += 1) {
      if (siblings.item(siblingIndex) === current) {
        index = siblingIndex;
        break;
      }
    }

    path.unshift(index);
    current = current.parentNode;
  }

  return path;
}

function resolveNodePath(document: Document, path: number[]) {
  let current: Node | null = document;

  for (const index of path) {
    current = current?.childNodes.item(index) ?? null;
  }

  return current;
}
