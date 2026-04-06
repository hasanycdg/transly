import type { StructuredTranslationResult, TranslationOptions } from "../../types/translation";

type TranslateTextFnInput = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  fieldPath: string;
};

type TranslateTextFn = (input: TranslateTextFnInput) => Promise<string>;

type TranslationContext = {
  sourceLanguage: string;
  targetLanguage: string;
  options?: TranslationOptions;
  warnings: string[];
  stats: StructuredTranslationResult["stats"];
};

const ALWAYS_SKIP_KEYS = new Set([
  "id",
  "_id",
  "postid",
  "siteurl",
  "posttype",
  "sourcelanguage",
  "targetlanguage",
  "guid",
  "uuid"
]);

const FILE_LIKE_KEY_PATTERN = /(image|images|file|files|attachment|media|thumbnail|mime|alt_text|srcset)/i;
const RELATION_KEY_PATTERN = /(relationship|relations|related|parent|children|taxonomy|term_ids|author_id)/i;
const URL_KEY_PATTERN = /(url|uri|href|src|canonical|permalink|link)/i;
const SLUG_KEY_PATTERN = /(slug|post_name)/i;

const FILE_EXTENSIONS = /\.(avif|bmp|gif|ico|jpeg|jpg|png|svg|webp|mp3|mp4|mov|wav|zip|pdf|docx|pptx|xlsx|txt|json|xml)$/i;
const URL_PATTERN = /^(https?:\/\/|www\.)/i;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_ID_PATTERN = /^0x[0-9a-f]+$/i;
const NUMERIC_ID_PATTERN = /^[0-9]{1,20}$/;

function getSkipReason(key: string | null, value: string, options?: TranslationOptions): string | null {
  const normalizedKey = (key ?? "").toLowerCase();
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return "empty string";
  }

  if (ALWAYS_SKIP_KEYS.has(normalizedKey) || normalizedKey.endsWith("id")) {
    return "id-like field";
  }

  if (RELATION_KEY_PATTERN.test(normalizedKey)) {
    return "relationship field";
  }

  if (FILE_LIKE_KEY_PATTERN.test(normalizedKey)) {
    return "file/media field";
  }

  if (SLUG_KEY_PATTERN.test(normalizedKey) && !options?.translateSlugs) {
    return "slug translation disabled";
  }

  if (URL_KEY_PATTERN.test(normalizedKey) && !options?.translateUrls) {
    return "url translation disabled";
  }

  if (URL_PATTERN.test(trimmedValue) && !options?.translateUrls) {
    return "url-like value";
  }

  if (FILE_EXTENSIONS.test(trimmedValue)) {
    return "file reference value";
  }

  if (UUID_PATTERN.test(trimmedValue) || HEX_ID_PATTERN.test(trimmedValue) || NUMERIC_ID_PATTERN.test(trimmedValue)) {
    return "identifier-like value";
  }

  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmedValue)) {
    return "non-linguistic string";
  }

  return null;
}

async function translateNode(
  value: unknown,
  key: string | null,
  path: string,
  context: TranslationContext,
  translateText: TranslateTextFn
): Promise<unknown> {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    context.stats.totalStringFields += 1;

    const reason = getSkipReason(key, value, context.options);
    if (reason) {
      context.stats.skippedStringFields += 1;
      return value;
    }

    try {
      const translated = await translateText({
        text: value,
        sourceLanguage: context.sourceLanguage,
        targetLanguage: context.targetLanguage,
        fieldPath: path
      });

      if (translated === value) {
        context.stats.skippedStringFields += 1;
      } else {
        context.stats.translatedStringFields += 1;
      }

      return translated;
    } catch (error) {
      context.stats.failedStringFields += 1;
      context.warnings.push(
        `Field "${path}" failed to translate and was left unchanged. ${error instanceof Error ? error.message : "Unknown provider error."}`
      );
      return value;
    }
  }

  if (Array.isArray(value)) {
    const translatedItems = await Promise.all(
      value.map((item, index) => translateNode(item, key, `${path}[${index}]`, context, translateText))
    );
    return translatedItems;
  }

  if (typeof value === "object") {
    const translatedObject: Record<string, unknown> = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      const childPath = path ? `${path}.${childKey}` : childKey;
      translatedObject[childKey] = await translateNode(childValue, childKey, childPath, context, translateText);
    }
    return translatedObject;
  }

  return value;
}

export async function translateStructuredPayload(
  payload: unknown,
  options: {
    sourceLanguage: string;
    targetLanguage: string;
    translationOptions?: TranslationOptions;
  },
  translateText: TranslateTextFn
): Promise<StructuredTranslationResult> {
  const context: TranslationContext = {
    sourceLanguage: options.sourceLanguage,
    targetLanguage: options.targetLanguage,
    options: options.translationOptions,
    warnings: [],
    stats: {
      totalStringFields: 0,
      translatedStringFields: 0,
      skippedStringFields: 0,
      failedStringFields: 0
    }
  };

  const translatedPayload = await translateNode(payload, null, "", context, translateText);

  return {
    translatedPayload,
    warnings: context.warnings,
    stats: context.stats
  };
}
