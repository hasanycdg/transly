import { NextResponse } from "next/server";

import { getSettingsScreenData, updateSettings } from "@/lib/supabase/workspace";
import type { SettingsScreenData } from "@/types/workspace";

export async function GET() {
  try {
    const settings = await getSettingsScreenData();

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Settings could not be loaded."
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as Partial<SettingsScreenData>;

    if (!payload.profile || !payload.translation || !payload.preferences || !payload.dangerZone) {
      return NextResponse.json(
        {
          error: "A complete settings payload is required."
        },
        { status: 400 }
      );
    }

    const settings = await updateSettings(payload as SettingsScreenData);

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Settings could not be saved.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /required|valid|supported|identical/i.test(message) ? 400 : 500
      }
    );
  }
}
