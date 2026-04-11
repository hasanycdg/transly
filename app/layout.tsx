import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { AppLocaleProvider } from "@/components/app-locale-provider";
import { SITE_ORIGIN, SITE_URL } from "@/lib/seo/metadata";
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

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Translayr",
  url: SITE_ORIGIN,
  inLanguage: ["en", "de"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_ORIGIN}/docs?query={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Translayr",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/icon.svg`
};

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: "Translayr",
  title: {
    default: "Translayr",
    template: "%s | Translayr"
  },
  description:
    "AI translation workspace for text and localization files. Translate, review, validate, and export from one operational surface.",
  keywords: [
    "ai translation",
    "translation workspace",
    "localization",
    "xliff translation",
    "docx translation",
    "translayr"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Translayr",
    title: "Translayr",
    description:
      "AI translation workspace for text and localization files. Translate, review, validate, and export from one operational surface."
  },
  twitter: {
    card: "summary_large_image",
    title: "Translayr",
    description:
      "AI translation workspace for text and localization files. Translate, review, validate, and export from one operational surface."
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <AppLocaleProvider locale={locale}>{children}</AppLocaleProvider>
      </body>
    </html>
  );
}
