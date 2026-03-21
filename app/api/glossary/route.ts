import { NextResponse } from "next/server";

import { normalizeGlossaryStatus } from "@/lib/glossary/csv";
import { createGlossaryTerm } from "@/lib/supabase/workspace";
import type { NewGlossaryTermInput, NewGlossaryTranslationInput } from "@/types/glossary";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<NewGlossaryTermInput>;
    const source = payload.source?.trim();
    const sourceLanguage = payload.sourceLanguage?.trim().toLowerCase() || "en";
    const status = normalizeGlossaryStatus(payload.status);
    const collectionId =
      typeof payload.collectionId === "string" && payload.collectionId.trim().length > 0
        ? payload.collectionId.trim()
        : null;
    const projectSlug =
      typeof payload.projectSlug === "string" && payload.projectSlug.trim().length > 0
        ? payload.projectSlug.trim()
        : null;
    const translations = Array.isArray(payload.translations)
      ? payload.translations.flatMap((translation): NewGlossaryTranslationInput[] => {
          if (!translation || typeof translation !== "object") {
            return [];
          }

          const locale =
            typeof translation.locale === "string" ? translation.locale.trim().toLowerCase() : "";
          const term = typeof translation.term === "string" ? translation.term.trim() : "";

          return locale && term ? [{ locale, term }] : [];
        })
      : [];

    if (!source) {
      return NextResponse.json(
        {
          error: "Source term is required."
        },
        { status: 400 }
      );
    }

    const result = await createGlossaryTerm({
      source,
      sourceLanguage,
      status,
      collectionId,
      projectSlug,
      isProtected: Boolean(payload.isProtected),
      translations
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Glossary term creation failed.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: getGlossaryRouteStatus(message)
      }
    );
  }
}

function getGlossaryRouteStatus(message: string) {
  if (/already exists/i.test(message)) {
    return 409;
  }

  if (/required|unsupported|could not be found|no longer exists|cannot be empty/i.test(message)) {
    return 400;
  }

  return 500;
}
