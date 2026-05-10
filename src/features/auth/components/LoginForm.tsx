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
import { getErrorMessage } from "@/shared/api/client";
import { PublicBrand } from "@/components/layout/public/PublicBrand";

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
        const profile = await setAuthData(res.data.accessToken);
        const redirectTo = profile && !profile.displayName 
          ? "/onboarding/profile" 
          : "/library";
        router.push(redirectTo);
      } else {
        setServerError(res.mess || "Login failed");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "An error occurred during login. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 grayscale brightness-50"
        style={{ backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCqTDRHMKMPvk9xqQrk4DEF-2An9GDUaqJQRpkU-YwV71u9nAE47K5gPr58Luqvwgmn_DXqqBJL3UQx4vAlshv_DWgOnREa-PHM6Xy-py5QWKCneIxjI5p5shxD4vbmoTEatuukvovlRmpeGV6uBlRg0s_7xuLE57eUy8oATWgUXEDyA3ZlbWOF0cELXdrUg4XxnPVamIswb_2KACqvj1GXOTYblobKswobv6nYvkVeVzy4zSQ1as-oAfLpH__6ZKHo1Jlesh-bomMZ)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(229,9,20,0.18),transparent_68%)]" />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-8">
        <PublicBrand href="/landing" />
        <span className="font-headline text-sm font-bold tracking-tight text-zinc-400 transition-colors hover:text-white">
          Help
        </span>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-28 pb-28">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center md:text-left">
            <h1 className="mb-2 font-headline text-5xl font-extrabold leading-none tracking-[-0.02em] text-foreground">
              Welcome Back
            </h1>
            <p className="text-sm tracking-wide text-muted-foreground">
              Return to the Velvet Gallery experience.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="email" className="mb-2 ml-1 block font-headline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="name@domain.com"
                    className={`w-full rounded-sm bg-black py-4 pr-12 pl-4 text-foreground placeholder:text-zinc-700 ring-1 transition-all focus:outline-none focus:ring-primary/60 ${errors.email ? "ring-destructive" : "ring-border/30"}`}
                    {...register("email")}
                  />
                  <div className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center text-zinc-600">
                    <span className="material-symbols-outlined">alternate_email</span>
                  </div>
                </div>
                {errors.email ? <p className="mt-1 ml-1 text-xs text-destructive">{errors.email.message}</p> : null}
              </div>

              <div className="group">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="ml-1 block font-headline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium uppercase tracking-widest text-secondary transition-colors hover:text-secondary/80">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full rounded-sm bg-black py-4 pr-12 pl-4 text-foreground placeholder:text-zinc-700 ring-1 transition-all focus:outline-none focus:ring-primary/60 ${errors.password ? "ring-destructive" : "ring-border/30"}`}
                    {...register("password")}
                  />
                  <div className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center text-zinc-600">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                </div>
                {errors.password ? <p className="mt-1 ml-1 text-xs text-destructive">{errors.password.message}</p> : null}
              </div>

              {serverError ? (
                <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary to-primary/75 py-5 font-headline text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/10 transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 tracking-widest text-zinc-600">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="group flex items-center justify-center gap-2 rounded-sm bg-card py-4 transition-colors hover:bg-muted">
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-foreground">google</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-foreground">Google</span>
              </button>
              <button type="button" className="group flex items-center justify-center gap-2 rounded-sm bg-card py-4 transition-colors hover:bg-muted">
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-foreground" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-foreground">Apple</span>
              </button>
            </div>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              New to Velvet Gallery?
              <Link href="/register" className="ml-1 font-bold text-foreground transition-colors hover:text-primary">
                Create an account
              </Link>
            </p>
          </footer>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center gap-8 bg-transparent py-8 opacity-50">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-600 transition-colors hover:text-zinc-300">Privacy Policy</span>
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-600 transition-colors hover:text-zinc-300">Terms of Service</span>
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-600 transition-colors hover:text-zinc-300">Cookie Preferences</span>
      </div>
    </div>
  );
}
