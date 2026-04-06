import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { AppLocaleProvider } from "@/components/app-locale-provider";
import { getCurrentAppLocale } from "@/lib/supabase/workspace";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Translayr",
  description:
    "AI translation workspace for text and localization files. Translate, review, validate, and export from one operational surface."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getCurrentAppLocale();

  return (
    <html lang={locale} className={`${manrope.variable} ${bodoni.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppLocaleProvider locale={locale}>{children}</AppLocaleProvider>
      </body>
    </html>
  );
}
