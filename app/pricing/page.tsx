import type { Metadata } from "next";

import { MarketingPage } from "@/components/marketing/landing-page";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "AI Translation Pricing Plans",
  description:
    "Transparent usage-based pricing for AI translation. Start free and scale with monthly credits for your localization workload.",
  path: "/pricing"
});

export default function PricingPage() {
  return <MarketingPage pageId="pricing" />;
}
