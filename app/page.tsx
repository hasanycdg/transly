import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/marketing/landing-page";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createStaticPageMetadata({
  title: "AI Translation Workspace for Teams",
  description:
    "Translate files and text with AI in one workflow. Manage projects, glossary terms, quality checks, and exports in Translayr.",
  path: "/"
});

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code : null;

  if (code) {
    const next = typeof params.next === "string" ? params.next : "/dashboard";
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
  }

  return <LandingPage />;
}
