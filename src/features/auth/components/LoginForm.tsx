"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { type UserProfile, useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/shared/api/client";
import { PublicBrand } from "@/components/layout/public/PublicBrand";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  redirectTo?: string;
};

const isSafeRedirectPath = (path?: string) => {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  return !path.startsWith("/login") && !path.startsWith("/register");
};

const getRedirectAfterLogin = (profile: UserProfile | null, redirectTo?: string) => {
  if (!profile) {
    return null;
  }

  const safeRedirectPath = isSafeRedirectPath(redirectTo) ? redirectTo : null;

  if (safeRedirectPath) {
    if (safeRedirectPath.startsWith("/admin")) {
      return profile.role === "admin" ? safeRedirectPath : "/library";
    }

    return safeRedirectPath;
  }

  if (profile.role === "admin") {
    return "/admin";
  }

  return !profile.displayName ? "/onboarding/profile" : "/library";
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
        const nextPath = getRedirectAfterLogin(profile, redirectTo);
        if (!nextPath) {
          setServerError("Failed to load your profile after login.");
          return;
        }
        router.push(nextPath);
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
        style={{ backgroundImage: "url(/images/login-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(229,9,20,0.18),transparent_68%)]" />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-8">
        <PublicBrand href="/" />
        <span className="font-headline text-sm font-bold tracking-tight text-zinc-400 transition-colors hover:text-white">
          Trợ giúp
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
                  Email
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full rounded-sm bg-black py-4 pr-12 pl-4 text-foreground placeholder:text-zinc-700 ring-1 transition-all focus:outline-none focus:ring-primary/60 ${errors.password ? "ring-destructive" : "ring-border/30"}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-zinc-500 transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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

            {/* <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 tracking-widest text-zinc-600">Or continue with</span>
              </div>
            </div> */}

            {/* <div className="grid grid-cols-2 gap-4">
              <button type="button" className="group flex items-center justify-center gap-2 rounded-sm bg-card py-4 transition-colors hover:bg-muted">
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-foreground">google</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-foreground">Google</span>
              </button>
              <button type="button" className="group flex items-center justify-center gap-2 rounded-sm bg-card py-4 transition-colors hover:bg-muted">
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-foreground" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-foreground">Apple</span>
              </button>
            </div> */}
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
