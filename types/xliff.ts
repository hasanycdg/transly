export type XliffVersion = "1.2" | "2.x" | "unknown";

export type XliffWarningCode =
  | "missing_source"
  | "missing_target"
  | "missing_source_language"
  | "unsupported_unit_structure"
  | "skipped_empty_source"
  | "used_source_language_fallback"
  | "tag_mismatch_fallback";

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

export interface XliffTranslationInsertion {
  unitInternalId: string;
  translatedXml: string;
  unitId?: string;
  fileId?: string;
  segmentId?: string;
}

export type TranslationWriteback = XliffTranslationInsertion;

export type XliffRebuildWarningCode =
  | "translation_not_found"
  | "duplicate_translation_input"
  | "source_node_unresolved"
  | "target_node_unresolved"
  | "target_created"
  | "target_updated"
  | "target_skipped"
  | "ambiguous_unit_match";

export interface XliffRebuildWarning {
  code: XliffRebuildWarningCode;
  message: string;
  unitInternalId?: string;
  unitId?: string;
  fileId?: string;
}

export type XliffRebuildAction =
  | "updated_existing_target"
  | "created_missing_target"
  | "skipped";

export interface XliffRebuildUnitResult {
  unitInternalId: string;
  action: XliffRebuildAction;
  unitId?: string;
  fileId?: string;
  sourceNodeRef: NodeRef;
  targetNodeRef?: NodeRef;
}

export interface XliffRebuildParams {
  originalXml: string;
  parsedDocument: ParsedXliffDocument;
  translations: XliffTranslationInsertion[];
  targetLanguage: string;
}

export interface XliffRebuildResult {
  xml: string;
  warnings: XliffRebuildWarning[];
  unitResults: XliffRebuildUnitResult[];
  translatedUnitCount: number;
}

export type XliffValidationIssueCode =
  | "malformed_xml"
  | "missing_target_node"
  | "unresolved_mask_token"
  | "invalid_inline_xml"
  | "missing_processed_translation";

export interface XliffValidationIssue {
  code: XliffValidationIssueCode;
  message: string;
  severity: "error" | "warning";
  unitInternalId?: string;
  unitId?: string;
  fileId?: string;
}

export interface XliffValidationResult {
  valid: boolean;
  issues: XliffValidationIssue[];
  errors: XliffValidationIssue[];
  warnings: XliffValidationIssue[];
}
