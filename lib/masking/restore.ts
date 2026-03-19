import { restoreProtectedTokens, unmaskString, validateTokenMap } from "@/lib/masking";
import { TranslationPipelineError } from "@/types/translation";
import type { ProtectedToken } from "@/types/translation";

export { restoreProtectedTokens, unmaskString };

export function validateProtectedTokens(
  translatedText: string,
  tokens: ProtectedToken[],
  unitInternalId?: string
): void {
  const map = tokens.reduce<Record<string, string>>((accumulator, token) => {
    accumulator[token.token] = token.original;
    return accumulator;
  }, {});
  const validation = validateTokenMap(translatedText, map);

  if (
    validation.missingTokens.length === 0 &&
    validation.unexpectedTokens.length === 0 &&
    validation.duplicatedTokens.length === 0 &&
    validation.reorderedTokens.length === 0
  ) {
    return;
  }

  throw new TranslationPipelineError(
    Object.keys(map).some((token) => token.startsWith("__TAG_"))
      ? "tag_mismatch"
      : "placeholder_mismatch",
    validation.reorderedTokens.length > 0
      ? "The AI response reordered protected tokens. The translated file was not generated."
      : "The AI response changed or lost protected tokens. The translated file was not generated.",
    422,
    {
      unitInternalId,
      ...validation
    }
  );
}
