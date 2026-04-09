import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Velvet Gallery",
  description: "Sign in to your Velvet Gallery account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
