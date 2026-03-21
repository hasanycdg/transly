import { NextResponse } from "next/server";

import { createGlossaryCollection } from "@/lib/supabase/workspace";
import type { NewGlossaryCollectionInput } from "@/types/glossary";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<NewGlossaryCollectionInput>;
    const name = payload.name?.trim();
    const detail =
      typeof payload.detail === "string" && payload.detail.trim().length > 0
        ? payload.detail.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        {
          error: "Collection name is required."
        },
        { status: 400 }
      );
    }

    const result = await createGlossaryCollection({
      name,
      detail
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Glossary collection creation failed.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /already exists/i.test(message) ? 409 : /required|cannot be empty/i.test(message) ? 400 : 500
      }
    );
  }
}
