import { NextResponse } from "next/server";

import { containsMeaningfulText, maskProtectedTokens } from "@/lib/masking/tokens";
import { unmaskString } from "@/lib/masking/restore";
import { restoreProtectedTokens } from "@/lib/masking/restore";
import { getExactGlossaryTranslations, getTranslationRuntimeSettings } from "@/lib/supabase/workspace";
import { parseXliffDocument } from "@/lib/xliff/parser";
import { serializeTranslatedXliff } from "@/lib/xliff/serializer";
import { OpenAITranslationProvider } from "@/services/translation/openai-provider";
import { isTranslationPipelineError, TranslationPipelineError } from "@/types/translation";
import type { MaskedSegment, TranslationApiErrorShape, TranslationApiSuccess } from "@/types/translation";
import type { TranslationWriteback, XliffWarning } from "@/types/xliff";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const runtimeSettings = await getTranslationRuntimeSettings();
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const projectSlug = normalizeLanguageValue(formData.get("projectSlug"));
    const targetLanguage =
      normalizeLanguageValue(formData.get("targetLanguage")) ?? runtimeSettings.defaultTargetLanguage;
    const sourceLanguageFallback =
      normalizeLanguageValue(formData.get("sourceLanguage")) ??
      (runtimeSettings.sourceLanguageMode === "manual" ? runtimeSettings.defaultSourceLanguage : undefined);

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
    const glossaryMatches = runtimeSettings.useGlossaryAutomatically
      ? await getExactGlossaryTranslations(
          detectedSourceLanguage,
          targetLanguage,
          parsedDocument.units.map((unit) => unit.sourceText)
        )
      : new Map<string, string>();
    const translationItems = parsedDocument.units.flatMap((unit) => {
      const masked = maskProtectedTokens(unit.sourceXml);
      maskedSegments.set(unit.internalId, masked);

      const exactGlossaryTranslation = glossaryMatches.get(unit.sourceText.trim());

      if (exactGlossaryTranslation && runtimeSettings.strictGlossaryMode) {
        writebacks.push({
          unitInternalId: unit.internalId,
          translatedXml: escapeXmlText(exactGlossaryTranslation)
        });

        return [];
      }

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

    const provider = new OpenAITranslationProvider({
      model: runtimeSettings.translationModel
    });
    const translatedItems = await provider.translateBatch(translationItems, {
      sourceLanguage: detectedSourceLanguage,
      targetLanguage,
      model: runtimeSettings.translationModel,
      maxBatchItems: runtimeSettings.translationBatchSize,
      toneStyle: runtimeSettings.toneStyle
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

      try {
        writebacks.push({
          unitInternalId: translatedItem.unitInternalId,
          translatedXml: restoreWithRuntimeRules(
            translatedItem.translatedText,
            maskedSegment,
            runtimeSettings.strictTagProtection,
            translatedItem.unitInternalId
          )
        });
      } catch (error) {
        if (
          isTranslationPipelineError(error) &&
          !runtimeSettings.failOnTagMismatch &&
          (error.code === "tag_mismatch" || error.code === "placeholder_mismatch")
        ) {
          warnings.push({
            code: "tag_mismatch_fallback",
            message: "A translation changed protected tags or placeholders. The affected unit kept its original source content.",
            unitInternalId: translatedItem.unitInternalId
          });
          writebacks.push({
            unitInternalId: translatedItem.unitInternalId,
            translatedXml: maskedSegment.originalText
          });
          continue;
        }

        throw error;
      }
    }

    const translatedContent = serializeTranslatedXliff({
      originalXml,
      parsedDocument,
      translations: writebacks,
      targetLanguage
    });

    const responsePayload: TranslationApiSuccess = {
      fileName: buildOutputFileName(
        fileEntry.name,
        detectedSourceLanguage,
        targetLanguage,
        runtimeSettings.defaultFilenameFormat,
        projectSlug ?? runtimeSettings.workspaceSlug
      ),
      translatedContent,
      warnings,
      detectedSourceLanguage,
      detectedTargetLanguage: targetLanguage,
      xliffVersion: parsedDocument.version,
      translatedUnitCount: writebacks.length,
      autoDownloadAfterTranslation: runtimeSettings.autoDownloadAfterTranslation
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

function buildOutputFileName(
  fileName: string,
  sourceLanguage: string,
  targetLanguage: string,
  filenameFormat: string,
  workspaceSlug: string
) {
  const match = fileName.match(/^(.*?)(\.(?:xliff|xlf))$/i);
  const baseName = match ? match[1] : fileName;
  const extension = match ? match[2] : ".xliff";

  if (filenameFormat === "Original + source + target") {
    return `${baseName}.${sourceLanguage}-${targetLanguage}${extension}`;
  }

  if (filenameFormat === "Project slug + locale") {
    return `${workspaceSlug}.${targetLanguage}${extension}`;
  }

  return `${baseName}.${targetLanguage}${extension}`;
}

function restoreWithRuntimeRules(
  translatedText: string,
  maskedSegment: MaskedSegment,
  strictTagProtection: boolean,
  unitInternalId: string
) {
  if (strictTagProtection) {
    return restoreProtectedTokens(translatedText, maskedSegment.tokens, unitInternalId);
  }

  try {
    return unmaskString(translatedText, maskedSegment.map, { strict: false }).text;
  } catch (error) {
    if (error instanceof TranslationPipelineError) {
      error.details = {
        ...error.details,
        unitInternalId
      };
    }

    throw error;
  }
}

function escapeXmlText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
