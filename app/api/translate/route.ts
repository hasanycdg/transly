import { NextResponse } from "next/server";

import { parseCsvDocument, serializeTranslatedCsv, type ParsedCsvDocument } from "@/lib/file-formats/csv";
import {
  parseOfficeDocument,
  serializeTranslatedOffice,
  type OfficeArchiveFormat
} from "@/lib/file-formats/office";
import { parsePoDocument, serializeTranslatedPo, type ParsedPoDocument } from "@/lib/file-formats/po";
import { parseResxDocument, serializeTranslatedResx, type ParsedResxDocument } from "@/lib/file-formats/resx";
import { parseStringsDocument, serializeTranslatedStrings, type ParsedStringsDocument } from "@/lib/file-formats/strings";
import { parseTxtDocument, serializeTranslatedTxt, type ParsedTxtDocument } from "@/lib/file-formats/txt";
import { containsMeaningfulText, maskProtectedTokens } from "@/lib/masking/tokens";
import { restoreProtectedTokens, unmaskString } from "@/lib/masking/restore";
import { countWordsFromSourceTexts } from "@/lib/translation/word-count";
import {
  getExactGlossaryTranslations,
  getTranslationRuntimeSettings,
  recordFileTranslationUsage
} from "@/lib/supabase/workspace";
import { parseXliffDocument } from "@/lib/xliff/parser";
import { serializeTranslatedXliff } from "@/lib/xliff/serializer";
import { OpenAITranslationProvider } from "@/services/translation/openai-provider";
import {
  isTranslationPipelineError,
  TranslationPipelineError,
  type MaskedSegment,
  type TranslationApiErrorShape,
  type TranslationApiSuccess
} from "@/types/translation";
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
        "Please upload a single translation file.",
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

    const detectedFormat = detectTranslationFileFormat(fileEntry.name);

    if (!detectedFormat) {
      throw new TranslationPipelineError(
        "validation_error",
        "Supported formats are .xliff, .xlf, .po, .strings, .resx, .xml, .csv, .txt, .docx, and .pptx.",
        400
      );
    }

    const provider = new OpenAITranslationProvider({
      model: runtimeSettings.translationModel
    });

    if (detectedFormat === "docx" || detectedFormat === "pptx") {
      return NextResponse.json(
        await translateOfficeDocument({
          fileName: fileEntry.name,
          originalBuffer: await fileEntry.arrayBuffer(),
          format: detectedFormat,
          projectSlug,
          targetLanguage,
          sourceLanguageFallback,
          provider,
          runtimeSettings
        })
      );
    }

    const originalContent = await fileEntry.text();

    if (detectedFormat === "xliff") {
      return NextResponse.json(
        await translateXliffDocument({
          fileName: fileEntry.name,
          originalContent,
          projectSlug,
          targetLanguage,
          sourceLanguageFallback,
          provider,
          runtimeSettings
        })
      );
    }

    return NextResponse.json(
      await translateGenericDocument({
        fileName: fileEntry.name,
        originalContent,
        detectedFormat,
        projectSlug,
        targetLanguage,
        sourceLanguageFallback,
        provider,
        runtimeSettings
      })
    );
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
          message: error instanceof Error ? error.message : "Translation failed due to an unexpected server error."
        }
      } satisfies TranslationApiErrorShape,
      { status: 500 }
    );
  }
}

async function translateXliffDocument(input: {
  fileName: string;
  originalContent: string;
  projectSlug?: string;
  targetLanguage: string;
  sourceLanguageFallback?: string;
  provider: OpenAITranslationProvider;
  runtimeSettings: Awaited<ReturnType<typeof getTranslationRuntimeSettings>>;
}): Promise<TranslationApiSuccess> {
  const parsedDocument = parseXliffDocument(input.originalContent);
  const warnings: XliffWarning[] = [...parsedDocument.warnings];
  const detectedSourceLanguage = parsedDocument.sourceLanguage ?? input.sourceLanguageFallback;

  if (!detectedSourceLanguage) {
    throw new TranslationPipelineError(
      "missing_source_language",
      "This XLIFF file does not declare a usable source language. Select one manually and try again.",
      422
    );
  }

  if (!parsedDocument.sourceLanguage && input.sourceLanguageFallback) {
    warnings.push({
      code: "used_source_language_fallback",
      message: `Used the manually selected source language fallback: ${input.sourceLanguageFallback}.`
    });
  }

  const writebacks = await translateUnits({
    units: parsedDocument.units.map((unit) => ({
      id: unit.internalId,
      sourceText: unit.sourceXml,
      sourceLookupText: unit.sourceText
    })),
    sourceLanguage: detectedSourceLanguage,
    targetLanguage: input.targetLanguage,
    provider: input.provider,
    runtimeSettings: input.runtimeSettings,
    encodeExactGlossaryMatch: escapeXmlText
  });

  for (const writeback of writebacks) {
    if (writeback.warning) {
      warnings.push({
        code: "tag_mismatch_fallback",
        message: "A translation changed protected tags or placeholders. The affected unit kept its original source content.",
        unitInternalId: writeback.id
      });
    }
  }

  const translatedContent = serializeTranslatedXliff({
    originalXml: input.originalContent,
    parsedDocument,
    translations: writebacks.map(
      (writeback): TranslationWriteback => ({
        unitInternalId: writeback.id,
        translatedXml: writeback.value
      })
    ),
    targetLanguage: input.targetLanguage
  });

  await recordFileTranslationUsage(countWordsFromSourceTexts(parsedDocument.units));

  return {
    fileName: buildOutputFileName(
      input.fileName,
      detectedSourceLanguage,
      input.targetLanguage,
      input.runtimeSettings.defaultFilenameFormat,
      input.projectSlug ?? input.runtimeSettings.workspaceSlug
    ),
    translatedContent,
    warnings,
    detectedSourceLanguage,
    detectedTargetLanguage: input.targetLanguage,
    xliffVersion: parsedDocument.version,
    translatedUnitCount: writebacks.length,
    autoDownloadAfterTranslation: input.runtimeSettings.autoDownloadAfterTranslation
  };
}

async function translateGenericDocument(input: {
  fileName: string;
  originalContent: string;
  detectedFormat: Exclude<ReturnType<typeof detectTranslationFileFormat>, "xliff" | "docx" | "pptx" | null>;
  projectSlug?: string;
  targetLanguage: string;
  sourceLanguageFallback?: string;
  provider: OpenAITranslationProvider;
  runtimeSettings: Awaited<ReturnType<typeof getTranslationRuntimeSettings>>;
}): Promise<TranslationApiSuccess> {
  const detectedSourceLanguage = input.sourceLanguageFallback;

  if (!detectedSourceLanguage) {
    throw new TranslationPipelineError(
      "missing_source_language",
      "Select a source language before translating non-XLIFF files.",
      422
    );
  }

  const parsed = parseGenericDocument(input.detectedFormat, input.originalContent);
  const writebacks = await translateUnits({
    units: parsed.units.map((unit) => ({
      id: unit.id,
      sourceText: unit.sourceText,
      sourceLookupText: unit.sourceText
    })),
    sourceLanguage: detectedSourceLanguage,
    targetLanguage: input.targetLanguage,
    provider: input.provider,
    runtimeSettings: input.runtimeSettings
  });
  const translationMap = new Map(writebacks.map((writeback) => [writeback.id, writeback.value]));
  const translatedContent = serializeGenericDocument(
    input.detectedFormat,
    input.originalContent,
    parsed,
    translationMap
  );

  await recordFileTranslationUsage(countWordsFromSourceTexts(parsed.units));

  return {
    fileName: buildOutputFileName(
      input.fileName,
      detectedSourceLanguage,
      input.targetLanguage,
      input.runtimeSettings.defaultFilenameFormat,
      input.projectSlug ?? input.runtimeSettings.workspaceSlug
    ),
    translatedContent,
    warnings: [],
    detectedSourceLanguage,
    detectedTargetLanguage: input.targetLanguage,
    xliffVersion: "unknown",
    translatedUnitCount: writebacks.length,
    autoDownloadAfterTranslation: input.runtimeSettings.autoDownloadAfterTranslation
  };
}

async function translateOfficeDocument(input: {
  fileName: string;
  originalBuffer: ArrayBuffer;
  format: OfficeArchiveFormat;
  projectSlug?: string;
  targetLanguage: string;
  sourceLanguageFallback?: string;
  provider: OpenAITranslationProvider;
  runtimeSettings: Awaited<ReturnType<typeof getTranslationRuntimeSettings>>;
}): Promise<TranslationApiSuccess> {
  const detectedSourceLanguage = input.sourceLanguageFallback;

  if (!detectedSourceLanguage) {
    throw new TranslationPipelineError(
      "missing_source_language",
      `Select a source language before translating ${input.format.toUpperCase()} files.`,
      422
    );
  }

  const parsedDocument = await parseOfficeDocument(input.originalBuffer, input.format);
  const writebacks = await translateUnits({
    units: parsedDocument.units.map((unit) => ({
      id: unit.id,
      sourceText: unit.sourceText,
      sourceLookupText: unit.sourceText
    })),
    sourceLanguage: detectedSourceLanguage,
    targetLanguage: input.targetLanguage,
    provider: input.provider,
    runtimeSettings: input.runtimeSettings
  });
  const translatedArchive = await serializeTranslatedOffice(
    input.originalBuffer,
    parsedDocument,
    new Map(writebacks.map((writeback) => [writeback.id, writeback.value]))
  );

  await recordFileTranslationUsage(countWordsFromSourceTexts(parsedDocument.units));

  return {
    fileName: buildOutputFileName(
      input.fileName,
      detectedSourceLanguage,
      input.targetLanguage,
      input.runtimeSettings.defaultFilenameFormat,
      input.projectSlug ?? input.runtimeSettings.workspaceSlug
    ),
    translatedContent: null,
    translatedBinaryBase64: Buffer.from(translatedArchive).toString("base64"),
    mimeType:
      input.format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    reviewContent: parsedDocument.previewText,
    warnings: [],
    detectedSourceLanguage,
    detectedTargetLanguage: input.targetLanguage,
    xliffVersion: "unknown",
    translatedUnitCount: writebacks.length,
    autoDownloadAfterTranslation: input.runtimeSettings.autoDownloadAfterTranslation
  };
}

async function translateUnits(input: {
  units: Array<{
    id: string;
    sourceText: string;
    sourceLookupText: string;
  }>;
  sourceLanguage: string;
  targetLanguage: string;
  provider: OpenAITranslationProvider;
  runtimeSettings: Awaited<ReturnType<typeof getTranslationRuntimeSettings>>;
  encodeExactGlossaryMatch?: (value: string) => string;
}) {
  const maskedSegments = new Map<string, MaskedSegment>();
  const writebacks: Array<{ id: string; value: string; warning?: boolean }> = [];
  const glossaryMatches = input.runtimeSettings.useGlossaryAutomatically
    ? await getExactGlossaryTranslations(
        input.sourceLanguage,
        input.targetLanguage,
        input.units.map((unit) => unit.sourceLookupText)
      )
    : new Map<string, string>();
  const translationItems = input.units.flatMap((unit) => {
    const masked = maskProtectedTokens(unit.sourceText);
    maskedSegments.set(unit.id, masked);

    const exactGlossaryTranslation = glossaryMatches.get(unit.sourceLookupText.trim());

    if (exactGlossaryTranslation && input.runtimeSettings.strictGlossaryMode) {
      writebacks.push({
        id: unit.id,
        value: input.encodeExactGlossaryMatch
          ? input.encodeExactGlossaryMatch(exactGlossaryTranslation)
          : exactGlossaryTranslation
      });

      return [];
    }

    if (!containsMeaningfulText(masked.maskedText)) {
      writebacks.push({
        id: unit.id,
        value: unit.sourceText
      });

      return [];
    }

    return [
      {
        unitInternalId: unit.id,
        text: masked.maskedText,
        sourceLanguage: input.sourceLanguage,
        targetLanguage: input.targetLanguage
      }
    ];
  });

  const translatedItems = await input.provider.translateBatch(translationItems, {
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage,
    model: input.runtimeSettings.translationModel,
    maxBatchItems: input.runtimeSettings.translationBatchSize,
    toneStyle: input.runtimeSettings.toneStyle
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
        id: translatedItem.unitInternalId,
        value: restoreWithRuntimeRules(
          translatedItem.translatedText,
          maskedSegment,
          input.runtimeSettings.strictTagProtection,
          translatedItem.unitInternalId
        )
      });
    } catch (error) {
      if (
        isTranslationPipelineError(error) &&
        !input.runtimeSettings.failOnTagMismatch &&
        (error.code === "tag_mismatch" || error.code === "placeholder_mismatch")
      ) {
        writebacks.push({
          id: translatedItem.unitInternalId,
          value: maskedSegment.originalText,
          warning: true
        });
        continue;
      }

      throw error;
    }
  }

  return writebacks;
}

function parseGenericDocument(
  format: Exclude<ReturnType<typeof detectTranslationFileFormat>, "xliff" | "docx" | "pptx" | null>,
  content: string
) {
  switch (format) {
    case "po":
      return parsePoDocument(content);
    case "csv":
      return parseCsvDocument(content);
    case "strings":
      return parseStringsDocument(content);
    case "resx":
      return parseResxDocument(content);
    case "txt":
      return parseTxtDocument(content);
  }
}

function serializeGenericDocument(
  format: Exclude<ReturnType<typeof detectTranslationFileFormat>, "xliff" | "docx" | "pptx" | null>,
  originalContent: string,
  parsedDocument: ReturnType<typeof parseGenericDocument>,
  translations: Map<string, string>
) {
  switch (format) {
    case "po":
      return serializeTranslatedPo(originalContent, parsedDocument as ParsedPoDocument, translations);
    case "csv":
      return serializeTranslatedCsv(parsedDocument as ParsedCsvDocument, translations);
    case "strings":
      return serializeTranslatedStrings(originalContent, parsedDocument as ParsedStringsDocument, translations);
    case "resx":
      return serializeTranslatedResx(originalContent, parsedDocument as ParsedResxDocument, translations);
    case "txt":
      return serializeTranslatedTxt(parsedDocument as ParsedTxtDocument, translations);
  }
}

function normalizeLanguageValue(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function detectTranslationFileFormat(fileName: string) {
  if (/\.(xliff|xlf)$/i.test(fileName)) {
    return "xliff" as const;
  }

  if (/\.po$/i.test(fileName)) {
    return "po" as const;
  }

  if (/\.csv$/i.test(fileName)) {
    return "csv" as const;
  }

  if (/\.docx$/i.test(fileName)) {
    return "docx" as const;
  }

  if (/\.pptx$/i.test(fileName)) {
    return "pptx" as const;
  }

  if (/\.strings$/i.test(fileName)) {
    return "strings" as const;
  }

  if (/\.(resx|xml)$/i.test(fileName)) {
    return "resx" as const;
  }

  if (/\.txt$/i.test(fileName)) {
    return "txt" as const;
  }

  return null;
}

function buildOutputFileName(
  fileName: string,
  sourceLanguage: string,
  targetLanguage: string,
  filenameFormat: string,
  workspaceSlug: string
) {
  const match = fileName.match(/^(.*?)(\.[^.]*)$/i);
  const baseName = match ? match[1] : fileName;
  const extension = match ? match[2] : "";

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
