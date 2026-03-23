import type { AppLocale } from "@/types/i18n";

export type LanguageOption = {
  code: string;
  label: string;
};

const LANGUAGE_LABELS: Record<string, { en: string; de: string }> = {
  en: { en: "English", de: "Englisch" },
  de: { en: "German", de: "Deutsch" },
  fr: { en: "French", de: "Französisch" },
  es: { en: "Spanish", de: "Spanisch" },
  it: { en: "Italian", de: "Italienisch" },
  nl: { en: "Dutch", de: "Niederländisch" },
  pt: { en: "Portuguese", de: "Portugiesisch" },
  pl: { en: "Polish", de: "Polnisch" },
  tr: { en: "Turkish", de: "Türkisch" },
  ja: { en: "Japanese", de: "Japanisch" }
};

export function getLanguageLabelForLocale(
  code: string,
  locale: AppLocale = "en"
): string {
  return LANGUAGE_LABELS[code]?.[locale] ?? code.toUpperCase();
}

export function getLanguageOptions(
  locale: AppLocale = "en"
): LanguageOption[] {
  return Object.keys(LANGUAGE_LABELS).map((code) => ({
    code,
    label: getLanguageLabelForLocale(code, locale)
  }));
}

export const LANGUAGE_OPTIONS: LanguageOption[] = getLanguageOptions("en");
