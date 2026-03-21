import { NextResponse } from "next/server";

import { importGlossaryCsv } from "@/lib/supabase/workspace";
import type { ImportGlossaryCsvInput } from "@/types/glossary";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<ImportGlossaryCsvInput>;
    const csv = payload.csv?.trim();

    if (!csv) {
      return NextResponse.json(
        {
          error: "CSV content is required."
        },
        { status: 400 }
      );
    }

    const result = await importGlossaryCsv(csv);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Glossary CSV import failed.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /empty|source is required|unsupported|could not be found|unclosed/i.test(message)
          ? 400
          : 500
      }
    );
  }
}
