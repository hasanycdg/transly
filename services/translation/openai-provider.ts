import OpenAI from "openai";

import { chunkTranslationItems, type TranslationProvider } from "@/services/translation/provider";
import { TranslationPipelineError } from "@/types/translation";
import type {
  TranslationBatchItem,
  TranslationBatchResult,
  TranslationContext
} from "@/types/translation";

const SYSTEM_PROMPT = `You are a professional localization engine.
Translate each string naturally into the requested target language.
Preserve all placeholder and tag tokens exactly as they appear, including casing and underscores.
Do not remove, reorder, duplicate, or alter any token such as __TAG_1__ or __VAR_1__.
Do not add explanations, notes, markdown, or extra keys.
Return only valid JSON in this shape:
{"translations":[{"id":"unit-1","text":"translated string"}]}`;

type OpenAITranslationProviderOptions = {
  apiKey?: string;
  model?: string;
};

export class OpenAITranslationProvider implements TranslationProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAITranslationProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new TranslationPipelineError(
        "translation_provider_error",
        "OPENAI_API_KEY is missing on the server.",
        500
      );
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4o-mini";
  }

  async translateBatch(
    items: TranslationBatchItem[],
    context: TranslationContext
  ): Promise<TranslationBatchResult[]> {
    if (items.length === 0) {
      return [];
    }

    const chunks = chunkTranslationItems(items, {
      maxItems: context.maxBatchItems
    });
    const results = new Map<string, string>();
    const behaviorInstruction = buildBehaviorInstruction(context);

    for (const chunk of chunks) {
      const completion = await this.client.chat.completions.create({
        model: context.model ?? this.model,
        temperature: 0.2,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: behaviorInstruction ? `${SYSTEM_PROMPT}\n${behaviorInstruction}` : SYSTEM_PROMPT
          },
          {
            role: "user",
            content: JSON.stringify({
              sourceLanguage: context.sourceLanguage,
              targetLanguage: context.targetLanguage,
              toneStyle: context.toneStyle ?? null,
              items: chunk.map((item) => ({
                id: item.unitInternalId,
                text: item.text
              }))
            })
          }
        ]
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new TranslationPipelineError(
          "invalid_ai_response",
          "The AI provider returned an empty translation payload.",
          502
        );
      }

      const translations = parseTranslationPayload(content, chunk);

      for (const translation of translations) {
        results.set(translation.unitInternalId, translation.translatedText);
      }
    }

    return items.map((item) => {
      const translatedText = results.get(item.unitInternalId);

      if (!translatedText) {
        throw new TranslationPipelineError(
          "invalid_ai_response",
          "The AI provider response did not include all requested translations.",
          502,
          {
            unitInternalId: item.unitInternalId
          }
        );
      }

      return {
        unitInternalId: item.unitInternalId,
        translatedText
      };
    });
  }
}

function parseTranslationPayload(
  content: string,
  requestedItems: TranslationBatchItem[]
): TranslationBatchResult[] {
  const cleaned = stripMarkdownFence(content);
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new TranslationPipelineError(
      "invalid_ai_response",
      "The AI provider returned invalid JSON.",
      502,
      {
        cause: error instanceof Error ? error.message : "Unknown JSON parse error"
      }
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("translations" in parsed) ||
    !Array.isArray(parsed.translations)
  ) {
    throw new TranslationPipelineError(
      "invalid_ai_response",
      "The AI provider response had an unexpected shape.",
      502
    );
  }

  const requestedIds = new Set(requestedItems.map((item) => item.unitInternalId));
  const results: TranslationBatchResult[] = [];

  for (const entry of parsed.translations) {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("id" in entry) ||
      !("text" in entry) ||
      typeof entry.id !== "string" ||
      typeof entry.text !== "string"
    ) {
      throw new TranslationPipelineError(
        "invalid_ai_response",
        "The AI provider response included an invalid translation entry.",
        502
      );
    }

    if (!requestedIds.has(entry.id)) {
      throw new TranslationPipelineError(
        "invalid_ai_response",
        "The AI provider response included an unexpected translation id.",
        502,
        {
          unexpectedId: entry.id
        }
      );
    }

    results.push({
      unitInternalId: entry.id,
      translatedText: entry.text
    });
  }

  if (results.length !== requestedItems.length) {
    throw new TranslationPipelineError(
      "invalid_ai_response",
      "The AI provider response did not match the requested translation batch size.",
      502,
      {
        expectedCount: requestedItems.length,
        actualCount: results.length
      }
    );
  }

  return results;
}

function stripMarkdownFence(content: string): string {
  return content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function buildBehaviorInstruction(context: TranslationContext) {
  if (!context.toneStyle) {
    return "";
  }

  return `Favor a ${context.toneStyle.toLowerCase()} tone whenever the source text allows it, while keeping translations concise and structurally safe.`;
}
