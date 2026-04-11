import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/seo/metadata";

type PublicRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/products/workspace", changeFrequency: "weekly", priority: 0.8 },
  { path: "/products/file-translation", changeFrequency: "weekly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/status", changeFrequency: "daily", priority: 0.6 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.4 },
  { path: "/login", changeFrequency: "monthly", priority: 0.3 },
  { path: "/register", changeFrequency: "monthly", priority: 0.3 },
  { path: "/reset-password", changeFrequency: "yearly", priority: 0.1 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_ORIGIN}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
