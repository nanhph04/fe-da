"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/shared/api/client";
import { PublicBrand } from "@/components/layout/public/PublicBrand";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { PublicLegalFooter } from "./PublicLegalFooter";

const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("validation.invalidEmail")),
  });

const getResetPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("validation.invalidEmail")),
    otp: z.string().min(6, t("validation.otpMinLength")),
    newPassword: z.string().min(6, t("validation.passwordMinLength")),
    confirmPassword: z.string().min(6, t("validation.confirmPasswordMinLength")),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  });

type ForgotPasswordValues = z.infer<ReturnType<typeof getForgotPasswordSchema>>;
type ResetPasswordValues = z.infer<ReturnType<typeof getResetPasswordSchema>>;
type ForgotPasswordStep = "request" | "reset" | "complete";

const isRateLimitError = (err: unknown) => {
  if (err && typeof err === "object") {
    const errObj = err as { statusCode?: number; code?: number; status?: number };
    return errObj.statusCode === 429 || errObj.code === 429 || errObj.status === 429;
  }
  return false;
};

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [step, setStep] = useState<ForgotPasswordStep>("request");
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const forgotPasswordSchema = getForgotPasswordSchema(t);
  const resetPasswordSchema = getResetPasswordSchema(t);

  const {
    register: registerEmail,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    setValue,
    watch,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const otp = watch("otp");
  const resetEmail = watch("email");

  const onRequestOtp = async (data: ForgotPasswordValues) => {
    setIsRequestLoading(true);
    setServerError(null);
    setStatusMessage(null);
    try {
      const res = await authService.forgotPassword(data);
      if (res.success) {
        setValue("email", data.email, { shouldValidate: true });
        setValue("otp", "");
        setStep("reset");
        setStatusMessage(t("forgotPassword.otpSent"));
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
      setIsRequestLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordValues) => {
    setIsResetLoading(true);
    setServerError(null);
    setStatusMessage(null);
    try {
      const res = await authService.resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      if (res.success) {
        setStep("complete");
      } else {
        setServerError(res.message || t("forgotPassword.errors.resetFailed"));
      }
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        setServerError(t("rateLimit"));
      } else {
        setServerError(getErrorMessage(err, t("forgotPassword.errors.resetGeneric")));
      }
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!resetEmail) {
      setServerError(t("validation.invalidEmail"));
      return;
    }

    setIsResending(true);
    setServerError(null);
    setStatusMessage(null);
    try {
      const res = await authService.forgotPassword({ email: resetEmail });
      if (res.success) {
        setValue("otp", "");
        setStatusMessage(t("forgotPassword.otpResent"));
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
      setIsResending(false);
    }
  };

  const handleUseAnotherEmail = () => {
    setStep("request");
    setServerError(null);
    setStatusMessage(null);
    setValue("otp", "");
    setValue("newPassword", "");
    setValue("confirmPassword", "");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
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

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-24 pb-36 sm:pb-32">
        <div className="w-full max-w-[480px]">
          <div className="relative overflow-hidden rounded-lg bg-card p-8 shadow-2xl md:p-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
            <header className="mb-10 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
              </div>
              <h1 className="mb-3 font-headline text-3xl font-extrabold tracking-[-0.02em] text-foreground">
                {step === "complete" ? t("forgotPassword.completeTitle") : t("forgotPassword.title")}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step === "request"
                  ? t("forgotPassword.subtitle")
                  : step === "reset"
                    ? t("forgotPassword.resetSubtitle")
                    : t("forgotPassword.completeDesc")}
              </p>
            </header>

            {step === "request" ? (
              <form onSubmit={handleRequestSubmit(onRequestOtp)} className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="email">
                    {t("forgotPassword.emailLabel")}
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-xl text-muted-foreground transition-colors group-focus-within:text-primary">mail</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder={t("forgotPassword.emailPlaceholder")}
                      className={`w-full rounded-sm bg-input py-4 pr-4 pl-12 text-foreground placeholder:text-muted-foreground/50 ring-1 transition-all outline-none focus:ring-2 focus:ring-primary ${requestErrors.email ? "ring-destructive" : "ring-border/30"}`}
                      {...registerEmail("email")}
                    />
                  </div>
                  {requestErrors.email ? <p className="text-xs text-destructive">{requestErrors.email.message}</p> : null}
                </div>

                {serverError ? (
                  <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isRequestLoading}
                  className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {isRequestLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isRequestLoading ? t("forgotPassword.sending") : t("forgotPassword.sendOtp")}
                </button>
              </form>
            ) : null}

            {step === "reset" ? (
              <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="reset-email">
                    {t("forgotPassword.emailLabel")}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted-foreground">mail</span>
                    <input
                      id="reset-email"
                      type="email"
                      placeholder={t("forgotPassword.emailPlaceholder")}
                      className={`w-full rounded-sm bg-input py-4 pr-4 pl-12 text-foreground placeholder:text-muted-foreground/50 ring-1 transition-all outline-none focus:ring-2 focus:ring-primary ${resetErrors.email ? "ring-destructive" : "ring-border/30"}`}
                      {...registerReset("email")}
                    />
                  </div>
                  {resetErrors.email ? <p className="text-xs text-destructive">{resetErrors.email.message}</p> : null}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="otp">
                      {t("forgotPassword.otpLabel")}
                    </label>
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResendOtp}
                      className="text-[10px] font-bold uppercase tracking-widest text-secondary transition-colors hover:text-secondary/80 disabled:opacity-50"
                    >
                      {isResending ? t("forgotPassword.resending") : t("forgotPassword.resendOtp")}
                    </button>
                  </div>
                  <InputOTP id="otp" maxLength={6} value={otp} onChange={(value) => setValue("otp", value, { shouldValidate: true })} className="w-full">
                    <InputOTPGroup className="flex w-full justify-between gap-2 sm:gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-14 w-10 rounded-sm bg-input font-headline text-xl font-extrabold text-primary ring-1 ring-border/30 transition-all data-[active=true]:ring-2 data-[active=true]:ring-primary sm:h-16 sm:w-12 sm:text-2xl"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {resetErrors.otp ? <p className="text-xs text-destructive">{resetErrors.otp.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="new-password">
                    {t("forgotPassword.newPasswordLabel")}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted-foreground">lock</span>
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("forgotPassword.newPasswordPlaceholder")}
                      className={`w-full rounded-sm bg-input py-4 pr-12 pl-12 text-foreground placeholder:text-muted-foreground/50 ring-1 transition-all outline-none focus:ring-2 focus:ring-primary ${resetErrors.newPassword ? "ring-destructive" : "ring-border/30"}`}
                      {...registerReset("newPassword")}
                    />
                    <button
                      type="button"
                      aria-label={showNewPassword ? t("forgotPassword.aria.hideNewPassword") : t("forgotPassword.aria.showNewPassword")}
                      aria-pressed={showNewPassword}
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {resetErrors.newPassword ? <p className="text-xs text-destructive">{resetErrors.newPassword.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="confirm-new-password">
                    {t("forgotPassword.confirmNewPasswordLabel")}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted-foreground">verified_user</span>
                    <input
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("forgotPassword.newPasswordPlaceholder")}
                      className={`w-full rounded-sm bg-input py-4 pr-12 pl-12 text-foreground placeholder:text-muted-foreground/50 ring-1 transition-all outline-none focus:ring-2 focus:ring-primary ${resetErrors.confirmPassword ? "ring-destructive" : "ring-border/30"}`}
                      {...registerReset("confirmPassword")}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? t("forgotPassword.aria.hideConfirmPassword") : t("forgotPassword.aria.showConfirmPassword")}
                      aria-pressed={showConfirmPassword}
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {resetErrors.confirmPassword ? <p className="text-xs text-destructive">{resetErrors.confirmPassword.message}</p> : null}
                </div>

                {statusMessage ? (
                  <div className="rounded-sm border border-green-500/30 bg-green-500/10 p-3">
                    <p className="text-center text-xs font-medium text-green-400">{statusMessage}</p>
                  </div>
                ) : null}

                {serverError ? (
                  <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {isResetLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {isResetLoading ? t("forgotPassword.resetting") : t("forgotPassword.resetPassword")}
                </button>

                <button
                  type="button"
                  className="w-full rounded-sm py-3 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground ring-1 ring-border transition-all hover:text-foreground hover:ring-primary/50"
                  onClick={handleUseAnotherEmail}
                >
                  {t("forgotPassword.tryAnotherEmail")}
                </button>
              </form>
            ) : null}

            {step === "complete" ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-1 ring-primary/30 shadow-[0_0_30px_rgba(229,9,20,0.18)]">
                  <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
                </div>
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                >
                  {t("forgotPassword.signInNow")}
                </Link>
              </div>
            ) : null}

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

      <PublicLegalFooter />
    </div>
  );
}
