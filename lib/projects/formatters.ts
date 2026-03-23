import { getIntlLocale } from "@/lib/i18n";
import { getLanguageLabelForLocale } from "@/lib/languages";
import type { AppLocale } from "@/types/i18n";

export function formatProjectDate(
  value: string,
  locale: AppLocale = "en"
): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function formatCompactNumber(
  value: number,
  locale: AppLocale = "en"
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getLanguageLabel(
  code: string,
  locale: AppLocale = "en"
): string {
  return getLanguageLabelForLocale(code, locale);
}

export function formatLanguagePair(
  sourceLanguage: string,
  targetLanguages: string[],
  locale: AppLocale = "en"
): string {
  const source = getLanguageLabel(sourceLanguage, locale);
  const targets = targetLanguages.map((targetLanguage) => getLanguageLabel(targetLanguage, locale)).join(", ");

  return locale === "de" ? `${source} nach ${targets}` : `${source} to ${targets}`;
}
