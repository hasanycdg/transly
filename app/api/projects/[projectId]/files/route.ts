import { NextResponse } from "next/server";

import { syncProjectFiles } from "@/lib/supabase/workspace";
import type { ProjectFileSyncInput } from "@/types/projects";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  return handleSyncRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleSyncRequest(request, context);
}

async function handleSyncRequest(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const payload = (await request.json()) as {
      files?: Partial<ProjectFileSyncInput>[];
    };

    const files = Array.isArray(payload.files)
      ? payload.files
          .map(normalizeFileInput)
          .filter((file): file is ProjectFileSyncInput => file !== null)
      : [];

    if (!projectId || files.length === 0) {
      return NextResponse.json(
        {
          error: "Project id and at least one file payload are required."
        },
        { status: 400 }
      );
    }

    const syncedFiles = await syncProjectFiles(projectId, files);

    return NextResponse.json(
      {
        files: syncedFiles
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Project file sync failed."
      },
      { status: 500 }
    );
  }
}

function normalizeFileInput(file: Partial<ProjectFileSyncInput>): ProjectFileSyncInput | null {
  const clientId = typeof file.clientId === "string" ? file.clientId.trim() : "";
  const name = typeof file.name === "string" ? file.name.trim() : "";
  const sourceLanguage = typeof file.sourceLanguage === "string" ? file.sourceLanguage.trim() : "";
  const targetLanguage = typeof file.targetLanguage === "string" ? file.targetLanguage.trim() : "";
  const words = typeof file.words === "number" && Number.isFinite(file.words) ? Math.max(0, Math.round(file.words)) : 0;
  const progress =
    typeof file.progress === "number" && Number.isFinite(file.progress)
      ? Math.max(0, Math.min(100, Math.round(file.progress)))
      : 0;
  const status = normalizeStatus(file.status);

  if (!clientId || !name || !sourceLanguage || !targetLanguage || !status) {
    return null;
  }

  return {
    clientId,
    name,
    sourceLanguage,
    targetLanguage,
    words,
    status,
    progress,
    errorMessage: typeof file.errorMessage === "string" && file.errorMessage.trim().length > 0 ? file.errorMessage.trim() : null,
    xliffVersion: typeof file.xliffVersion === "string" && file.xliffVersion.trim().length > 0 ? file.xliffVersion.trim() : null
  };
}

function normalizeStatus(status: ProjectFileSyncInput["status"] | undefined) {
  switch (status) {
    case "Queued":
    case "Processing":
    case "Review":
    case "Done":
    case "Error":
      return status;
    default:
      return null;
  }
}
