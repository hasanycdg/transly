import { NextResponse } from "next/server";

import { countMeaningfulTextContent } from "@/lib/translation/word-count";
import { getTranslationRuntimeSettings } from "@/lib/supabase/workspace";
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

    const provider = new OpenAITranslationProvider({
      model: runtimeSettings.translationModel
    });
    const result = await provider.translateText({
      text,
      sourceLanguage,
      targetLanguage,
      toneStyle,
      model: runtimeSettings.translationModel
    });

    const responsePayload: TextTranslationApiSuccess = {
      translatedText: result.translatedText,
      detectedSourceLanguage: result.detectedSourceLanguage,
      targetLanguage,
      toneStyle,
      wordCount: countMeaningfulTextContent(text),
      characterCount: text.length
    };

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
