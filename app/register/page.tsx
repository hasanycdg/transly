import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthScreen } from "@/components/auth/auth-screen";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Registrieren | Translayr",
  description: "Erstelle deinen Translayr-Workspace und gehe direkt ins Dashboard."
};

export default async function RegisterPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/projects");
  }

  return <AuthScreen mode="register" />;
}
