import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | Velvet Gallery",
  description: "Create a new password for Velvet Gallery.",
};

export default function ChangePasswordPage() {
  return <ChangePasswordForm />;
}
