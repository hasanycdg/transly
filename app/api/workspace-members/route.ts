import { NextResponse } from "next/server";

import { getWorkspaceMembers, inviteWorkspaceMember, removeWorkspaceMember } from "@/lib/supabase/workspace";
import type { WorkspaceMemberRole } from "@/types/workspace";

export async function GET() {
  try {
    const payload = await getWorkspaceMembers();

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Workspace members could not be loaded."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; role?: WorkspaceMemberRole } | null;

    if (!payload?.email || !payload?.role) {
      return NextResponse.json(
        {
          error: "Email and role are required."
        },
        { status: 400 }
      );
    }

    const result = await inviteWorkspaceMember({
      email: payload.email,
      role: payload.role
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workspace invite could not be sent.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /permission/i.test(message) ? 403 : /required|valid|supported|already/i.test(message) ? 400 : 500
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as { memberId?: string } | null;

    if (!payload?.memberId) {
      return NextResponse.json(
        {
          error: "Member id is required."
        },
        { status: 400 }
      );
    }

    const result = await removeWorkspaceMember({
      memberId: payload.memberId
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workspace member could not be removed.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /permission/i.test(message)
          ? 403
          : /required|valid|supported|already|cannot|must remain/i.test(message)
            ? 400
            : /not found/i.test(message)
              ? 404
              : 500
      }
    );
  }
}
