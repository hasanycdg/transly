import type { TranslateRequestDto } from "../../schemas/translation.schemas";
import type { TranslationProvider } from "./translation-provider";

type TranslationExecutionResult = {
  translatedPayload: unknown;
  warnings: string[];
  provider: string;
  durationMs: number;
  stats: {
    totalStringFields: number;
    translatedStringFields: number;
    skippedStringFields: number;
    failedStringFields: number;
  };
};

export class TranslationService {
  constructor(private readonly provider: TranslationProvider) {}

  async translate(request: TranslateRequestDto): Promise<TranslationExecutionResult> {
    const startedAt = Date.now();

    const translatableSubset: Record<string, unknown> = {};
    if (request.title !== undefined) translatableSubset.title = request.title;
    if (request.excerpt !== undefined) translatableSubset.excerpt = request.excerpt;
    if (request.content !== undefined) translatableSubset.content = request.content;
    if (request.meta !== undefined) translatableSubset.meta = request.meta;
    if (request.acf !== undefined) translatableSubset.acf = request.acf;
    if (request.raw !== undefined) translatableSubset.raw = request.raw;

    const translated = await this.provider.translateStructuredPayload({
      payload: translatableSubset,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      options: request.options
    });

    const translatedPayload = {
      siteUrl: request.siteUrl,
      postId: request.postId,
      postType: request.postType,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      ...(translated.translatedPayload as Record<string, unknown>)
    };

    return {
      translatedPayload,
      warnings: translated.warnings,
      provider: this.provider.name,
      durationMs: Date.now() - startedAt,
      stats: translated.stats
    };
  }
}
