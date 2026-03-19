import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import { parseXmlDocument } from "@/lib/xliff/parser";
import { getLocalName, resolveNodeRef } from "@/lib/xliff/selectors";
import { TranslationPipelineError } from "@/types/translation";
import type { ParsedXliffDocument, TranslationWriteback } from "@/types/xliff";

const serializer = new XMLSerializer();

export function serializeTranslatedXliff({
  originalXml,
  parsedDocument,
  translations,
  targetLanguage
}: {
  originalXml: string;
  parsedDocument: ParsedXliffDocument;
  translations: TranslationWriteback[];
  targetLanguage: string;
}): string {
  const { document, issues } = parseXmlDocument(originalXml);
  const blockingIssues = issues.filter((issue) => issue.level !== "warning");

  if (blockingIssues.length > 0) {
    throw new TranslationPipelineError(
      "malformed_xml",
      "The original XLIFF document could not be rebuilt because the XML is invalid.",
      422
    );
  }

  const translationMap = new Map(
    translations.map((translation) => [translation.unitInternalId, translation])
  );

  for (const unit of parsedDocument.units) {
    const translation = translationMap.get(unit.internalId);

    if (!translation) {
      continue;
    }

    const sourceNode = resolveNodeRef(document, unit.sourceNodeRef);

    if (!sourceNode || !isElementNode(sourceNode) || getLocalName(sourceNode) !== "source") {
      throw new TranslationPipelineError(
        "validation_error",
        "Failed to locate the original source node while rebuilding the translated XLIFF.",
        500,
        {
          unitInternalId: unit.internalId
        }
      );
    }

    const targetNode = unit.targetNodeRef
      ? resolveNodeRef(document, unit.targetNodeRef)
      : createTargetAfterSource(sourceNode);

    const targetElement =
      targetNode && isElementNode(targetNode) && getLocalName(targetNode) === "target"
        ? targetNode
        : createTargetAfterSource(sourceNode);

    replaceInnerXml(targetElement, translation.translatedXml);
  }

  applyTargetLanguage(document, parsedDocument.version, targetLanguage);

  return serializer.serializeToString(document);
}

function replaceInnerXml(element: Element, innerXml: string): void {
  const wrapperMarkup = buildWrapperMarkup(element, innerXml);
  const parser = new DOMParser();
  const wrapperDocument = parser.parseFromString(wrapperMarkup, "application/xml");
  const wrapper = wrapperDocument.documentElement;

  if (!wrapper || getLocalName(wrapper) !== "wrapper") {
    throw new TranslationPipelineError(
      "invalid_ai_response",
      "The translated content could not be converted back into valid XML.",
      422
    );
  }

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  const nodesToAppend: Node[] = [];

  for (let index = 0; index < wrapper.childNodes.length; index += 1) {
    const child = wrapper.childNodes.item(index);

    if (child) {
      nodesToAppend.push(child);
    }
  }

  for (const child of nodesToAppend) {
    const imported =
      typeof element.ownerDocument.importNode === "function"
        ? element.ownerDocument.importNode(child, true)
        : child.cloneNode(true);

    element.appendChild(imported);
  }
}

function buildWrapperMarkup(element: Element, innerXml: string): string {
  const namespaceAttributes = collectNamespaceAttributes(element);
  const serializedAttributes = namespaceAttributes
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(" ");
  const openingTag = serializedAttributes
    ? `<wrapper ${serializedAttributes}>`
    : "<wrapper>";

  return `${openingTag}${innerXml}</wrapper>`;
}

function collectNamespaceAttributes(element: Element): Array<[string, string]> {
  const namespaces = new Map<string, string>();
  let current: Node | null = element;

  while (current) {
    if (isElementNode(current)) {
      for (let index = 0; index < current.attributes.length; index += 1) {
        const attribute = current.attributes.item(index);

        if (!attribute) {
          continue;
        }

        if (attribute.name === "xmlns" || attribute.name.startsWith("xmlns:")) {
          if (!namespaces.has(attribute.name)) {
            namespaces.set(attribute.name, attribute.value);
          }
        }
      }
    }

    current = current.parentNode;
  }

  return Array.from(namespaces.entries());
}

function createTargetAfterSource(sourceElement: Element): Element {
  const document = sourceElement.ownerDocument;
  const qualifiedName = sourceElement.prefix ? `${sourceElement.prefix}:target` : "target";
  const targetElement = sourceElement.namespaceURI
    ? document.createElementNS(sourceElement.namespaceURI, qualifiedName)
    : document.createElement("target");

  sourceElement.parentNode?.insertBefore(targetElement, sourceElement.nextSibling);

  return targetElement;
}

function applyTargetLanguage(
  document: Document,
  version: ParsedXliffDocument["version"],
  targetLanguage: string
): void {
  const root = document.documentElement;

  if (!root) {
    return;
  }

  if (version === "2.x") {
    root.setAttribute("trgLang", targetLanguage);
    return;
  }

  const fileElements = root.getElementsByTagName("*");

  for (let index = 0; index < fileElements.length; index += 1) {
    const node = fileElements.item(index);

    if (isElementNode(node) && getLocalName(node) === "file") {
      node.setAttribute("target-language", targetLanguage);
    }
  }
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function isElementNode(node: Node | null | undefined): node is Element {
  return Boolean(node && node.nodeType === 1);
}
