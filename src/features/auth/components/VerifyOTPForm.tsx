"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter } from "@/i18n/routing";
import { getErrorMessage } from "@/shared/api/client";
import { PublicBrand } from "@/components/layout/public/PublicBrand";

const otpSchema = z.object({
  pin: z.string().min(6, { message: "OTP must be 6 digits" }),
});

type OTPValues = z.infer<typeof otpSchema>;

export function VerifyOTPForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<{email: string, password: string} | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  
  const router = useRouter();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const data = sessionStorage.getItem("pendingVerify");
    if (data) {
      setPendingData(JSON.parse(data));
    } else {
      // Nếu không có dữ liệu, bắt về đăng ký
      router.push("/register");
    }
  }, [router]);

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<OTPValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin: "" }
  });

  const pin = watch("pin");

  const onSubmit = async (data: OTPValues) => {
    if (!pendingData) return;
    
    setIsLoading(true);
    setServerError(null);
    setResendStatus(null);
    
    try {
      // 1. Verify OTP
      const verifyRes = await authService.verifyEmail({
        email: pendingData.email,
        otp: data.pin,
        password: pendingData.password
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
          router.push(redirectTo);
        } else {
          router.push("/login"); // Lỡ login lỗi thì ném ra ngoài để user tự login
        }
      } else {
        setServerError(verifyRes.mess || "Verification failed");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "An error occurred during verification"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingData) return;
    setServerError(null);
    setResendStatus(null);
    try {
      const res = await authService.resendOtp({
        email: pendingData.email,
        type: "register"
      });
      if (res.success) {
        setResendStatus("OTP has been resent to your email.");
      } else {
        setServerError(res.mess || "Failed to resend OTP");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Failed to resend OTP"));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-background/35 px-6 py-6 backdrop-blur-xl md:px-8">
        <PublicBrand href="/" />
        <span className="font-headline text-sm font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground">Help</span>
      </header>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#19191c_0%,#0e0e10_100%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtbJ6IwTU70YSNcFbZH2Qdcc-AiOjAWpB9C3G_i0SN1NUDizxzF-ki7bRizssSjFyTPcqQv0j-nM5DP9kqKMZABSUfcwbe54nRl1ZqO6HHg1Vl6ZYgP1ZETfBJU49oaCDe6taBEP5jsUBYujTsGYG_0aHQEHDYW3SixlWE9rbqX3WJFwb8w9zozLwhf8bp0W_FOLyivNwDE9_wz0tjrC7__bOB-DjA62djnFFgurN2WW5KNkV4iexYztUWkK6usyl4_E-7PW8vadj4')", backgroundSize: "cover", backgroundPosition: "center" }}
      />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-lg bg-card p-10 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-50" />
            <div className="mb-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="material-symbols-outlined text-3xl text-primary">shield_person</span>
              </div>
              <h1 className="mb-3 font-headline text-3xl font-black tracking-[-0.02em] text-foreground">Two-Step Verification</h1>
              <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">A verification code has been sent to your email.</p>
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

                {resendStatus ? (
                  <div className="mt-4 rounded-sm border border-green-500/30 bg-green-500/10 p-3">
                    <p className="text-center text-xs font-medium text-green-400">{resendStatus}</p>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isLoading || !pendingData}
                className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-4 font-headline text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isLoading ? "Verifying..." : "Verify Identity"}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <button type="button" onClick={handleResend} className="group flex items-center gap-2 transition-opacity hover:opacity-80">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Resend Code</span>
                <span className="h-px w-8 bg-border" />
                <span className="font-headline text-xs font-bold text-secondary">01:59</span>
              </button>

              <Link href="/login" className="inline-flex items-center gap-1 text-[10px] uppercase tracking-tight text-muted-foreground transition-colors hover:text-foreground">
                <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
                Back to Login
              </Link>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="flex-1 rounded-sm bg-card/60 p-4 backdrop-blur-sm">
              <span className="material-symbols-outlined mb-2 block text-lg text-secondary">lock_open</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Secure Access</p>
              <p className="mt-1 text-xs text-foreground/60">End-to-end encrypted session</p>
            </div>
            <div className="flex-1 rounded-sm bg-card/60 p-4 backdrop-blur-sm">
              <span className="material-symbols-outlined mb-2 block text-lg text-primary">support_agent</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No Code?</p>
              <p className="mt-1 text-xs text-foreground/60">Check your spam folder</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-8 bg-transparent py-8 opacity-50">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">Privacy Policy</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">Terms of Service</span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground">Cookie Preferences</span>
      </footer>
    </div>
  );
}
