import { LoginForm } from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Đăng nhập | Velvet Gallery",
  description: "Đăng nhập vào tài khoản Velvet Gallery của bạn.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const redirectParam = resolvedSearchParams?.redirect;
  const reasonParam = resolvedSearchParams?.reason;
  const redirectTo = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;
  const reason = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;

  return <LoginForm redirectTo={redirectTo} reason={reason} />;
}
