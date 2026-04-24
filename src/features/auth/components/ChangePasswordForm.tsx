"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/features/auth/services/authService";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => router.push("/library"), 3000);
      } else {
        setServerError(res.mess || "Failed to change password");
      }
    } catch (err: any) {
      setServerError(err.mess || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-12 text-center md:text-left">
        <h1 
          className="text-5xl font-extrabold tracking-tighter text-[#f9f5f8] mb-2 leading-none"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Change Password
        </h1>
        <p className="font-sans text-[#adaaad] text-sm tracking-wide">
          Secure your account with a newly forged key.
        </p>
      </div>

      {isSuccess ? (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 ring-1 ring-[#22c55e]/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <span className="material-symbols-outlined text-4xl text-[#22c55e]">check_circle</span>
          </div>
          <h3 className="text-2xl font-bold text-[#f9f5f8]" style={{ fontFamily: 'var(--font-headline)' }}>Password Updated!</h3>
          <p className="text-[#adaaad] font-sans">
            Your credentials have been securely updated. Returning to the gateway...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            
            {/* Old Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] mb-2 ml-1" style={{ fontFamily: 'var(--font-headline)' }}>
                Current Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className={`w-full bg-[#000000] border-none ring-1 ring-[#48474a]/30 focus:ring-[#ff8e80]/50 rounded-sm py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-zinc-700 transition-all font-sans focus:outline-none ${errors.oldPassword ? 'ring-[#ff6e84]' : ''}`}
                  {...register("oldPassword")}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none flex items-center justify-center">
                  <span className="material-symbols-outlined">key</span>
                </div>
              </div>
              {errors.oldPassword && <p className="text-xs text-[#ff6e84] mt-1 ml-1">{errors.oldPassword.message}</p>}
            </div>

            {/* New Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] mb-2 ml-1" style={{ fontFamily: 'var(--font-headline)' }}>
                New Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className={`w-full bg-[#000000] border-none ring-1 ring-[#48474a]/30 focus:ring-[#ff8e80]/50 rounded-sm py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-zinc-700 transition-all font-sans focus:outline-none ${errors.newPassword ? 'ring-[#ff6e84]' : ''}`}
                  {...register("newPassword")}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none flex items-center justify-center">
                  <span className="material-symbols-outlined">lock</span>
                </div>
              </div>
              {errors.newPassword && <p className="text-xs text-[#ff6e84] mt-1 ml-1">{errors.newPassword.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] mb-2 ml-1" style={{ fontFamily: 'var(--font-headline)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className={`w-full bg-[#000000] border-none ring-1 ring-[#48474a]/30 focus:ring-[#ff8e80]/50 rounded-sm py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-zinc-700 transition-all font-sans focus:outline-none ${errors.confirmPassword ? 'ring-[#ff6e84]' : ''}`}
                  {...register("confirmPassword")}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none flex items-center justify-center">
                  <span className="material-symbols-outlined">verified</span>
                </div>
              </div>
              {errors.confirmPassword && <p className="text-xs text-[#ff6e84] mt-1 ml-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {serverError && (
            <div className="p-3 bg-[#ff6e84]/10 border border-[#ff6e84]/30 rounded-sm w-full mt-4">
              <p className="text-xs text-[#ff6e84] text-center font-medium">{serverError}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] py-5 rounded-sm font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#ff8e80]/10 hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <footer className="mt-12 text-center">
        <Link href="/library" className="inline-flex items-center text-zinc-500 hover:text-[#f9f5f8] transition-colors font-headline text-[10px] uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm mr-1">keyboard_backspace</span>
          Back to Library
        </Link>
      </footer>
    </>
  );
}
