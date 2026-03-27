import type { AppLocale } from "@/types/i18n";

export type LanguageOption = {
  code: string;
  label: string;
};

const LANGUAGE_LABELS: Record<string, { en: string; de: string }> = {
  en: { en: "English", de: "Englisch" },
  ar: { en: "Arabic", de: "Arabisch" },
  bg: { en: "Bulgarian", de: "Bulgarisch" },
  cs: { en: "Czech", de: "Tschechisch" },
  da: { en: "Danish", de: "Dänisch" },
  de: { en: "German", de: "Deutsch" },
  el: { en: "Greek", de: "Griechisch" },
  et: { en: "Estonian", de: "Estnisch" },
  fi: { en: "Finnish", de: "Finnisch" },
  fr: { en: "French", de: "Französisch" },
  es: { en: "Spanish", de: "Spanisch" },
  he: { en: "Hebrew", de: "Hebräisch" },
  hi: { en: "Hindi", de: "Hindi" },
  hr: { en: "Croatian", de: "Kroatisch" },
  hu: { en: "Hungarian", de: "Ungarisch" },
  id: { en: "Indonesian", de: "Indonesisch" },
  it: { en: "Italian", de: "Italienisch" },
  ko: { en: "Korean", de: "Koreanisch" },
  lt: { en: "Lithuanian", de: "Litauisch" },
  lv: { en: "Latvian", de: "Lettisch" },
  nl: { en: "Dutch", de: "Niederländisch" },
  no: { en: "Norwegian", de: "Norwegisch" },
  pt: { en: "Portuguese", de: "Portugiesisch" },
  pl: { en: "Polish", de: "Polnisch" },
  ro: { en: "Romanian", de: "Rumänisch" },
  ru: { en: "Russian", de: "Russisch" },
  sk: { en: "Slovak", de: "Slowakisch" },
  sl: { en: "Slovenian", de: "Slowenisch" },
  sr: { en: "Serbian", de: "Serbisch" },
  sv: { en: "Swedish", de: "Schwedisch" },
  tr: { en: "Turkish", de: "Türkisch" },
  th: { en: "Thai", de: "Thailändisch" },
  uk: { en: "Ukrainian", de: "Ukrainisch" },
  vi: { en: "Vietnamese", de: "Vietnamesisch" },
  zh: { en: "Chinese", de: "Chinesisch" },
  zh_cn: { en: "Chinese (Simplified)", de: "Chinesisch (vereinfacht)" },
  zh_tw: { en: "Chinese (Traditional)", de: "Chinesisch (traditionell)" },
  af: { en: "Afrikaans", de: "Afrikaans" },
  ca: { en: "Catalan", de: "Katalanisch" },
  is: { en: "Icelandic", de: "Isländisch" },
  ga: { en: "Irish", de: "Irisch" },
  ms: { en: "Malay", de: "Malaiisch" },
  mt: { en: "Maltese", de: "Maltesisch" },
  fa: { en: "Persian", de: "Persisch" },
  sw: { en: "Swahili", de: "Suaheli" },
  tl: { en: "Tagalog", de: "Tagalog" },
  bn: { en: "Bengali", de: "Bengalisch" },
  ur: { en: "Urdu", de: "Urdu" },
  ta: { en: "Tamil", de: "Tamil" },
  te: { en: "Telugu", de: "Telugu" },
  mr: { en: "Marathi", de: "Marathi" },
  gu: { en: "Gujarati", de: "Gujarati" },
  kn: { en: "Kannada", de: "Kannada" },
  ml: { en: "Malayalam", de: "Malayalam" },
  pa: { en: "Punjabi", de: "Punjabi" },
  sq: { en: "Albanian", de: "Albanisch" },
  mk: { en: "Macedonian", de: "Mazedonisch" },
  bs: { en: "Bosnian", de: "Bosnisch" },
  az: { en: "Azerbaijani", de: "Aserbaidschanisch" },
  kk: { en: "Kazakh", de: "Kasachisch" },
  uz: { en: "Uzbek", de: "Usbekisch" },
  ka: { en: "Georgian", de: "Georgisch" },
  hy: { en: "Armenian", de: "Armenisch" },
  am: { en: "Amharic", de: "Amharisch" },
  ne: { en: "Nepali", de: "Nepalesisch" },
  lo: { en: "Lao", de: "Laotisch" },
  km: { en: "Khmer", de: "Khmer" },
  ja: { en: "Japanese", de: "Japanisch" }
};

export function getLanguageLabelForLocale(
  code: string,
  locale: AppLocale = "en"
): string {
  return LANGUAGE_LABELS[code]?.[locale] ?? code.toUpperCase();
}

export function getLanguageOptions(
  locale: AppLocale = "en",
  preferredCodes: string[] = []
): LanguageOption[] {
  const availableCodes = Object.keys(LANGUAGE_LABELS);
  const prioritizedCodes = Array.from(
    new Set(preferredCodes.filter((code) => availableCodes.includes(code)))
  );
  const prioritizedCodeSet = new Set(prioritizedCodes);
  const remainingCodes = availableCodes
    .filter((code) => !prioritizedCodeSet.has(code))
    .sort((left, right) =>
      getLanguageLabelForLocale(left, locale).localeCompare(getLanguageLabelForLocale(right, locale), locale)
    );

  return [...prioritizedCodes, ...remainingCodes].map((code) => ({
    code,
    label: getLanguageLabelForLocale(code, locale)
  }));
}

export const LANGUAGE_OPTIONS: LanguageOption[] = getLanguageOptions("en");
