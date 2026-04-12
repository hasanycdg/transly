import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/projects",
          "/translate",
          "/usage",
          "/billing",
          "/settings",
          "/support",
          "/glossary",
          "/developer-api"
        ]
      }
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN
  };
}
