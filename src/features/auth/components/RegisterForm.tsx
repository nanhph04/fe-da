"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/services/authService";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await authService.register({
        email: data.email,
        password: data.password,
      });
      
      if (res.success) {
        // Lưu tạm email/password vào sessionStorage để gửi tiếp lúc Verify OTP
        sessionStorage.setItem("pendingVerify", JSON.stringify({
          email: data.email,
          password: data.password
        }));
        router.push("/verify-otp");
      } else {
        setServerError(res.mess || "Registration failed");
      }
    } catch (err: any) {
      setServerError(err.mess || err.message || "An error occurred during registration");
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
          Create Account
        </h1>
        <p className="font-sans text-[#adaaad] text-sm tracking-wide">
          Join the Velvet Gallery to start exploring.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Email */}
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

          {/* Password */}
          <div className="group">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] mb-2 ml-1" style={{ fontFamily: 'var(--font-headline)' }}>
              Password
            </label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`w-full bg-[#000000] border-none ring-1 ring-[#48474a]/30 focus:ring-[#ff8e80]/50 rounded-sm py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-zinc-700 transition-all font-sans focus:outline-none ${errors.password ? 'ring-[#ff6e84]' : ''}`}
                {...register("password")}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none flex items-center justify-center">
                <span className="material-symbols-outlined">lock</span>
              </div>
            </div>
            {errors.password && <p className="text-xs text-[#ff6e84] mt-1 ml-1">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="p-3 bg-[#ff6e84]/10 border border-[#ff6e84]/30 rounded-sm">
              <p className="text-xs text-[#ff6e84] text-center font-medium">{serverError}</p>
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] py-5 rounded-sm font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#ff8e80]/10 hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
          {isLoading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <footer className="mt-12 text-center">
        <p className="font-sans text-[#adaaad] text-sm">
          Already have an account? 
          <Link href="/login" className="text-[#f9f5f8] font-bold hover:text-[#ff8e80] transition-colors ml-1">
            Sign In
          </Link>
        </p>
      </footer>
    </>
  );
}
