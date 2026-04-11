import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "Privacy Policy and Data Protection",
  description:
    "Privacy policy for Translayr, including data handling, security measures, retention, and user rights.",
  path: "/privacy"
});

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
