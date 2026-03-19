import { TranslationPipelineError } from "@/types/translation";
import type {
  MaskedSegment,
  ProtectedToken,
  ProtectedTokenKind,
  ProtectedTokenMap,
  TokenValidationResult,
  UnmaskResult,
  UnmaskWarning
} from "@/types/translation";

export const GENERATED_TOKEN_PATTERN = /__(?:TAG|VAR)_\d+__/g;

type ProtectedFragmentDefinition = {
  kind: ProtectedTokenKind;
  pattern: RegExp;
};

type ProtectedFragmentMatch = {
  start: number;
  end: number;
  value: string;
  kind: ProtectedTokenKind;
  priority: number;
};

const PROTECTED_FRAGMENT_DEFINITIONS: ProtectedFragmentDefinition[] = [
  {
    kind: "xml_tag",
    pattern: /<\/?[\w:-]+(?:\s+[^<>]*?)?\s*\/?>/g
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
  },
  {
    kind: "placeholder",
    pattern: /(?<![\w]):[A-Za-z_][\w.-]*/g
  },
  {
    kind: "placeholder",
    pattern: /\$[A-Za-z_][\w.]*/g
  }
];

export function detectProtectedFragments(input: string): ProtectedFragmentMatch[] {
  const matches: ProtectedFragmentMatch[] = [];

  PROTECTED_FRAGMENT_DEFINITIONS.forEach((definition, priority) => {
    const regex = new RegExp(definition.pattern.source, definition.pattern.flags);

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
        kind: definition.kind,
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

  const resolved: ProtectedFragmentMatch[] = [];

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

export function maskString(input: string): MaskedSegment {
  const matches = detectProtectedFragments(input);
  const tokens: ProtectedToken[] = [];
  const map: ProtectedTokenMap = {};
  let tagIndex = 0;
  let variableIndex = 0;
  let maskedText = "";
  let cursor = 0;

  for (const match of matches) {
    maskedText += input.slice(cursor, match.start);

    const token = createUniqueToken({
      input,
      existingMap: map,
      kind: match.kind,
      nextIndex: match.kind === "xml_tag" ? ++tagIndex : ++variableIndex
    });

    tokens.push({
      token,
      kind: match.kind,
      original: match.value,
      index: tokens.length
    });
    map[token] = match.value;

    maskedText += token;
    cursor = match.end;
  }

  maskedText += input.slice(cursor);

  return {
    originalText: input,
    maskedText,
    tokens,
    map,
    tokenCount: tokens.length
  };
}

export function unmaskString(
  translated: string,
  map: ProtectedTokenMap,
  options: {
    strict?: boolean;
  } = {}
): UnmaskResult {
  const validation = validateTokenMap(translated, map);

  if (
    validation.missingTokens.length > 0 ||
    validation.unexpectedTokens.length > 0 ||
    validation.duplicatedTokens.length > 0
  ) {
    throw buildTokenValidationError(validation, map);
  }

  if (options.strict && validation.reorderedTokens.length > 0) {
    throw buildTokenValidationError(validation, map, true);
  }

  let text = translated;

  for (const token of validation.expectedTokens) {
    text = text.split(token).join(map[token]!);
  }

  const warnings: UnmaskWarning[] = [];

  if (validation.reorderedTokens.length > 0) {
    warnings.push({
      code: "reordered_tokens",
      message:
        "Protected tokens were reordered by the model response. The text was restored, but this translation should be reviewed carefully.",
      tokens: validation.reorderedTokens
    });
  }

  return {
    text,
    warnings,
    validation
  };
}

export function validateTokenMap(
  translated: string,
  map: ProtectedTokenMap
): TokenValidationResult {
  const expectedTokens = Object.keys(map);
  const foundTokens: string[] = translated.match(GENERATED_TOKEN_PATTERN) ?? [];
  const missingTokens = expectedTokens.filter((token) => !foundTokens.includes(token));
  const unexpectedTokens = foundTokens.filter((token) => !expectedTokens.includes(token));
  const duplicatedTokens = Array.from(
    new Set(foundTokens.filter((token, index) => foundTokens.indexOf(token) !== index))
  );

  const expectedSequence = expectedTokens.filter((token) => foundTokens.includes(token));
  const reorderedTokens =
    missingTokens.length === 0 &&
    unexpectedTokens.length === 0 &&
    duplicatedTokens.length === 0 &&
    !sameSequence(foundTokens, expectedSequence)
      ? foundTokens
      : [];

  return {
    expectedTokens,
    foundTokens,
    missingTokens,
    unexpectedTokens,
    duplicatedTokens,
    reorderedTokens
  };
}

export function containsMeaningfulText(maskedText: string): boolean {
  return maskedText.replace(GENERATED_TOKEN_PATTERN, "").trim().length > 0;
}

export function maskProtectedTokens(input: string): MaskedSegment {
  return maskString(input);
}

export function restoreProtectedTokens(
  translatedText: string,
  tokensOrMap: ProtectedToken[] | ProtectedTokenMap,
  unitInternalId?: string
): string {
  const map = Array.isArray(tokensOrMap) ? buildTokenMap(tokensOrMap) : tokensOrMap;

  try {
    return unmaskString(translatedText, map, { strict: true }).text;
  } catch (error) {
    if (error instanceof TranslationPipelineError && unitInternalId) {
      error.details = {
        ...error.details,
        unitInternalId
      };
    }

    throw error;
  }
}

function createUniqueToken({
  input,
  existingMap,
  kind,
  nextIndex
}: {
  input: string;
  existingMap: ProtectedTokenMap;
  kind: ProtectedTokenKind;
  nextIndex: number;
}): string {
  const prefix = kind === "xml_tag" ? "TAG" : "VAR";
  let index = nextIndex;
  let token = `__${prefix}_${index}__`;

  while (token in existingMap || input.includes(token)) {
    index += 1;
    token = `__${prefix}_${index}__`;
  }

  return token;
}

function buildTokenMap(tokens: ProtectedToken[]): ProtectedTokenMap {
  return tokens.reduce<ProtectedTokenMap>((accumulator, token) => {
    accumulator[token.token] = token.original;
    return accumulator;
  }, {});
}

function sameSequence(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((token, index) => token === right[index]);
}

function buildTokenValidationError(
  validation: TokenValidationResult,
  map: ProtectedTokenMap,
  reorderedOnly = false
): TranslationPipelineError {
  const hasTagTokens = Object.keys(map).some((token) => token.startsWith("__TAG_"));
  const code = hasTagTokens ? "tag_mismatch" : "placeholder_mismatch";
  const message = reorderedOnly
    ? "The AI response reordered protected tokens. The translated file was not generated."
    : "The AI response changed or lost protected tokens. The translated file was not generated.";

  return new TranslationPipelineError(code, message, 422, {
    expectedTokens: validation.expectedTokens,
    foundTokens: validation.foundTokens,
    missingTokens: validation.missingTokens,
    unexpectedTokens: validation.unexpectedTokens,
    duplicatedTokens: validation.duplicatedTokens,
    reorderedTokens: validation.reorderedTokens
  });
}
