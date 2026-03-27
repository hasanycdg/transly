import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import { parseXmlDocument } from "@/lib/xliff/parser";
import { TranslationPipelineError } from "@/types/translation";

type ResxUnit = {
  id: string;
  sourceText: string;
  nodePath: number[];
};

export type ParsedResxDocument = {
  units: ResxUnit[];
};

const serializer = new XMLSerializer();

export function parseResxDocument(content: string): ParsedResxDocument {
  const { document, issues } = parseXmlDocument(content);
  const blockingIssues = issues.filter((issue) => issue.level !== "warning");

  if (blockingIssues.length > 0) {
    throw new TranslationPipelineError(
      "malformed_xml",
      "The uploaded RESX/XML file contains invalid XML.",
      422
    );
  }

  const units: ResxUnit[] = [];
  const dataNodes = Array.from(document.getElementsByTagName("*")).filter(
    (node) => getNodeLocalName(node) === "data"
  );

  for (const dataNode of dataNodes) {
    const valueNode = Array.from(dataNode.childNodes).find(
      (child): child is Element => child.nodeType === 1 && getNodeLocalName(child as Element) === "value"
    );

    if (!valueNode) {
      continue;
    }

    const sourceText = (valueNode.textContent ?? "").trim();

    if (!sourceText) {
      continue;
    }

    units.push({
      id: `resx-${units.length + 1}`,
      sourceText,
      nodePath: buildNodePath(valueNode)
    });
  }

  if (units.length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded RESX/XML file does not contain <data><value> entries to translate.",
      422
    );
  }

  return { units };
}

export function serializeTranslatedResx(
  originalContent: string,
  parsedDocument: ParsedResxDocument,
  translations: Map<string, string>
) {
  const parser = new DOMParser();
  const document = parser.parseFromString(originalContent, "application/xml");

  for (const unit of parsedDocument.units) {
    const translatedText = translations.get(unit.id);

    if (typeof translatedText !== "string") {
      continue;
    }

    const valueNode = resolveNodePath(document, unit.nodePath);

    if (!valueNode || valueNode.nodeType !== 1) {
      throw new TranslationPipelineError(
        "validation_error",
        "Failed to resolve a RESX/XML value node while rebuilding the file.",
        500,
        {
          unitInternalId: unit.id
        }
      );
    }

    valueNode.textContent = translatedText;
  }

  return serializer.serializeToString(document);
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

function getNodeLocalName(node: Element) {
  return node.localName ?? node.nodeName.split(":").pop() ?? node.nodeName;
}
