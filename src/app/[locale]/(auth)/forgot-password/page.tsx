import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Velvet Gallery",
  description: "Recover your Velvet Gallery account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
