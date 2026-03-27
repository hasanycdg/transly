import type { XliffVersion, XliffWarning } from "@/types/xliff";

export type ProtectedTokenKind = "xml_tag" | "placeholder";

export interface ProtectedToken {
  token: string;
  kind: ProtectedTokenKind;
  original: string;
  index: number;
}

export type ProtectedTokenMap = Record<string, string>;

export interface MaskedSegment {
  originalText: string;
  maskedText: string;
  tokens: ProtectedToken[];
  map: ProtectedTokenMap;
  tokenCount: number;
}

export type UnmaskWarningCode = "reordered_tokens";

export interface UnmaskWarning {
  code: UnmaskWarningCode;
  message: string;
  tokens: string[];
}

export interface TokenValidationResult {
  expectedTokens: string[];
  foundTokens: string[];
  missingTokens: string[];
  unexpectedTokens: string[];
  duplicatedTokens: string[];
  reorderedTokens: string[];
}

export interface UnmaskResult {
  text: string;
  warnings: UnmaskWarning[];
  validation: TokenValidationResult;
}

export interface TranslationBatchItem {
  unitInternalId: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationBatchResult {
  unitInternalId: string;
  translatedText: string;
}

export interface TranslationContext {
  sourceLanguage: string;
  targetLanguage: string;
  model?: string;
  maxBatchItems?: number;
  toneStyle?: string;
}

export interface TranslationApiSuccess {
  fileName: string;
  translatedContent: string | null;
  translatedBinaryBase64?: string | null;
  mimeType?: string;
  reviewContent?: string | null;
  warnings: XliffWarning[];
  detectedSourceLanguage: string;
  detectedTargetLanguage: string;
  xliffVersion: XliffVersion;
  translatedUnitCount: number;
  autoDownloadAfterTranslation: boolean;
}

export interface TextTranslationApiSuccess {
  translatedText: string;
  detectedSourceLanguage: string;
  targetLanguage: string;
  toneStyle: string;
  wordCount: number;
  characterCount: number;
}

export interface TranslationApiErrorShape {
  error: {
    code: PipelineErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type PipelineErrorCode =
  | "malformed_xml"
  | "unsupported_xliff"
  | "missing_source_language"
  | "missing_source_nodes"
  | "placeholder_mismatch"
  | "tag_mismatch"
  | "invalid_ai_response"
  | "translation_provider_error"
  | "validation_error";

export class TranslationPipelineError extends Error {
  code: PipelineErrorCode;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    code: PipelineErrorCode,
    message: string,
    status = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "TranslationPipelineError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isTranslationPipelineError(
  error: unknown
): error is TranslationPipelineError {
  return error instanceof TranslationPipelineError;
}
