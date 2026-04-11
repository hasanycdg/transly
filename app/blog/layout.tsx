import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "Translation and Localization Blog",
  description:
    "Product updates, localization strategy, and translation workflow insights from the Translayr team.",
  path: "/blog"
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
