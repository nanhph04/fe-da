"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Registered:", data);
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
          Create Account
        </h1>
        <p className="font-sans text-[#adaaad] text-sm tracking-wide">
          Join the Velvet Gallery to start exploring.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Full Name */}
          <div className="group">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#adaaad] mb-2 ml-1" style={{ fontFamily: 'var(--font-headline)' }}>
              Full Name
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="John Doe" 
                className={`w-full bg-[#000000] border-none ring-1 ring-[#48474a]/30 focus:ring-[#ff8e80]/50 rounded-sm py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-zinc-700 transition-all font-sans focus:outline-none ${errors.fullName ? 'ring-[#ff6e84]' : ''}`}
                {...register("fullName")}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none flex items-center justify-center">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
            {errors.fullName && <p className="text-xs text-[#ff6e84] mt-1 ml-1">{errors.fullName.message}</p>}
          </div>

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

          {/* Confirm Password */}
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
                <span className="material-symbols-outlined">lock</span>
              </div>
            </div>
            {errors.confirmPassword && <p className="text-xs text-[#ff6e84] mt-1 ml-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] py-5 rounded-sm font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-[#ff8e80]/10 hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-4"
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
