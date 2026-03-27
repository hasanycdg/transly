import { TranslationPipelineError } from "@/types/translation";

export type ParsedTxtDocument = {
  units: Array<{
    id: string;
    sourceText: string;
  }>;
};

export function parseTxtDocument(content: string): ParsedTxtDocument {
  if (content.trim().length === 0) {
    throw new TranslationPipelineError(
      "validation_error",
      "The uploaded text file is empty.",
      422
    );
  }

  return {
    units: [
      {
        id: "txt-1",
        sourceText: content
      }
    ]
  };
}

export function serializeTranslatedTxt(
  parsedDocument: ParsedTxtDocument,
  translations: Map<string, string>
) {
  const translated = translations.get(parsedDocument.units[0]?.id ?? "");

  if (typeof translated !== "string") {
    throw new TranslationPipelineError(
      "validation_error",
      "No translated text was available for the TXT file.",
      500
    );
  }

  return translated;
}
