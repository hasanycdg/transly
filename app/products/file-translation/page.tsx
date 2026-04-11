import type { Metadata } from "next";

import { MarketingPage } from "@/components/marketing/landing-page";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "File Translation Software for Localization",
  description:
    "Translate XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX with AI while preserving structure and export-ready formats.",
  path: "/products/file-translation"
});

export default function FileTranslationProductPage() {
  return <MarketingPage pageId="files" />;
}
