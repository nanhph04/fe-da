"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { type UserProfile, useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { useRouter } from "@/i18n/routing";
import { getErrorMessage } from "@/shared/api/client";
import { PublicBrand } from "@/components/layout/public/PublicBrand";
import { getSafeInternalRedirectPath, buildLocalizedHref } from "@/shared/utils/locale-path";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const getLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

type LoginValues = z.infer<ReturnType<typeof getLoginSchema>>;

const isRateLimitError = (err: unknown) => {
  if (err && typeof err === "object") {
    const errObj = err as { statusCode?: number; code?: number; status?: number };
    return errObj.statusCode === 429 || errObj.code === 429 || errObj.status === 429;
  }
  return false;
};

type LoginFormProps = {
  redirectTo?: string;
  reason?: string;
};

const getRedirectAfterLogin = (profile: UserProfile | null, redirectTo?: string) => {
  if (!profile) {
    return null;
  }

  const safeRedirectPath = getSafeInternalRedirectPath(redirectTo);

  if (safeRedirectPath) {
    if (safeRedirectPath.startsWith("/admin")) {
      return profile.role === "admin" ? safeRedirectPath : "/library";
    }

    return safeRedirectPath;
  }

  if (profile.role === "admin") {
    return "/admin";
  }

  return !profile.displayName ? "/onboarding/profile" : "/library";
};

export function LoginForm({ redirectTo, reason }: LoginFormProps) {
  const t = useTranslations("Auth");
  const tNav = useTranslations("Navigation");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(
    reason
      ? reason === "account-disabled"
        ? t("login.reasons.accountDisabled")
        : reason === "session-expired"
          ? t("login.reasons.sessionExpired")
          : null
      : null
  );
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const loginSchema = getLoginSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const { setAuthData } = useAuth();

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await authService.login(data);
      if (res.success && res.data?.accessToken) {
        const profile = await setAuthData(res.data.accessToken);
        const nextPath = getRedirectAfterLogin(profile, redirectTo);
        if (!nextPath) {
          setServerError(t("login.errors.loadProfileFailed"));
          return;
        }
        const localizedPath = buildLocalizedHref(nextPath, window.location.pathname);
        window.location.href = localizedPath;
        return;
      }

      const resObj = res as { errorCode?: string };
      if (resObj?.errorCode === "EMAIL_NOT_VERIFIED") {
        sessionStorage.setItem("pendingVerify", JSON.stringify({
          email: data.email,
          password: data.password,
          otpRequestedAt: Date.now(),
          needsResend: true,
        }));
        router.push("/verify-otp");
        return;
      }

      if (res.statusCode === 403) {
        setServerError(res.message || t("login.errors.suspended"));
        return;
      }

      setServerError(res.message || t("login.errors.failed"));
    } catch (err: unknown) {
      if (err && typeof err === "object") {
        const errObj = err as { errorCode?: string };
        if (errObj.errorCode === "EMAIL_NOT_VERIFIED") {
          sessionStorage.setItem("pendingVerify", JSON.stringify({
            email: data.email,
            password: data.password,
            otpRequestedAt: Date.now(),
            needsResend: true,
          }));
          router.push("/verify-otp");
          return;
        }
      }
      if (isRateLimitError(err)) {
        setServerError(t("rateLimit"));
      } else {
        setServerError(getErrorMessage(err, t("login.errors.generic")));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 grayscale brightness-50"
        style={{ backgroundImage: "url(/images/login-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(229,9,20,0.18),transparent_68%)]" />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-8">
        <PublicBrand href="/" />
        <div className="flex items-center gap-4">
          <span className="font-headline text-sm font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
            {tNav("help")}
          </span>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-28 pb-28">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center md:text-left">
            <h1 className="mb-2 font-headline text-5xl font-extrabold leading-none tracking-[-0.02em] text-foreground">
              {t("login.title")}
            </h1>
            <p className="text-sm tracking-wide text-muted-foreground">
              {t("login.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="email" className="mb-2 ml-1 block font-headline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t("login.emailLabel")}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    className={`w-full rounded-sm bg-input py-4 pr-12 pl-4 text-foreground placeholder:text-muted-foreground/50 ring-1 transition-all focus:outline-none focus:ring-primary/60 ${errors.email ? "ring-destructive" : "ring-border/30"}`}
                    {...register("email")}
                  />
                  <div className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center text-muted-foreground/50">
                    <span className="material-symbols-outlined">alternate_email</span>
                  </div>
                </div>
                {errors.email ? <p className="mt-1 ml-1 text-xs text-destructive">{errors.email.message}</p> : null}
              </div>

              <div className="group">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="ml-1 block font-headline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t("login.passwordLabel")}
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium uppercase tracking-widest text-secondary transition-colors hover:text-secondary/80">
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.passwordPlaceholder")}
                    className={`w-full rounded-sm bg-input py-4 pr-12 pl-4 text-foreground placeholder:text-muted-foreground/50 ring-1 transition-all focus:outline-none focus:ring-primary/60 ${errors.password ? "ring-destructive" : "ring-border/30"}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? t("login.aria.hidePassword") : t("login.aria.showPassword")}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? <p className="mt-1 ml-1 text-xs text-destructive">{errors.password.message}</p> : null}
              </div>

              {serverError ? (
                <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-5 font-headline text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/10 transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isLoading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t("login.newToVelvet")}
              <Link href="/register" className="ml-1 font-bold text-foreground transition-colors hover:text-primary">
                {t("login.createAccount")}
              </Link>
            </p>
          </footer>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center gap-8 bg-transparent py-8 opacity-50">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.privacyPolicy")}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.termsOfService")}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.cookiePreferences")}</span>
      </div>
    </div>
  );
}
