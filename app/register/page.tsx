import type { Metadata } from "next";

import { AuthScreen } from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Registrieren | Translayr",
  description: "Erstelle deinen Translayr-Workspace und gehe direkt ins Dashboard."
};

export default function RegisterPage() {
  return <AuthScreen mode="register" />;
}
