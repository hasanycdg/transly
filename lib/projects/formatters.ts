import { LANGUAGE_OPTIONS } from "@/lib/languages";

export function formatProjectDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getLanguageLabel(code: string): string {
  return LANGUAGE_OPTIONS.find((option) => option.code === code)?.label ?? code.toUpperCase();
}

export function formatLanguagePair(sourceLanguage: string, targetLanguages: string[]): string {
  const source = getLanguageLabel(sourceLanguage);
  const targets = targetLanguages.map(getLanguageLabel).join(", ");

  return `${source} to ${targets}`;
}
