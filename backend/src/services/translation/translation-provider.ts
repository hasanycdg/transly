import type { StructuredTranslationResult, TranslationOptions } from "../../types/translation";
import { translateStructuredPayload } from "./structured-translator";

export type TranslateTextInput = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  fieldPath?: string;
};

export type TranslateStructuredPayloadInput = {
  payload: unknown;
  sourceLanguage: string;
  targetLanguage: string;
  options?: TranslationOptions;
};

export interface TranslationProvider {
  readonly name: string;
  translateText(input: TranslateTextInput): Promise<string>;
  translateStructuredPayload(input: TranslateStructuredPayloadInput): Promise<StructuredTranslationResult>;
}

export abstract class BaseTranslationProvider implements TranslationProvider {
  abstract readonly name: string;

  abstract translateText(input: TranslateTextInput): Promise<string>;

  async translateStructuredPayload(input: TranslateStructuredPayloadInput): Promise<StructuredTranslationResult> {
    return translateStructuredPayload(
      input.payload,
      {
        sourceLanguage: input.sourceLanguage,
        targetLanguage: input.targetLanguage,
        translationOptions: input.options
      },
      ({ text, sourceLanguage, targetLanguage, fieldPath }) =>
        this.translateText({ text, sourceLanguage, targetLanguage, fieldPath })
    );
  }
}
