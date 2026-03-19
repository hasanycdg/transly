import { GENERATED_TOKEN_PATTERN } from "@/lib/masking/tokens";
import { TranslationPipelineError } from "@/types/translation";
import type { ProtectedToken } from "@/types/translation";

export function restoreProtectedTokens(
  translatedText: string,
  tokens: ProtectedToken[],
  unitInternalId?: string
): string {
  validateProtectedTokens(translatedText, tokens, unitInternalId);

  let restored = translatedText;

  for (const token of tokens) {
    restored = restored.split(token.token).join(token.original);
  }

  return restored;
}

export function validateProtectedTokens(
  translatedText: string,
  tokens: ProtectedToken[],
  unitInternalId?: string
): void {
  const foundTokens: string[] = translatedText.match(GENERATED_TOKEN_PATTERN) ?? [];
  const expectedTokens = tokens.map((token) => token.token);

  const missingTokens = expectedTokens.filter((token) => !foundTokens.includes(token));
  const unexpectedTokens = foundTokens.filter((token) => !expectedTokens.includes(token));
  const duplicatedTokens = foundTokens.filter(
    (token, index) => foundTokens.indexOf(token) !== index
  );

  if (
    missingTokens.length === 0 &&
    unexpectedTokens.length === 0 &&
    duplicatedTokens.length === 0 &&
    foundTokens.length === expectedTokens.length
  ) {
    return;
  }

  const hasTagIssue = tokens.some((token) => token.kind === "xml_tag");
  const code = hasTagIssue ? "tag_mismatch" : "placeholder_mismatch";

  throw new TranslationPipelineError(
    code,
    "The AI response changed or lost protected placeholders. The translated file was not generated.",
    422,
    {
      unitInternalId,
      expectedTokens,
      foundTokens,
      missingTokens,
      unexpectedTokens,
      duplicatedTokens
    }
  );
}
