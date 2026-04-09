"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Send recovery email to:", data);
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <>
      <div className="mb-12 text-center md:text-left">
        <h1 
          className="text-5xl font-extrabold tracking-tighter text-[#f9f5f8] mb-2 leading-none"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Recover Password
        </h1>
        <p className="font-sans text-[#adaaad] text-sm tracking-wide">
          Enter your email to receive recovery instructions.
        </p>
      </div>

      {isSent ? (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 ring-1 ring-[#ff8e80]/30 shadow-[0_0_30px_rgba(255,142,128,0.2)]">
            <span className="material-symbols-outlined text-4xl text-[#ff8e80]">mail</span>
          </div>
          <h3 className="text-2xl font-bold text-[#f9f5f8]" style={{ fontFamily: 'var(--font-headline)' }}>Email Sent!</h3>
          <p className="text-[#adaaad] font-sans">
            We've sent an email with password recovery instructions. Please check your inbox.
          </p>
          <button 
            type="button"
            className="mt-6 w-full py-5 rounded-sm ring-1 ring-[#48474a] text-[#adaaad] hover:text-[#f9f5f8] hover:ring-[#ff8e80]/50 transition-all font-headline tracking-widest uppercase text-sm"
            onClick={() => setIsSent(false)}
          >
            Try another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] mb-2 ml-1" style={{ fontFamily: 'var(--font-headline)' }}>
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="name@domain.com" 
                  className={`w-full bg-[#000000] border-none ring-1 ring-[#48474a]/30 focus:ring-[#ff8e80]/50 rounded-sm py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-zinc-700 transition-all font-sans focus:outline-none ${errors.email ? 'ring-[#ff6e84]' : ''}`}
                  {...register("email")}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none flex items-center justify-center">
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
              </div>
              {errors.email && <p className="text-xs text-[#ff6e84] mt-1 ml-1">{errors.email.message}</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] py-5 rounded-sm font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#ff8e80]/10 hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-4"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
            {isLoading ? "Sending..." : "Send Instructions"}
          </button>
        </form>
      )}

      <footer className="mt-12 text-center">
        <Link href="/login" className="inline-flex items-center text-[#adaaad] hover:text-[#f9f5f8] transition-colors font-sans text-sm pb-1 border-b border-transparent hover:border-[#ff8e80]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </footer>
    </>
  );
}
