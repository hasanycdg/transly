import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { AnalyticsEventsListener } from "@/components/analytics/analytics-events-listener";
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

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-NK3MKMJN";
const COOKIE_SCRIPT_SRC = "https://cdn.cookie-script.com/s/f049a14342a6bb80ad391e914c565e5f.js";

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
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script src={COOKIE_SCRIPT_SRC} strategy="beforeInteractive" type="text/javascript" charSet="UTF-8" />
        <AnalyticsEventsListener />
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
