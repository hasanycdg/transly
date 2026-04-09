import { NextResponse } from "next/server";

import { updateNotificationPreferences } from "@/lib/supabase/workspace";
import type { SettingsNotificationsData } from "@/types/workspace";

function isNotificationPreferencesPayload(value: unknown): value is SettingsNotificationsData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<SettingsNotificationsData>;

  return (
    typeof payload.translationCompleteEmail === "boolean" &&
    typeof payload.invoiceCreatedEmail === "boolean" &&
    typeof payload.paymentFailedEmail === "boolean" &&
    typeof payload.spendingLimitEmail === "boolean" &&
    typeof payload.reviewReminders === "boolean" &&
    typeof payload.inAppNotifications === "boolean"
  );
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as unknown;

    if (!isNotificationPreferencesPayload(payload)) {
      return NextResponse.json(
        {
          error: "A complete notifications payload is required."
        },
        { status: 400 }
      );
    }

    const preferences = await updateNotificationPreferences(payload);

    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification preferences could not be saved.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: /required|valid|supported/i.test(message) ? 400 : 500
      }
    );
  }
}
