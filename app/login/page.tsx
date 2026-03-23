import type { Metadata } from "next";

import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Anmelden | Translayr",
  description: "Melde dich an und öffne dein Translayr-Dashboard."
};

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
