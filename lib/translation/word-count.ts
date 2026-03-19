import { GENERATED_TOKEN_PATTERN, maskProtectedTokens } from "@/lib/masking/tokens";
import type { ParsedTranslationUnit } from "@/types/xliff";

const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu;

export function countMeaningfulWords(text: string): number {
  const { maskedText } = maskProtectedTokens(text);
  const normalized = maskedText
    .replace(GENERATED_TOKEN_PATTERN, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .trim();

  if (!normalized) {
    return 0;
  }

  return normalized.match(WORD_PATTERN)?.length ?? 0;
}

export function countWordsFromTranslationUnits(
  units: Array<Pick<ParsedTranslationUnit, "sourceText">>
): number {
  return units.reduce((sum, unit) => sum + countMeaningfulWords(unit.sourceText), 0);
}

export function estimateTranslationFileWordCount(fileName: string, content: string): number {
  if (isXliffFileName(fileName) && typeof DOMParser !== "undefined") {
    const xliffCount = estimateBrowserXliffWordCount(content);

    if (xliffCount !== null) {
      return xliffCount;
    }
  }

  return countMeaningfulTextContent(content);
}

export function countMeaningfulTextContent(content: string) {
  return countMeaningfulWords(stripMarkup(content));
}

function estimateBrowserXliffWordCount(content: string) {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(content, "application/xml");

    if (hasParserError(document)) {
      return null;
    }

    let total = 0;
    const transUnits = getDescendantElementsByLocalName(document, "trans-unit");

    for (const transUnit of transUnits) {
      const source = getFirstChildElementByLocalName(transUnit, "source");

      if (source) {
        total += countMeaningfulWords(getNormalizedTextContent(source));
      }
    }

    const unitElements = getDescendantElementsByLocalName(document, "unit");

    for (const unitElement of unitElements) {
      const segments = getChildElementsByLocalName(unitElement, "segment");

      if (segments.length > 0) {
        for (const segment of segments) {
          const source = getFirstChildElementByLocalName(segment, "source");

          if (source) {
            total += countMeaningfulWords(getNormalizedTextContent(source));
          }
        }

        continue;
      }

      const source = getFirstChildElementByLocalName(unitElement, "source");

      if (source) {
        total += countMeaningfulWords(getNormalizedTextContent(source));
      }
    }

    return total;
  } catch {
    return null;
  }
}

function isXliffFileName(fileName: string) {
  return /\.(xliff|xlf)$/i.test(fileName);
}

function stripMarkup(content: string) {
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasParserError(document: Document) {
  return getDescendantElementsByLocalName(document, "parsererror").length > 0;
}

function getDescendantElementsByLocalName(root: Document | Element, localName: string) {
  const matches: Element[] = [];
  const elements = "getElementsByTagNameNS" in root
    ? root.getElementsByTagNameNS("*", localName)
    : [];

  for (const element of Array.from(elements)) {
    matches.push(element);
  }

  return matches;
}

function getChildElementsByLocalName(root: Element, localName: string) {
  return Array.from(root.childNodes).filter(
    (node): node is Element =>
      node instanceof Element && getNodeLocalName(node) === localName
  );
}

function getFirstChildElementByLocalName(root: Element, localName: string) {
  return getChildElementsByLocalName(root, localName)[0] ?? null;
}

function getNodeLocalName(node: Element) {
  return node.localName ?? node.nodeName.split(":").pop() ?? node.nodeName;
}

function getNormalizedTextContent(element: Element) {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}
