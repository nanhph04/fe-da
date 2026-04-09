"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const otpSchema = z.object({
  pin: z.string().min(6, { message: "OTP must be 6 digits" }),
});

type OTPValues = z.infer<typeof otpSchema>;

export function VerifyOTPForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<OTPValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin: "" }
  });

  const pin = watch("pin");

  const onSubmit = async (data: OTPValues) => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Verify OTP:", data);
      setIsLoading(false);
    }, 1500);
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
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] py-5 rounded-sm font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#ff8e80]/10 hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-4"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
          {isLoading ? "Verifying..." : "Verify Identity"}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-[#48474a]/10 w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="text-[#adaaad] text-xs uppercase tracking-widest font-medium" style={{ fontFamily: 'var(--font-headline)' }}>Resend Code</span>
          <span className="w-8 h-[1px] bg-[#48474a]"></span>
          <span className="text-[#fdc003] text-xs font-bold" style={{ fontFamily: 'var(--font-headline)' }}>01:59</span>
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
