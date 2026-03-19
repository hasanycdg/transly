import { NextResponse } from "next/server";

import { createProject } from "@/lib/supabase/workspace";
import type { NewProjectInput } from "@/types/projects";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<NewProjectInput>;
    const name = payload.name?.trim();
    const description = payload.description?.trim();
    const sourceLanguage = payload.sourceLanguage?.trim();
    const targetLanguages = Array.isArray(payload.targetLanguages)
      ? payload.targetLanguages.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [];

    if (!name || !description || !sourceLanguage || targetLanguages.length === 0) {
      return NextResponse.json(
        {
          error: "Name, description, source language, and at least one target language are required."
        },
        { status: 400 }
      );
    }

    const project = await createProject({
      name,
      description,
      sourceLanguage,
      targetLanguages
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Project creation failed."
      },
      { status: 500 }
    );
  }
}
