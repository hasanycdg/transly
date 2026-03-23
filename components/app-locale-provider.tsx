"use client";

import { createContext, useContext, type ReactNode } from "react";

import { DEFAULT_APP_LOCALE } from "@/lib/i18n";
import type { AppLocale } from "@/types/i18n";

const AppLocaleContext = createContext<AppLocale>(DEFAULT_APP_LOCALE);

export function AppLocaleProvider({
  children,
  locale
}: {
  children: ReactNode;
  locale: AppLocale;
}) {
  return (
    <AppLocaleContext.Provider value={locale}>
      {children}
    </AppLocaleContext.Provider>
  );
}

export function useAppLocale(): AppLocale {
  return useContext(AppLocaleContext);
}
