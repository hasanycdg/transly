import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://translayr.dev";

function normalizeSiteUrl(value: string | null | undefined): string {
  const candidate = (value ?? "").trim();
  if (!candidate) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_ORIGIN = normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL);
export const SITE_URL = new URL(SITE_ORIGIN);

type StaticPageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createStaticPageMetadata({ title, description, path }: StaticPageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Translayr",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export const PRIVATE_ROBOTS_METADATA: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true
};
