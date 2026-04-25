"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter } from "next/navigation";

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
          setAuthData(loginRes.data.accessToken);
          router.push("/library");
        } else {
          router.push("/login"); // Lỡ login lỗi thì ném ra ngoài để user tự login
        }
      } else {
        setServerError(verifyRes.mess || "Verification failed");
      }
    } catch (err: any) {
      setServerError(err.mess || err.message || "An error occurred during verification");
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
    } catch (err: any) {
      setServerError(err.mess || "Failed to resend OTP");
    }
  };

  return (
    <>
      <div className="mb-12 text-center md:text-left">
        <h1 
          className="text-5xl font-extrabold tracking-tighter text-[#f9f5f8] mb-2 leading-none"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Two-Step Verification
        </h1>
        <p className="font-sans text-[#adaaad] text-sm tracking-wide">
          A verification code has been sent to your email.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex flex-col items-center md:items-start w-full">
        <div className="flex flex-col w-full">
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(value) => setValue("pin", value)}
            className="w-full flex justify-between gap-2"
          >
            <InputOTPGroup className="gap-2 sm:gap-3 flex w-full justify-between">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot 
                  key={index}
                  index={index} 
                  className="w-12 h-16 sm:w-14 sm:h-20 text-2xl sm:text-3xl font-extrabold rounded-sm bg-[#000000] border-none ring-1 ring-[#48474a]/30 focus:ring-2 focus:ring-[#ff8e80]/50 text-[#ff8e80] shadow-sm data-[active=true]:ring-[#ff8e80] transition-all" 
                  style={{ fontFamily: 'var(--font-headline)' }}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {errors.pin && <p className="text-xs text-[#ff6e84] mt-3 text-center md:text-left">{errors.pin.message}</p>}
          
          {serverError && (
            <div className="mt-4 p-3 bg-[#ff6e84]/10 border border-[#ff6e84]/30 rounded-sm w-full">
              <p className="text-xs text-[#ff6e84] text-center font-medium">{serverError}</p>
            </div>
          )}

          {resendStatus && (
            <div className="mt-4 p-3 bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-sm w-full">
              <p className="text-xs text-[#4ade80] text-center font-medium">{resendStatus}</p>
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={isLoading || !pendingData}
          className="flex items-center justify-center w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] py-5 rounded-sm font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#ff8e80]/10 hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
          {isLoading ? "Verifying..." : "Verify Identity"}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-[#48474a]/10 w-full flex flex-col items-center gap-4">
        <div onClick={handleResend} className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-[#adaaad] text-xs uppercase tracking-widest font-medium" style={{ fontFamily: 'var(--font-headline)' }}>Resend Code</span>
        </div>
      </div>
      
      <footer className="mt-8 text-center">
        <Link href="/login" className="inline-flex items-center text-zinc-500 hover:text-[#f9f5f8] transition-colors font-headline text-[10px] uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm mr-1">keyboard_backspace</span>
          Back to Login
        </Link>
      </footer>
    </>
  );
}
