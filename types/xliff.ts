export type XliffVersion = "1.2" | "2.x" | "unknown";

export type XliffWarningCode =
  | "missing_source"
  | "missing_target"
  | "missing_source_language"
  | "unsupported_unit_structure"
  | "skipped_empty_source"
  | "used_source_language_fallback";

export interface XliffWarning {
  code: XliffWarningCode;
  message: string;
  unitInternalId?: string;
  fileId?: string;
}

export interface NodeRef {
  path: number[];
  nodeName: string;
  role: "source" | "target";
}

export interface ParsedXliffFile {
  id?: string;
  original?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  unitIds: string[];
}

export interface TranslationUnitMetadata {
  container: "trans-unit" | "unit" | "segment";
  segmentId?: string;
  state?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  namespaceUri?: string | null;
}

export interface ParsedTranslationUnit {
  internalId: string;
  unitId?: string;
  fileId?: string;
  sourceXml: string;
  sourceText: string;
  targetXml?: string;
  targetText?: string;
  sourceNodeRef: NodeRef;
  targetNodeRef?: NodeRef;
  metadata: TranslationUnitMetadata;
  warnings: XliffWarning[];
}

export interface ParsedXliffDocument {
  version: XliffVersion;
  sourceLanguage?: string;
  targetLanguage?: string;
  files: ParsedXliffFile[];
  units: ParsedTranslationUnit[];
  warnings: XliffWarning[];
  rootName: string;
  namespaceUri?: string | null;
}

export interface TranslationWriteback {
  unitInternalId: string;
  translatedXml: string;
}
