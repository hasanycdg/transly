import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "Translation Workflow Documentation",
  description:
    "Read Translayr documentation for setup, translation workflows, supported formats, glossary handling, billing, and team operations.",
  path: "/docs"
});

export default function DocsLayout({ children }: { children: ReactNode }) {
  return children;
}
