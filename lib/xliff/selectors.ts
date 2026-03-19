import { XMLSerializer } from "@xmldom/xmldom";

import type { NodeRef } from "@/types/xliff";

const serializer = new XMLSerializer();

export function getLocalName(node: Node | null | undefined): string {
  if (!node) {
    return "";
  }

  const element = node as Element;
  return element.localName ?? node.nodeName.split(":").pop() ?? node.nodeName;
}

export function isElement(node: Node | null | undefined): node is Element {
  return Boolean(node && node.nodeType === 1);
}

export function getElementChildren(parent: Element): Element[] {
  const elements: Element[] = [];

  for (let index = 0; index < parent.childNodes.length; index += 1) {
    const node = parent.childNodes.item(index);

    if (isElement(node)) {
      elements.push(node);
    }
  }

  return elements;
}

export function getElementChildrenByLocalName(
  parent: Element,
  localName: string
): Element[] {
  return getElementChildren(parent).filter((child) => getLocalName(child) === localName);
}

export function getFirstChildByLocalName(
  parent: Element,
  localName: string
): Element | undefined {
  return getElementChildrenByLocalName(parent, localName)[0];
}

export function getDescendantElementsByLocalName(
  root: ParentNode,
  localName: string
): Element[] {
  const matches: Element[] = [];
  const allElements = (root as Document | Element).getElementsByTagName("*");

  for (let index = 0; index < allElements.length; index += 1) {
    const node = allElements.item(index);

    if (isElement(node) && getLocalName(node) === localName) {
      matches.push(node);
    }
  }

  return matches;
}

export function getClosestAncestorByLocalName(
  node: Node,
  localName: string
): Element | undefined {
  let current = node.parentNode;

  while (current) {
    if (isElement(current) && getLocalName(current) === localName) {
      return current;
    }

    current = current.parentNode;
  }

  return undefined;
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function getTextContentNormalized(node: Node): string {
  return normalizeWhitespace(node.textContent ?? "");
}

export function getElementInnerXml(element: Element): string {
  let xml = "";

  for (let index = 0; index < element.childNodes.length; index += 1) {
    const child = element.childNodes.item(index);

    if (child) {
      xml += serializer.serializeToString(child);
    }
  }

  return xml;
}

export function buildNodeRef(node: Node, role: NodeRef["role"]): NodeRef {
  const path: number[] = [];
  let current: Node | null = node;

  while (current && current.parentNode) {
    const parent: Node = current.parentNode;
    let childIndex = -1;

    for (let index = 0; index < parent.childNodes.length; index += 1) {
      if (parent.childNodes.item(index) === current) {
        childIndex = index;
        break;
      }
    }

    if (childIndex === -1) {
      break;
    }

    path.unshift(childIndex);
    current = parent;
  }

  return {
    path,
    nodeName: getLocalName(node),
    role
  };
}

export function resolveNodeRef(document: Document, ref: NodeRef): Node | null {
  let current: Node = document;

  for (const index of ref.path) {
    const next = current.childNodes.item(index);

    if (!next) {
      return null;
    }

    current = next;
  }

  if (getLocalName(current) !== ref.nodeName) {
    return null;
  }

  return current;
}
