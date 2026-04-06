import { AppError } from "../../utils/errors";
import { BaseTranslationProvider, type TranslateTextInput } from "./translation-provider";

export class LlmTranslationProvider extends BaseTranslationProvider {
  readonly name = "llm-provider-placeholder";

  async translateText(input: TranslateTextInput): Promise<string> {
    void input;

    // TODO: Wire this provider to your production LLM/API integration.
    // Suggested implementation:
    // 1) Build a provider-specific client
    // 2) Use strict prompts to preserve placeholders/tokens
    // 3) Add retry + circuit breaker behavior
    // 4) Track token usage for billing and quotas
    throw new AppError(
      501,
      "LLM translation provider is not implemented yet. Set TRANSLATION_PROVIDER=stub for local usage.",
      "PROVIDER_NOT_IMPLEMENTED"
    );
  }
}
