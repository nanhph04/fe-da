import { LoginForm } from "@/features/auth/components/LoginForm";
import { getServerUserProfile, type ServerUserProfile } from "@/shared/auth/server";
import { buildLocalizedHref, getSafeInternalRedirectPath } from "@/shared/utils/locale-path";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Đăng nhập | Velvet Gallery",
  description: "Đăng nhập vào tài khoản Velvet Gallery của bạn.",
};

const getDefaultAuthenticatedRedirectPath = (profile: ServerUserProfile) => {
  if (profile.role === "admin") {
    return "/admin";
  }

  return !profile.displayName ? "/onboarding/profile" : "/library";
};

const getAuthenticatedRedirectPath = (profile: ServerUserProfile, redirectTo?: string) => {
  if (profile.role === "admin") {
    return "/admin";
  }

  const safeRedirectPath = getSafeInternalRedirectPath(redirectTo);

  if (!safeRedirectPath) {
    return getDefaultAuthenticatedRedirectPath(profile);
  }

  if (safeRedirectPath.startsWith("/admin")) {
    return "/library";
  }

  return safeRedirectPath;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve(undefined),
  ]);
  const redirectParam = resolvedSearchParams?.redirect;
  const reasonParam = resolvedSearchParams?.reason;
  const redirectTo = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;
  const reason = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;

  let profile: ServerUserProfile | null = null;

  try {
    profile = await getServerUserProfile();
  } catch {
    return <LoginForm redirectTo={redirectTo} reason={reason} />;
  }

  redirect(buildLocalizedHref(getAuthenticatedRedirectPath(profile, redirectTo), `/${locale}`));
}
