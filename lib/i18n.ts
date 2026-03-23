import type { AppLocale } from "@/types/i18n";

export const DEFAULT_APP_LOCALE: AppLocale = "en";

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  return value === "de" ? "de" : DEFAULT_APP_LOCALE;
}

export function getIntlLocale(locale: AppLocale): string {
  return locale === "de" ? "de-DE" : "en-US";
}

export function getLocaleOptionLabel(
  option: AppLocale,
  locale: AppLocale
): string {
  if (option === "de") {
    return locale === "de" ? "Deutsch" : "German";
  }

  return locale === "de" ? "Englisch" : "English";
}

export function getAppLocaleOptions(locale: AppLocale): Array<{
  code: AppLocale;
  label: string;
}> {
  return (["en", "de"] as const).map((option) => ({
    code: option,
    label: getLocaleOptionLabel(option, locale)
  }));
}

export function translateBinary(value: boolean, locale: AppLocale): string {
  if (locale === "de") {
    return value ? "Ja" : "Nein";
  }

  return value ? "Yes" : "No";
}

export function translateProjectOrFileStatus(
  status: string,
  locale: AppLocale
): string {
  if (locale !== "de") {
    if (status === "Completed") {
      return "Done";
    }

    return status;
  }

  switch (status) {
    case "Active":
      return "Aktiv";
    case "In Review":
    case "Review":
      return "In Prüfung";
    case "Completed":
    case "Done":
      return "Fertig";
    case "Processing":
      return "In Bearbeitung";
    case "Queued":
      return "Warteschlange";
    case "Error":
      return "Fehler";
    default:
      return status;
  }
}

export function translateGlossaryStatus(
  status: string,
  locale: AppLocale
): string {
  if (locale !== "de") {
    return status;
  }

  switch (status) {
    case "Draft":
      return "Entwurf";
    case "Review":
      return "Prüfung";
    case "Approved":
      return "Freigegeben";
    case "Archived":
      return "Archiviert";
    default:
      return status;
  }
}

export function translateProjectFilterLabel(
  filter: string,
  locale: AppLocale
): string {
  if (locale !== "de") {
    return filter;
  }

  switch (filter) {
    case "All":
      return "Alle";
    case "Active":
      return "Aktiv";
    case "Review":
      return "Prüfung";
    case "Done":
      return "Fertig";
    default:
      return filter;
  }
}
