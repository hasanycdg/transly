import type { Metadata } from "next";

import { MarketingPage } from "@/components/marketing/landing-page";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "Workspace Translation Platform",
  description:
    "Run translation projects in a single workspace: track progress, coordinate review, and control glossary usage across multilingual releases.",
  path: "/products/workspace"
});

export default function WorkspaceProductPage() {
  return <MarketingPage pageId="workspace" />;
}
