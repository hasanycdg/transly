import { NextResponse } from "next/server";

import { deleteProject } from "@/lib/supabase/workspace";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        {
          error: "Project id is required."
        },
        { status: 400 }
      );
    }

    await deleteProject(projectId);

    return NextResponse.json(
      {
        ok: true
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Project deletion failed."
      },
      { status: 500 }
    );
  }
}
