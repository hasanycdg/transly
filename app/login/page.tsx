import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthScreen } from "@/components/auth/auth-screen";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Anmelden | Translayr",
  description: "Melde dich an und öffne dein Translayr-Dashboard."
};

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/projects");
  }

  return <AuthScreen mode="login" />;
}
