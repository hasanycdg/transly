import { DOMParser } from "@xmldom/xmldom";

import {
  buildNodeRef,
  getClosestAncestorByLocalName,
  getDescendantElementsByLocalName,
  getElementChildrenByLocalName,
  getElementInnerXml,
  getFirstChildByLocalName,
  getLocalName,
  getTextContentNormalized
} from "@/lib/xliff/selectors";
import { TranslationPipelineError } from "@/types/translation";
import type {
  ParsedTranslationUnit,
  ParsedXliffDocument,
  ParsedXliffFile,
  XliffVersion,
  XliffWarning
} from "@/types/xliff";

const XLIFF_1_NAMESPACE = "urn:oasis:names:tc:xliff:document:1.2";
const XLIFF_2_NAMESPACE_PREFIX = "urn:oasis:names:tc:xliff:document:2";

type ParserIssue = {
  level: "warning" | "error" | "fatalError";
  message: string;
};

export function parseXliffDocument(xml: string): ParsedXliffDocument {
  const { document, issues } = parseXmlDocument(xml);
  const root = document.documentElement;

  if (!root || getLocalName(root) !== "xliff") {
    throw new TranslationPipelineError(
      "unsupported_xliff",
      "The uploaded file is not a supported XLIFF document.",
      422
    );
  }

  if (issues.length > 0) {
    throw new TranslationPipelineError(
      "malformed_xml",
      "The uploaded file contains malformed XML and could not be parsed safely.",
      422,
      {
        parserIssues: issues.map((issue) => issue.message)
      }
    );
  }

  const version = detectXliffVersion(root);
  const sourceLanguage = detectSourceLanguage(root, version);
  const targetLanguage = detectTargetLanguage(root, version);
  const files = collectFileMetadata(root, version);
  const { units, warnings } = extractTranslationUnits(document, version);

  for (const unit of units) {
    const fileEntry = files.find((file) => file.id === unit.fileId);

    if (fileEntry) {
      fileEntry.unitIds.push(unit.internalId);
    }
  }

  if (files.length === 0) {
    files.push({
      id: undefined,
      original: undefined,
      sourceLanguage,
      targetLanguage,
      unitIds: units.map((unit) => unit.internalId)
    });
  }

  if (units.length === 0) {
    throw new TranslationPipelineError(
      "missing_source_nodes",
      "No supported translation units with usable source text were found in this XLIFF file.",
      422
    );
  }

  return {
    version,
    sourceLanguage,
    targetLanguage,
    files,
    units,
    warnings,
    rootName: getLocalName(root),
    namespaceUri: root.namespaceURI
  };
}

export function extractTranslationUnits(
  document: Document,
  version: XliffVersion
): {
  units: ParsedTranslationUnit[];
  warnings: XliffWarning[];
} {
  const warnings: XliffWarning[] = [];
  const units: ParsedTranslationUnit[] = [];
  let counter = 0;

  if (version === "1.2" || version === "unknown") {
    const transUnits = getDescendantElementsByLocalName(document, "trans-unit");

    for (const transUnit of transUnits) {
      const extracted = createParsedUnit({
        counter: counter + 1,
        containerElement: transUnit,
        sourceElement: getFirstChildByLocalName(transUnit, "source"),
        targetElement: getFirstChildByLocalName(transUnit, "target"),
        containerType: "trans-unit"
      });

      counter += 1;
      warnings.push(...extracted.warnings);

      if (extracted.unit) {
        units.push(extracted.unit);
      }
    }
  }

  if (version === "2.x" || version === "unknown") {
    const unitElements = getDescendantElementsByLocalName(document, "unit");

    for (const unitElement of unitElements) {
      const segments = getElementChildrenByLocalName(unitElement, "segment");

      if (segments.length > 0) {
        for (const segment of segments) {
          const extracted = createParsedUnit({
            counter: counter + 1,
            containerElement: unitElement,
            sourceElement: getFirstChildByLocalName(segment, "source"),
            targetElement: getFirstChildByLocalName(segment, "target"),
            containerType: "segment",
            segmentElement: segment
          });

          counter += 1;
          warnings.push(...extracted.warnings);

          if (extracted.unit) {
            units.push(extracted.unit);
          }
        }

        continue;
      }

      const extracted = createParsedUnit({
        counter: counter + 1,
        containerElement: unitElement,
        sourceElement: getFirstChildByLocalName(unitElement, "source"),
        targetElement: getFirstChildByLocalName(unitElement, "target"),
        containerType: "unit"
      });

      counter += 1;
      warnings.push(...extracted.warnings);

      if (extracted.unit) {
        units.push(extracted.unit);
      }
    }
  }

  return { units, warnings };
}

export function parseXmlDocument(xml: string): {
  document: Document;
  issues: ParserIssue[];
} {
  const issues: ParserIssue[] = [];

  const parser = new DOMParser({
    locator: {},
    errorHandler: {
      warning: (message) => {
        issues.push({ level: "warning", message });
      },
      error: (message) => {
        issues.push({ level: "error", message });
      },
      fatalError: (message) => {
        issues.push({ level: "fatalError", message });
      }
    }
  });

  const document = parser.parseFromString(xml, "application/xml");
  const parserErrors = getDescendantElementsByLocalName(document, "parsererror");

  for (const parserError of parserErrors) {
    issues.push({
      level: "fatalError",
      message: getTextContentNormalized(parserError)
    });
  }

  return { document, issues };
}

function detectXliffVersion(root: Element): XliffVersion {
  const namespace = root.namespaceURI ?? "";
  const version = root.getAttribute("version") ?? "";

  if (namespace === XLIFF_1_NAMESPACE || version.startsWith("1.2")) {
    return "1.2";
  }

  if (namespace.startsWith(XLIFF_2_NAMESPACE_PREFIX) || version.startsWith("2.")) {
    return "2.x";
  }

  return "unknown";
}

function detectSourceLanguage(root: Element, version: XliffVersion): string | undefined {
  if (version === "2.x") {
    return root.getAttribute("srcLang") ?? undefined;
  }

  const fileElement = getDescendantElementsByLocalName(root, "file")[0];

  if (fileElement) {
    return fileElement.getAttribute("source-language") ?? undefined;
  }

  return undefined;
}

function detectTargetLanguage(root: Element, version: XliffVersion): string | undefined {
  if (version === "2.x") {
    return root.getAttribute("trgLang") ?? undefined;
  }

  const fileElement = getDescendantElementsByLocalName(root, "file")[0];

  if (fileElement) {
    return fileElement.getAttribute("target-language") ?? undefined;
  }

  return undefined;
}

function collectFileMetadata(root: Element, version: XliffVersion): ParsedXliffFile[] {
  const fileElements = getDescendantElementsByLocalName(root, "file");

  if (fileElements.length === 0) {
    return [];
  }

  return fileElements.map((fileElement, index) => {
    const fallbackId =
      fileElement.getAttribute("id") ??
      fileElement.getAttribute("original") ??
      `file-${index + 1}`;

    const sourceLanguage =
      version === "2.x"
        ? root.getAttribute("srcLang") ?? undefined
        : fileElement.getAttribute("source-language") ?? undefined;

    const targetLanguage =
      version === "2.x"
        ? root.getAttribute("trgLang") ?? undefined
        : fileElement.getAttribute("target-language") ?? undefined;

    return {
      id: fallbackId,
      original: fileElement.getAttribute("original") ?? undefined,
      sourceLanguage,
      targetLanguage,
      unitIds: []
    };
  });
}

function createParsedUnit({
  counter,
  containerElement,
  sourceElement,
  targetElement,
  containerType,
  segmentElement
}: {
  counter: number;
  containerElement: Element;
  sourceElement?: Element;
  targetElement?: Element;
  containerType: "trans-unit" | "unit" | "segment";
  segmentElement?: Element;
}): {
  unit?: ParsedTranslationUnit;
  warnings: XliffWarning[];
} {
  const internalId = `unit-${counter}`;
  const fileAncestor = getClosestAncestorByLocalName(containerElement, "file");
  const fileId =
    fileAncestor?.getAttribute("id") ??
    fileAncestor?.getAttribute("original") ??
    undefined;
  const warnings: XliffWarning[] = [];

  if (!sourceElement) {
    warnings.push({
      code: "missing_source",
      message: "Skipped a translation unit because no source node was found.",
      unitInternalId: internalId,
      fileId
    });

    return { warnings };
  }

  const sourceXml = getElementInnerXml(sourceElement);
  const sourceText = getTextContentNormalized(sourceElement);

  if (!sourceText && !sourceXml.trim()) {
    warnings.push({
      code: "skipped_empty_source",
      message: "Skipped an empty source node.",
      unitInternalId: internalId,
      fileId
    });

    return { warnings };
  }

  if (!targetElement) {
    warnings.push({
      code: "missing_target",
      message: "No target node exists yet. One will be created during reconstruction.",
      unitInternalId: internalId,
      fileId
    });
  }

  const unitId =
    containerElement.getAttribute("id") ??
    containerElement.getAttribute("resname") ??
    undefined;

  return {
    unit: {
      internalId,
      unitId,
      fileId,
      sourceXml,
      sourceText,
      targetXml: targetElement ? getElementInnerXml(targetElement) : undefined,
      targetText: targetElement ? getTextContentNormalized(targetElement) : undefined,
      sourceNodeRef: buildNodeRef(sourceElement, "source"),
      targetNodeRef: targetElement ? buildNodeRef(targetElement, "target") : undefined,
      metadata: {
        container: containerType,
        segmentId: segmentElement?.getAttribute("id") ?? undefined,
        state:
          targetElement?.getAttribute("state") ??
          containerElement.getAttribute("state") ??
          undefined,
        sourceLanguage:
          fileAncestor?.getAttribute("source-language") ??
          containerElement.ownerDocument.documentElement.getAttribute("srcLang") ??
          undefined,
        targetLanguage:
          fileAncestor?.getAttribute("target-language") ??
          containerElement.ownerDocument.documentElement.getAttribute("trgLang") ??
          undefined,
        namespaceUri: containerElement.namespaceURI
      },
      warnings
    },
    warnings
  };
}
