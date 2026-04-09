import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Velvet Gallery",
  description: "Create a new Velvet Gallery account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
