"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { authService } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/shared/api/client";
import { PublicBrand } from "@/components/layout/public/PublicBrand";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const getRegisterSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(6, t("validation.passwordMinLength")),
    confirmPassword: z.string().min(6, t("validation.confirmPasswordMinLength")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<ReturnType<typeof getRegisterSchema>>;

const isRateLimitError = (err: unknown) => {
  if (err && typeof err === "object") {
    const errObj = err as { statusCode?: number; code?: number; status?: number };
    return errObj.statusCode === 429 || errObj.code === 429 || errObj.status === 429;
  }
  return false;
};

export function RegisterForm() {
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const registerSchema = getRegisterSchema(t);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);
    setServerError(null);
    const otpRequestedAt = Date.now();

    try {
      const res = await authService.register({
        email: data.email,
        password: data.password,
      });

      if (res.success) {
        // Lưu tạm email/password vào sessionStorage để gửi tiếp lúc Verify OTP
        sessionStorage.setItem("pendingVerify", JSON.stringify({
          email: data.email,
          password: data.password,
          otpRequestedAt,
        }));
        router.push("/verify-otp");
      } else {
        setServerError(res.message || t("register.errors.failed"));
      }
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        setServerError(t("rateLimit"));
      } else {
        setServerError(getErrorMessage(err, t("register.errors.generic")));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center blur-md brightness-50"
        style={{ backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCr8QKxm6IY5Hhlg_8RKY_QHi4BkzTjZ-Ez185srdjNMIjE-2-O3d8Z9OaW5L-3mKBFw9DOnGU7VLGRudvUf52Gd487_neP-6FG4ROU5CkVHvN5iDKM-62UC7p5qrjzvstELv1Hxt4eu58K3uzTum_RiISzn2-eecEJDUjm8hdia67pOdDmDCgY4VCUj_gaMGTLN_Sy4hTfM7jr8VyQ2dZOutRsK_iTfYN-YFowp1or7i8BRcvQY0HRZ_wD87QxcUQ9IqqqNjCfrf4H)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/65 to-background" />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-8">
        <PublicBrand href="/" />
        <div className="flex items-center gap-4">
          {/* <span className="font-headline text-sm font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
            {tNav("help")}
          </span> */}
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-[480px] rounded-lg border border-white/5 bg-card/40 p-10 shadow-2xl backdrop-blur-2xl md:p-12">
          <div className="mb-10 space-y-2">
            <h1 className="font-headline text-4xl font-extrabold tracking-[-0.02em] text-foreground">
              {t("register.title")}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("register.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-secondary/80" htmlFor="email">
                  {t("register.emailLabel")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted-foreground">mail</span>
                  <input
                    id="email"
                    type="email"
                    placeholder={t("register.emailPlaceholder")}
                    className={`w-full rounded-sm bg-input py-4 pr-4 pl-12 text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-primary/60 ${errors.email ? "ring-1 ring-destructive" : "ring-1 ring-transparent"}`}
                    {...register("email")}
                  />
                </div>
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-secondary/80" htmlFor="password">
                  {t("register.passwordLabel")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted-foreground">lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("register.passwordPlaceholder")}
                    className={`w-full rounded-sm bg-input py-4 pr-12 pl-12 text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-primary/60 ${errors.password ? "ring-1 ring-destructive" : "ring-1 ring-transparent"}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? t("register.aria.hidePassword") : t("register.aria.showPassword")}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-secondary/80" htmlFor="confirmPassword">
                  {t("register.confirmPasswordLabel")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted-foreground">verified_user</span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    className={`w-full rounded-sm bg-input py-4 pr-12 pl-12 text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-1 focus:ring-primary/60 ${errors.confirmPassword ? "ring-1 ring-destructive" : "ring-1 ring-transparent"}`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? t("register.aria.hideConfirmPassword") : t("register.aria.showConfirmPassword")}
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword ? <p className="text-xs text-destructive">{errors.confirmPassword.message}</p> : null}
              </div>

              {serverError ? (
                <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                </div>
              ) : null}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isLoading ? t("register.creating") : t("register.createAccount")}
              </button>
            </div>
          </form>

          <div className="mt-10 space-y-4 border-t border-white/5 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("register.alreadyHaveAccount")}
              <Link href="/login" className="ml-1 font-semibold text-primary transition-colors hover:text-primary/80">
                {t("register.signIn")}
              </Link>
            </p>
            <p className="text-[10px] leading-loose uppercase tracking-widest text-muted-foreground/50">
              {t("register.termsAgreement")} <br />
              <span className="underline underline-offset-4">{t("register.termsOfService")}</span> & <span className="underline underline-offset-4">{t("register.privacyPolicy")}</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 flex justify-center gap-8 bg-transparent py-8 opacity-50">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.privacyPolicy")}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.termsOfService")}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.cookiePreferences")}</span>
      </footer>
    </div>
  );
}
