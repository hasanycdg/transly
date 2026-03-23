import type { Metadata } from "next";

import { AcceptInviteScreen } from "@/components/auth/accept-invite-screen";

export const metadata: Metadata = {
  title: "Einladung annehmen | Translayr",
  description: "Bestätige deine Supabase-Einladung und öffne den richtigen Translayr-Workspace."
};

export default function AcceptInvitePage() {
  return <AcceptInviteScreen />;
}
