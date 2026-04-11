import type { Metadata } from "next";

import { MarketingPage } from "@/components/marketing/landing-page";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "AI Translation Product Suite",
  description:
    "Explore the Translayr product suite for workspace translation operations, file localization pipelines, and quality-controlled multilingual output.",
  path: "/products"
});

export default function ProductsPage() {
  return <MarketingPage pageId="products" />;
}
