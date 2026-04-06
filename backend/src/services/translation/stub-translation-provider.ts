import { BaseTranslationProvider, type TranslateTextInput } from "./translation-provider";

export class StubTranslationProvider extends BaseTranslationProvider {
  readonly name = "stub-provider";

  constructor(private readonly mode: "annotate" | "identity" = "annotate") {
    super();
  }

  async translateText(input: TranslateTextInput): Promise<string> {
    if (this.mode === "identity") {
      return input.text;
    }

    // A deterministic placeholder translation for local development.
    // TODO: Replace with actual provider output in production environments.
    return `[${input.targetLanguage}] ${input.text}`;
  }
}
