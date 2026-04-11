import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "Terms of Service and Usage Rules",
  description:
    "Terms of service for Translayr, including usage conditions, billing, acceptable use, and legal responsibilities.",
  path: "/terms"
});

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
