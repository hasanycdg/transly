import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/landing-page";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "AI Translation Workspace for Teams",
  description:
    "Translate files and text with AI in one workflow. Manage projects, glossary terms, quality checks, and exports in Translayr.",
  path: "/"
});

export default function HomePage() {
  return <LandingPage />;
}
