import { countWordsFromTranslationUnits } from "@/lib/translation/word-count";
import { parseXliffDocument } from "@/lib/xliff/parser";

export function countXliffTranslationWords(xml: string) {
  const parsed = parseXliffDocument(xml);

  return countWordsFromTranslationUnits(parsed.units);
}
