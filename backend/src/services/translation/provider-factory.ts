import type { Environment } from "../../config/env";
import { LlmTranslationProvider } from "./llm-translation-provider";
import { StubTranslationProvider } from "./stub-translation-provider";
import type { TranslationProvider } from "./translation-provider";

export function createTranslationProvider(env: Environment): TranslationProvider {
  if (env.TRANSLATION_PROVIDER === "llm") {
    return new LlmTranslationProvider();
  }

  return new StubTranslationProvider(env.STUB_TRANSLATION_MODE);
}
