"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const { setAuthData } = useAuth();

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await authService.login(data);
      if (res.success && res.data?.accessToken) {
        setAuthData(res.data.accessToken);
        router.push("/library");
      } else {
        setServerError(res.mess || "Login failed");
      }
    } catch (err: any) {
      setServerError(err.mess || err.message || "An error occurred during login. Please try again.");
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
          Welcome Back
        </h1>
        <p className="font-sans text-[#adaaad] text-sm tracking-wide">
          Return to the Velvet Gallery experience.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="group">
            <label 
              htmlFor="email"
              className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] mb-2 ml-1"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Email Address
            </label>
            <div className="relative">
              <input 
                id="email"
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

          <div className="group">
            <div className="flex justify-between items-center mb-2">
              <label 
                htmlFor="password"
                className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] ml-1"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs font-medium text-[#fdc003] hover:text-[#f7ba00] transition-colors uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input 
                id="password"
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
          className="flex items-center justify-center w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] py-5 rounded-sm font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#ff8e80]/10 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
          {isLoading ? "Signing In..." : "Sign In"}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#48474a]/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0e0e10] px-4 text-zinc-600 tracking-widest" style={{ fontFamily: 'var(--font-sans)' }}>Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-2 bg-[#19191c] border-none py-4 rounded-sm hover:bg-[#2c2c2f] transition-colors group">
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#f9f5f8]">google</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-[#f9f5f8]">Google</span>
          </button>
          <button type="button" className="flex items-center justify-center gap-2 bg-[#19191c] border-none py-4 rounded-sm hover:bg-[#2c2c2f] transition-colors group">
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#f9f5f8]" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-[#f9f5f8]">Apple</span>
          </button>
        </div>
      </form>

      <footer className="mt-12 text-center">
        <p className="font-sans text-[#adaaad] text-sm">
          New to Aura Cinematic? 
          <Link href="/register" className="text-[#f9f5f8] font-bold hover:text-[#ff8e80] transition-colors ml-1">
            Create an account
          </Link>
        </p>
      </footer>
    </>
  );
}
