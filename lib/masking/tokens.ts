import type { MaskedSegment, ProtectedToken } from "@/types/translation";

export const GENERATED_TOKEN_PATTERN = /__(?:TAG|VAR)_\d+__/g;

const MASKING_PATTERNS: Array<{
  kind: ProtectedToken["kind"];
  pattern: RegExp;
}> = [
  {
    kind: "xml_tag",
    pattern: /<[^>]+>/g
  },
  {
    kind: "placeholder",
    pattern: /\$\{[\w.-]+\}/g
  },
  {
    kind: "placeholder",
    pattern: /\{\{[\w.-]+\}\}/g
  },
  {
    kind: "placeholder",
    pattern: /\{[\w.-]+\}/g
  },
  {
    kind: "placeholder",
    pattern: /%\([\w.-]+\)[#0\- +'"]*(?:\d+)?(?:\.\d+)?[a-zA-Z]/g
  },
  {
    kind: "placeholder",
    pattern: /%(?:\d+\$)?[#0\- +'"]*(?:\d+)?(?:\.\d+)?[a-zA-Z@]/g
  }
];

export function maskProtectedTokens(input: string): MaskedSegment {
  const matches = collectMatches(input);
  const tokens: ProtectedToken[] = [];
  let tagCount = 0;
  let variableCount = 0;
  let maskedText = "";
  let cursor = 0;

  for (const match of matches) {
    maskedText += input.slice(cursor, match.start);

    const nextIndex = match.kind === "xml_tag" ? ++tagCount : ++variableCount;
    const token = match.kind === "xml_tag" ? `__TAG_${nextIndex}__` : `__VAR_${nextIndex}__`;

    tokens.push({
      token,
      kind: match.kind,
      original: match.value,
      index: tokens.length
    });

    maskedText += token;
    cursor = match.end;
  }

  maskedText += input.slice(cursor);

  return {
    originalText: input,
    maskedText,
    tokens,
    tokenCount: tokens.length
  };
}

export function containsMeaningfulText(maskedText: string): boolean {
  return maskedText.replace(GENERATED_TOKEN_PATTERN, "").trim().length > 0;
}

function collectMatches(input: string): Array<{
  start: number;
  end: number;
  value: string;
  kind: ProtectedToken["kind"];
}> {
  const matches: Array<{
    start: number;
    end: number;
    value: string;
    kind: ProtectedToken["kind"];
  }> = [];

  for (const { kind, pattern } of MASKING_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);

    for (const match of input.matchAll(regex)) {
      const value = match[0];
      const start = match.index ?? -1;

      if (start < 0) {
        continue;
      }

      matches.push({
        start,
        end: start + value.length,
        value,
        kind
      });
    }
  }

  matches.sort((left, right) => {
    if (left.start !== right.start) {
      return left.start - right.start;
    }

    return right.end - left.end;
  });

  const resolved: typeof matches = [];

  for (const match of matches) {
    const overlaps = resolved.some(
      (existing) => match.start < existing.end && match.end > existing.start
    );

    if (!overlaps) {
      resolved.push(match);
    }
  }

  return resolved;
}
