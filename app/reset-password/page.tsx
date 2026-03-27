import type { Metadata } from "next";

import { ResetPasswordScreen } from "@/components/auth/reset-password-screen";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen | Translayr",
  description: "Setze dein Passwort zurück und gehe zurück in deinen Workspace."
};

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
