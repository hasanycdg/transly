import { NextResponse } from "next/server";

import { deleteProject, updateProjectIdentity } from "@/lib/supabase/workspace";

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const payload = (await request.json()) as { name?: string };
    const name = payload.name?.trim();

    if (!projectId) {
      return NextResponse.json(
        {
          error: "Project id is required."
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error: "Project name is required."
        },
        { status: 400 }
      );
    }

    const project = await updateProjectIdentity(projectId, { name });

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Project update failed.";

    return NextResponse.json(
      {
        error: message
      },
      { status: /required|not found/i.test(message) ? 400 : 500 }
    );
  }
}
