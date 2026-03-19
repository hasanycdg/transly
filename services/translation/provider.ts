import type {
  TranslationBatchItem,
  TranslationBatchResult,
  TranslationContext
} from "@/types/translation";

export interface TranslationProvider {
  translateBatch(
    items: TranslationBatchItem[],
    context: TranslationContext
  ): Promise<TranslationBatchResult[]>;
}

export function chunkTranslationItems(
  items: TranslationBatchItem[],
  limits: {
    maxItems?: number;
    maxCharacters?: number;
  } = {}
): TranslationBatchItem[][] {
  const maxItems = limits.maxItems ?? 20;
  const maxCharacters = limits.maxCharacters ?? 6000;
  const batches: TranslationBatchItem[][] = [];
  let currentBatch: TranslationBatchItem[] = [];
  let currentCharacters = 0;

  for (const item of items) {
    const wouldExceedItems = currentBatch.length >= maxItems;
    const wouldExceedCharacters =
      currentBatch.length > 0 && currentCharacters + item.text.length > maxCharacters;

    if (wouldExceedItems || wouldExceedCharacters) {
      batches.push(currentBatch);
      currentBatch = [];
      currentCharacters = 0;
    }

    currentBatch.push(item);
    currentCharacters += item.text.length;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}
