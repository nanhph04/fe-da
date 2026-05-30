"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/shared/api/client";
import { PublicBrand } from "@/components/layout/public/PublicBrand";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("validation.invalidEmail")),
  });

type ForgotPasswordValues = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

const isRateLimitError = (err: unknown) => {
  if (err && typeof err === "object") {
    const errObj = err as { statusCode?: number; code?: number; status?: number };
    return errObj.statusCode === 429 || errObj.code === 429 || errObj.status === 429;
  }
  return false;
};

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const forgotPasswordSchema = getForgotPasswordSchema(t);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await authService.forgotPassword(data);
      if (res.success) {
        setIsSent(true);
      } else {
        setServerError(res.message || t("forgotPassword.errors.failed"));
      }
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        setServerError(t("rateLimit"));
      } else {
        setServerError(getErrorMessage(err, t("forgotPassword.errors.generic")));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-background/35 px-6 py-6 backdrop-blur-xl md:px-8">
        <PublicBrand href="/" />
        <div className="flex items-center gap-4">
          {/* <span className="font-headline text-sm font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
            {tNav("help")}
          </span> */}
          <LanguageSwitcher />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuC6L2gIFE9e98uTGvg6q3dnynuMUCYu8-xAitkbIeF8CGD-eqwXqpItOokDjY_rOTQYxEilBlwNZuUeLzI7g_0EOi_Vx74cNNiMKMCOQqtC0X2RudWppaQinlL1RCjq2Z9LtDQldIzXUGa0CqaF2U61ezMoyY5Rs3X0x1mJqnnF--jIyQH9BrjQiseEbEFPDnpJYkFVkHSUqzFFZ6uoORNI5Rnq6lkA6Gs5XIIyGwuBThEnsMQdXDuxHZMvgCV1raBi6AUCg7snk-W7')] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-[440px]">
          <div className="relative overflow-hidden rounded-lg bg-card p-8 shadow-2xl md:p-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
            <header className="mb-10 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
              </div>
              <h1 className="mb-3 font-headline text-3xl font-extrabold tracking-[-0.02em] text-foreground">{t("forgotPassword.title")}</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("forgotPassword.subtitle")}
              </p>
            </header>

            {isSent ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-1 ring-primary/30 shadow-[0_0_30px_rgba(229,9,20,0.18)]">
                  <span className="material-symbols-outlined text-4xl text-primary">mail</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-foreground">{t("forgotPassword.successTitle")}</h3>
                <p className="text-muted-foreground">
                  {t("forgotPassword.successDesc")}
                </p>
                <button
                  type="button"
                  className="w-full rounded-sm py-4 font-headline text-sm font-bold uppercase tracking-widest text-muted-foreground ring-1 ring-border transition-all hover:text-foreground hover:ring-primary/50"
                  onClick={() => setIsSent(false)}
                >
                  {t("forgotPassword.tryAnotherEmail")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="email">
                    {t("forgotPassword.emailLabel")}
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-xl text-muted-foreground group-focus-within:text-primary transition-colors">mail</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder={t("forgotPassword.emailPlaceholder")}
                      className={`w-full rounded-sm bg-input py-4 pr-4 pl-12 text-foreground placeholder:text-muted-foreground/50 ring-1 transition-all outline-none focus:ring-2 focus:ring-primary ${errors.email ? "ring-destructive" : "ring-border/30"}`}
                      {...register("email")}
                    />
                  </div>
                  {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
                </div>

                {serverError ? (
                  <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isLoading ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
                </button>
              </form>
            )}

            <div className="mt-8 border-t border-border/10 pt-8 text-center">
              <Link href="/login" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {t("forgotPassword.backToSignIn")}
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">{t("forgotPassword.secureAuth")}</p>
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
