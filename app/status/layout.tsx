import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "Platform Status and Uptime",
  description:
    "Check Translayr uptime, service health, and incident history for translation APIs, exports, workspace, and billing systems.",
  path: "/status"
});

export default function StatusLayout({ children }: { children: ReactNode }) {
  return children;
}
