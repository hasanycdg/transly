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
    "Structure-safe AI localization for XLIFF files. Upload, translate, validate, and download without breaking placeholders or XML tags."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getCurrentAppLocale();

  return (
    <html lang={locale} className={`${manrope.variable} ${bodoni.variable}`} suppressHydrationWarning>
      <body>
        <AppLocaleProvider locale={locale}>{children}</AppLocaleProvider>
      </body>
    </html>
  );
}
