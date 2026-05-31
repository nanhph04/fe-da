"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link } from "@/i18n/routing";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter } from "@/i18n/routing";
import { getErrorMessage } from "@/shared/api/client";
import { buildLocalizedHref } from "@/shared/utils/locale-path";
import { PublicBrand } from "@/components/layout/public/PublicBrand";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const getOtpSchema = (t: (key: string) => string) =>
  z.object({
    pin: z.string().min(6, { message: t("validation.otpMinLength") }),
  });

type OTPValues = z.infer<ReturnType<typeof getOtpSchema>>;

type PendingVerifyData = {
  email: string;
  password: string;
  otpRequestedAt?: number;
  needsResend?: boolean;
};

const isRateLimitError = (err: unknown) => {
  if (err && typeof err === "object") {
    const errObj = err as { statusCode?: number; code?: number; status?: number };
    return errObj.statusCode === 429 || errObj.code === 429 || errObj.status === 429;
  }
  return false;
};

const OTP_TTL_MS = 5 * 60 * 1000;

function getOtpExpiresAt(requestedAt?: number) {
  const safeRequestedAt =
    typeof requestedAt === "number" && Number.isFinite(requestedAt)
      ? requestedAt
      : Date.now();

  return safeRequestedAt + OTP_TTL_MS;
}

function getRemainingSeconds(expiresAt: number) {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function VerifyOTPForm() {
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<PendingVerifyData | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(OTP_TTL_MS / 1000);

  const router = useRouter();
  const { setAuthData } = useAuth();

  const otpSchema = getOtpSchema(t);

  const { handleSubmit, resetField, setValue, watch, formState: { errors } } = useForm<OTPValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin: "" }
  });

  const pin = watch("pin");
  const isOtpExpired = otpExpiresAt !== null && remainingSeconds === 0;

  const performResend = useCallback(async (email: string, password?: string) => {
    setServerError(null);
    setResendStatus(null);
    try {
      const res = await authService.resendOtp({
        email,
        type: "register"
      });
      if (res.success) {
        const requestedAt = Date.now();
        const nextPendingData = {
          email,
          password: password ?? pendingData?.password ?? "",
          otpRequestedAt: requestedAt,
        };

        const expiresAt = getOtpExpiresAt(requestedAt);

        sessionStorage.setItem("pendingVerify", JSON.stringify(nextPendingData));
        setPendingData(nextPendingData);
        setOtpExpiresAt(expiresAt);
        setRemainingSeconds(getRemainingSeconds(expiresAt));
        resetField("pin");
        setResendStatus(t("verifyOtp.messages.resent"));
      } else {
        setServerError(res.message || t("verifyOtp.errors.resendFailed"));
      }
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        setServerError(t("rateLimit"));
      } else {
        setServerError(getErrorMessage(err, t("verifyOtp.errors.resendFailed")));
      }
    }
  }, [resetField, t, pendingData?.password]);

  useEffect(() => {
    const data = sessionStorage.getItem("pendingVerify");
    if (data) {
      const parsedData = JSON.parse(data) as PendingVerifyData;
      const requestedAt = parsedData.otpRequestedAt ?? Date.now();
      const normalizedData = {
        ...parsedData,
        otpRequestedAt: requestedAt,
      };

      const expiresAt = getOtpExpiresAt(requestedAt);

      setPendingData(normalizedData);
      setOtpExpiresAt(expiresAt);
      setRemainingSeconds(getRemainingSeconds(expiresAt));

      if (parsedData.needsResend) {
        performResend(parsedData.email, parsedData.password);
      } else if (!parsedData.otpRequestedAt) {
        sessionStorage.setItem("pendingVerify", JSON.stringify(normalizedData));
      }
    } else {
      // Nếu không có dữ liệu, bắt về đăng ký
      router.push("/register");
    }
  }, [router, performResend]);

  useEffect(() => {
    if (!otpExpiresAt) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemainingTime = () => {
      const remaining = getRemainingSeconds(otpExpiresAt);
      setRemainingSeconds(remaining);
      if (remaining === 0) {
        setServerError(null);
      }
    };

    updateRemainingTime();
    const timerId = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(timerId);
  }, [otpExpiresAt]);

  const onSubmit = async (data: OTPValues) => {
    if (!pendingData) return;

    if (isOtpExpired) {
      setServerError(t("verifyOtp.messages.expiredError"));
      setResendStatus(null);
      return;
    }

    setIsLoading(true);
    setServerError(null);
    setResendStatus(null);

    try {
      // 1. Verify OTP
      const verifyRes = await authService.verifyEmail({
        email: pendingData.email,
        otp: data.pin,
      });

      if (verifyRes.success) {
        // 2. Auto Login
        const loginRes = await authService.login({
          email: pendingData.email,
          password: pendingData.password
        });

        if (loginRes.success && loginRes.data?.accessToken) {
          sessionStorage.removeItem("pendingVerify");
          const profile = await setAuthData(loginRes.data.accessToken);
          // Redirect dựa trên trạng thái profile
          const redirectTo = profile && !profile.displayName
            ? "/onboarding/profile"
            : "/library";
          const localizedPath = buildLocalizedHref(redirectTo, window.location.pathname);
          window.location.href = localizedPath;
        } else {
          router.push("/login"); // Lỡ login lỗi thì ném ra ngoài để user tự login
        }
      } else {
        setServerError(verifyRes.message || t("verifyOtp.errors.failed"));
      }
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        setServerError(t("rateLimit"));
      } else {
        setServerError(getErrorMessage(err, t("verifyOtp.errors.generic")));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (!pendingData) return;
    performResend(pendingData.email, pendingData.password);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-background/35 px-6 py-6 backdrop-blur-xl md:px-8">
        <PublicBrand href="/" />
        <div className="flex items-center gap-4">
          {/* <span className="font-headline text-sm font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
            {tNav("help")}
          </span> */}
          <LanguageSwitcher />
        </div>
      </header>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#19191c_0%,#0e0e10_100%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtbJ6IwTU70YSNcFbZH2Qdcc-AiOjAWpB9C3G_i0SN1NUDizxzF-ki7bRizssSjFyTPcqQv0j-nM5DP9kqKMZABSUfcwbe54nRl1ZqO6HHg1Vl6ZYgP1ZETfBJU49oaCDe6taBEP5jsUBYujTsGYG_0aHQEHDYW3SixlWE9rbqX3WJFwb8w9zozLwhf8bp0W_FOLyivNwDE9_wz0tjrC7__bOB-DjA62djnFFgurN2WW5KNkV4iexYztUWkK6usyl4_E-7PW8vadj4')", backgroundSize: "cover", backgroundPosition: "center" }}
      />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 main-otp pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-lg bg-card p-10 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-50" />
            <div className="mb-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="material-symbols-outlined text-3xl text-primary">shield_person</span>
              </div>
              <h1 className="mb-3 font-headline text-3xl font-black tracking-[-0.02em] text-foreground">{t("verifyOtp.title")}</h1>
              <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">{t("verifyOtp.subtitle")}</p>
              <p className="mt-3 rounded-full border border-border/30 bg-muted/40 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-secondary">
                {t("verifyOtp.expiresIn", { time: formatCountdown(remainingSeconds) })}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="w-full">
                <InputOTP maxLength={6} value={pin} onChange={(value) => setValue("pin", value)} className="w-full">
                  <InputOTPGroup className="flex w-full justify-between gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="h-20 w-14 rounded-sm bg-input font-headline text-3xl font-extrabold text-primary ring-1 ring-border/30 transition-all data-[active=true]:ring-2 data-[active=true]:ring-primary"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                {errors.pin ? <p className="mt-3 text-center text-xs text-destructive">{errors.pin.message}</p> : null}

                {serverError ? (
                  <div className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                  </div>
                ) : null}

                {isOtpExpired ? (
                  <div className="mt-4 rounded-sm border border-secondary/30 bg-secondary/10 p-3">
                    <p className="text-center text-xs font-medium text-secondary">{t("verifyOtp.messages.expiredErrorResend")}</p>
                  </div>
                ) : null}

                {resendStatus ? (
                  <div className="mt-4 rounded-sm border border-green-500/30 bg-green-500/10 p-3">
                    <p className="text-center text-xs font-medium text-green-400">{resendStatus}</p>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isLoading || !pendingData || isOtpExpired}
                className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isLoading ? t("verifyOtp.verifying") : t("verifyOtp.verifyIdentity")}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <button type="button" onClick={handleResend} className="group flex items-center gap-2 transition-opacity hover:opacity-80">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("verifyOtp.resendCode")}</span>
                <span className="h-px w-8 bg-border" />
                <span className={`font-headline text-xs font-bold ${isOtpExpired ? "text-destructive" : "text-secondary"}`}>
                  {isOtpExpired ? t("verifyOtp.expired") : formatCountdown(remainingSeconds)}
                </span>
              </button>

              <Link href="/login" className="inline-flex items-center gap-1 text-[10px] uppercase tracking-tight text-muted-foreground transition-colors hover:text-foreground">
                <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
                {t("verifyOtp.backToLogin")}
              </Link>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="flex-1 rounded-sm bg-card/60 p-4 backdrop-blur-sm">
              <span className="material-symbols-outlined mb-2 block text-lg text-secondary">lock_open</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("verifyOtp.secureAccess")}</p>
              <p className="mt-1 text-xs text-foreground/60">{t("verifyOtp.encryptedSession")}</p>
            </div>
            <div className="flex-1 rounded-sm bg-card/60 p-4 backdrop-blur-sm">
              <span className="material-symbols-outlined mb-2 block text-lg text-primary">support_agent</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("verifyOtp.noCode")}</p>
              <p className="mt-1 text-xs text-foreground/60">{t("verifyOtp.checkSpam")}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-8 bg-transparent py-8 opacity-50">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.privacyPolicy")}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.termsOfService")}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">{t("footer.cookiePreferences")}</span>
      </footer>
    </div>
  );
}
