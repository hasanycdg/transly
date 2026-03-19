import { NextResponse } from "next/server";

import { containsMeaningfulText, maskProtectedTokens } from "@/lib/masking/tokens";
import { restoreProtectedTokens } from "@/lib/masking/restore";
import { parseXliffDocument } from "@/lib/xliff/parser";
import { serializeTranslatedXliff } from "@/lib/xliff/serializer";
import { OpenAITranslationProvider } from "@/services/translation/openai-provider";
import { isTranslationPipelineError, TranslationPipelineError } from "@/types/translation";
import type { MaskedSegment, TranslationApiErrorShape, TranslationApiSuccess } from "@/types/translation";
import type { TranslationWriteback, XliffWarning } from "@/types/xliff";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const targetLanguage = normalizeLanguageValue(formData.get("targetLanguage"));
    const sourceLanguageFallback = normalizeLanguageValue(formData.get("sourceLanguage"));

    if (!(fileEntry instanceof File)) {
      throw new TranslationPipelineError(
        "validation_error",
        "Please upload a single XLIFF file.",
        400
      );
    }

    if (!targetLanguage) {
      throw new TranslationPipelineError(
        "validation_error",
        "Select a target language before translating.",
        400
      );
    }

    if (!isSupportedXliffFile(fileEntry.name)) {
      throw new TranslationPipelineError(
        "validation_error",
        "Only .xliff and .xlf files are supported in Phase 1.",
        400
      );
    }

    const originalXml = await fileEntry.text();
    const parsedDocument = parseXliffDocument(originalXml);
    const warnings: XliffWarning[] = [...parsedDocument.warnings];
    const detectedSourceLanguage = parsedDocument.sourceLanguage ?? sourceLanguageFallback;

    if (!detectedSourceLanguage) {
      throw new TranslationPipelineError(
        "missing_source_language",
        "This XLIFF file does not declare a usable source language. Select one manually and try again.",
        422
      );
    }

    if (!parsedDocument.sourceLanguage && sourceLanguageFallback) {
      warnings.push({
        code: "used_source_language_fallback",
        message: `Used the manually selected source language fallback: ${sourceLanguageFallback}.`
      });
    }

    const maskedSegments = new Map<string, MaskedSegment>();
    const writebacks: TranslationWriteback[] = [];
    const translationItems = parsedDocument.units.flatMap((unit) => {
      const masked = maskProtectedTokens(unit.sourceXml);
      maskedSegments.set(unit.internalId, masked);

      if (!containsMeaningfulText(masked.maskedText)) {
        writebacks.push({
          unitInternalId: unit.internalId,
          translatedXml: unit.sourceXml
        });

        return [];
      }

      return [
        {
          unitInternalId: unit.internalId,
          text: masked.maskedText,
          sourceLanguage: detectedSourceLanguage,
          targetLanguage
        }
      ];
    });

    const provider = new OpenAITranslationProvider();
    const translatedItems = await provider.translateBatch(translationItems, {
      sourceLanguage: detectedSourceLanguage,
      targetLanguage
    });

    for (const translatedItem of translatedItems) {
      const maskedSegment = maskedSegments.get(translatedItem.unitInternalId);

      if (!maskedSegment) {
        throw new TranslationPipelineError(
          "validation_error",
          "Missing token metadata for a translated segment.",
          500,
          {
            unitInternalId: translatedItem.unitInternalId
          }
        );
      }

      writebacks.push({
        unitInternalId: translatedItem.unitInternalId,
        translatedXml: restoreProtectedTokens(
          translatedItem.translatedText,
          maskedSegment.tokens,
          translatedItem.unitInternalId
        )
      });
    }

    const translatedContent = serializeTranslatedXliff({
      originalXml,
      parsedDocument,
      translations: writebacks,
      targetLanguage
    });

    const responsePayload: TranslationApiSuccess = {
      fileName: buildOutputFileName(fileEntry.name, targetLanguage),
      translatedContent,
      warnings,
      detectedSourceLanguage,
      detectedTargetLanguage: targetLanguage,
      xliffVersion: parsedDocument.version,
      translatedUnitCount: writebacks.length
    };

    return NextResponse.json(responsePayload);
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
          message: "Translation failed due to an unexpected server error."
        }
      } satisfies TranslationApiErrorShape,
      { status: 500 }
    );
  }
}

function normalizeLanguageValue(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function isSupportedXliffFile(fileName: string): boolean {
  return /\.(xliff|xlf)$/i.test(fileName);
}

function buildOutputFileName(fileName: string, targetLanguage: string): string {
  const match = fileName.match(/^(.*?)(\.(?:xliff|xlf))$/i);

  if (!match) {
    return `${fileName}.${targetLanguage}.xliff`;
  }

  return `${match[1]}.${targetLanguage}${match[2]}`;
}
