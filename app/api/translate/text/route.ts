import { NextResponse } from "next/server";

import { buildGlossaryMatchKey, maskProtectedGlossaryTerms } from "@/lib/glossary/runtime";
import { containsMeaningfulText, maskProtectedTokens } from "@/lib/masking/tokens";
import { restoreProtectedTokens } from "@/lib/masking/restore";
import { countMeaningfulTextContent } from "@/lib/translation/word-count";
import {
  assertWorkspaceHasCredits,
  getRelevantGlossaryEntries,
  getTranslationRuntimeSettings,
  recordTextTranslationUsage
} from "@/lib/supabase/workspace";
import { OpenAITranslationProvider } from "@/services/translation/openai-provider";
import {
  isTranslationPipelineError,
  TranslationPipelineError,
  type TextTranslationApiSuccess,
  type TranslationApiErrorShape
} from "@/types/translation";

export const runtime = "nodejs";

type TextTranslationRequest = {
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  text?: string | null;
  toneStyle?: string | null;
};

export async function POST(request: Request) {
  try {
    const runtimeSettings = await getTranslationRuntimeSettings();
    const payload = (await request.json()) as TextTranslationRequest;
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    const targetLanguage =
      normalizeLanguageValue(payload.targetLanguage) ?? runtimeSettings.defaultTargetLanguage;
    const sourceLanguage = normalizeLanguageValue(payload.sourceLanguage);
    const toneStyle =
      typeof payload.toneStyle === "string" && payload.toneStyle.trim().length > 0
        ? payload.toneStyle.trim()
        : runtimeSettings.toneStyle;

    if (!text) {
      throw new TranslationPipelineError(
        "validation_error",
        "Enter text before starting a translation.",
        400
      );
    }

    if (!targetLanguage) {
      throw new TranslationPipelineError(
        "validation_error",
        "Select a target language before translating text.",
        400
      );
    }

    const wordCount = countMeaningfulTextContent(text);

    await assertWorkspaceHasCredits(wordCount);

    const provider = new OpenAITranslationProvider({
      model: runtimeSettings.translationModel
    });
    const glossaryEntries =
      runtimeSettings.useGlossaryAutomatically && sourceLanguage
        ? await getRelevantGlossaryEntries({
            sourceLanguage,
            targetLanguage,
            sourceTexts: [text]
          })
        : [];
    const protectedGlossaryTerms = glossaryEntries
      .filter((entry) => entry.isProtected)
      .map((entry) => entry.sourceTerm);
    const glossaryPromptEntries = glossaryEntries.flatMap((entry) =>
      !entry.isProtected && entry.translatedTerm
        ? [
            {
              sourceTerm: entry.sourceTerm,
              translatedTerm: entry.translatedTerm
            }
          ]
        : []
    );
    const maskedText = protectedGlossaryTerms.length > 0
      ? maskProtectedGlossaryTerms(maskProtectedTokens(text), protectedGlossaryTerms)
      : maskProtectedTokens(text);
    const exactGlossaryTranslation = glossaryPromptEntries.find(
      (entry) => buildGlossaryMatchKey(entry.sourceTerm) === buildGlossaryMatchKey(text)
    );
    let translatedText: string;
    let detectedSourceLanguage = sourceLanguage ?? "auto";

    if (exactGlossaryTranslation && runtimeSettings.strictGlossaryMode) {
      translatedText = exactGlossaryTranslation.translatedTerm;
    } else if (!containsMeaningfulText(maskedText.maskedText)) {
      translatedText = text;
    } else {
      const result = await provider.translateText({
        text: maskedText.maskedText,
        sourceLanguage,
        targetLanguage,
        toneStyle,
        model: runtimeSettings.translationModel,
        glossaryEntries: glossaryPromptEntries
      });

      translatedText = restoreProtectedTokens(result.translatedText, maskedText.tokens);
      detectedSourceLanguage = sourceLanguage ?? result.detectedSourceLanguage;
    }

    const responsePayload: TextTranslationApiSuccess = {
      translatedText,
      detectedSourceLanguage,
      targetLanguage,
      toneStyle,
      wordCount,
      characterCount: text.length
    };

    await recordTextTranslationUsage(responsePayload.wordCount);

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    if (isTranslationPipelineError(error)) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        } satisfies TranslationApiErrorShape,
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "translation_provider_error",
          message: error instanceof Error ? error.message : "Text translation failed unexpectedly."
        }
      } satisfies TranslationApiErrorShape,
      { status: 500 }
    );
  }
}

function normalizeLanguageValue(value: string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  return normalized.length > 0 ? normalized : undefined;
}
