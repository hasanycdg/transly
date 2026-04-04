import type { MaskedSegment, ProtectedToken } from "@/types/translation";

export type GlossaryRuntimeEntry = {
  sourceTerm: string;
  translatedTerm: string | null;
  isProtected: boolean;
};

type GlossaryTextMatch = {
  start: number;
  end: number;
  value: string;
  priority: number;
};

const GLOSSARY_BOUNDARY_CLASS = "[\\p{L}\\p{N}_]";

export function containsGlossaryTerm(text: string, sourceTerm: string) {
  return findGlossaryTermMatches(text, [sourceTerm]).length > 0;
}

export function buildGlossaryMatchKey(value: string) {
  return value.trim().toLowerCase();
}

export function maskProtectedGlossaryTerms(
  segment: MaskedSegment,
  protectedTerms: string[]
): MaskedSegment {
  const matches = findGlossaryTermMatches(segment.maskedText, protectedTerms);

  if (matches.length === 0) {
    return segment;
  }

  const nextTokens = [...segment.tokens];
  const nextMap = { ...segment.map };
  let maskedText = "";
  let cursor = 0;
  let nextVariableIndex = getHighestVariableTokenIndex(segment.tokens);

  for (const match of matches) {
    maskedText += segment.maskedText.slice(cursor, match.start);

    const token = createGlossaryToken(segment.maskedText, nextMap, ++nextVariableIndex);
    nextTokens.push({
      token,
      kind: "placeholder",
      original: match.value,
      index: nextTokens.length
    });
    nextMap[token] = match.value;
    maskedText += token;
    cursor = match.end;
  }

  maskedText += segment.maskedText.slice(cursor);

  return {
    originalText: segment.originalText,
    maskedText,
    tokens: nextTokens,
    map: nextMap,
    tokenCount: nextTokens.length
  };
}

function findGlossaryTermMatches(input: string, terms: string[]) {
  const matches: GlossaryTextMatch[] = [];
  const normalizedTerms = Array.from(
    new Set(
      terms
        .map((term) => term.trim())
        .filter((term) => term.length > 0)
    )
  ).sort((left, right) => right.length - left.length);

  normalizedTerms.forEach((term, priority) => {
    const pattern = buildGlossaryTermPattern(term);

    for (const match of input.matchAll(pattern)) {
      const value = match[0];
      const start = match.index ?? -1;

      if (start < 0) {
        continue;
      }

      matches.push({
        start,
        end: start + value.length,
        value,
        priority
      });
    }
  });

  matches.sort((left, right) => {
    if (left.start !== right.start) {
      return left.start - right.start;
    }

    if (left.end !== right.end) {
      return right.end - left.end;
    }

    return left.priority - right.priority;
  });

  const resolved: GlossaryTextMatch[] = [];

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

function buildGlossaryTermPattern(term: string) {
  const escaped = escapeRegExp(term);
  const startsWithWord = /^[\p{L}\p{N}_]/u.test(term);
  const endsWithWord = /[\p{L}\p{N}_]$/u.test(term);
  const prefix = startsWithWord ? `(?<!${GLOSSARY_BOUNDARY_CLASS})` : "";
  const suffix = endsWithWord ? `(?!${GLOSSARY_BOUNDARY_CLASS})` : "";

  return new RegExp(`${prefix}${escaped}${suffix}`, "giu");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighestVariableTokenIndex(tokens: ProtectedToken[]) {
  return tokens.reduce((highest, token) => {
    const match = token.token.match(/^__VAR_(\d+)__$/);

    if (!match) {
      return highest;
    }

    const nextIndex = Number.parseInt(match[1] ?? "0", 10);

    return Number.isFinite(nextIndex) ? Math.max(highest, nextIndex) : highest;
  }, 0);
}

function createGlossaryToken(input: string, existingMap: Record<string, string>, nextIndex: number) {
  let index = nextIndex;
  let token = `__VAR_${index}__`;

  while (token in existingMap || input.includes(token)) {
    index += 1;
    token = `__VAR_${index}__`;
  }

  return token;
}
