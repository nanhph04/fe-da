import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Velvet Gallery",
  description: "Đăng nhập vào tài khoản Velvet Gallery của bạn.",
};

export default function LoginPage() {
  return <LoginForm />;
}
