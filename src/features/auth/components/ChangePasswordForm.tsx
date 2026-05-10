"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/shared/api/client";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => router.push("/library"), 3000);
      } else {
        setServerError(res.mess || "Failed to change password");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-black/35 px-6 py-4 backdrop-blur-xl lg:px-8">
        <span className="font-headline text-2xl font-black uppercase tracking-tight text-primary">Velvet Gallery</span>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden items-center gap-2 rounded-full border border-border/20 bg-card px-4 py-1.5 sm:flex">
            <span className="material-symbols-outlined text-sm text-secondary">payments</span>
            <span className="font-headline text-sm font-bold tracking-tight text-foreground">
              1,240 <span className="ml-0.5 text-[10px] uppercase text-secondary/80">Coins</span>
            </span>
          </div>
          <span className="material-symbols-outlined cursor-pointer text-muted-foreground transition-colors hover:text-white">search</span>
          <span className="material-symbols-outlined cursor-pointer text-muted-foreground transition-colors hover:text-white">notifications</span>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-border/30">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,#5b5b5b,#1a1a1a)]" />
          </div>
        </div>
      </nav>

      <aside className="fixed top-0 left-0 z-20 hidden h-screen w-64 flex-col bg-zinc-950/90 px-6 py-8 shadow-2xl backdrop-blur-sm md:flex">
        <div className="mt-16 mb-12 px-2">
          <div className="flex flex-col gap-1">
            <span className="font-headline text-xl font-bold text-primary">Alex Mercer</span>
            <span className="text-xs uppercase tracking-widest text-secondary opacity-80">Gold Member</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            ["home", "Home"],
            ["movie", "Movies"],
            ["tv", "Series"],
            ["bookmark", "My List"],
          ].map(([icon, label]) => (
            <span key={label} className="flex items-center gap-4 py-3 pl-5 font-headline text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white">
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </span>
          ))}
          <span className="flex items-center gap-4 border-l-4 border-secondary py-3 pl-4 font-headline font-bold text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
            <span>Settings</span>
          </span>
        </nav>

        <div className="mb-4 px-1">
          <button type="button" className="w-full rounded-lg border border-secondary/20 bg-secondary/10 py-3 font-headline text-sm font-bold text-secondary transition-colors hover:bg-secondary/20">
            Upgrade to 4K
          </button>
        </div>

        <div className="space-y-1">
          {[
            ["help", "Help"],
            ["logout", "Logout"],
          ].map(([icon, label]) => (
            <span key={label} className="flex items-center gap-4 py-3 pl-5 font-headline text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white">
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>
      </aside>

      <main className="min-h-screen px-6 pt-28 pb-20 md:ml-64 lg:px-12">
        <div className="mx-auto w-full max-w-6xl animate-in slide-in-from-bottom-4 duration-700">
          <div className="mb-12">
            <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-[-0.02em] text-foreground md:text-5xl">Change Password</h1>
            <p className="max-w-xl text-lg text-muted-foreground">Secure your account with a strong, unique password.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center space-y-6 rounded-lg bg-card p-10 text-center shadow-xl">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full ring-1 ring-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-foreground">Password Updated</h3>
                  <p className="text-muted-foreground">Your credentials have been securely updated. Returning to the gateway...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="group">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className={`w-full rounded-sm bg-black px-5 py-4 text-foreground placeholder:text-zinc-700 transition-all focus:outline-none focus:ring-1 focus:ring-primary ${errors.oldPassword ? "ring-1 ring-destructive" : "ring-1 ring-border/30"}`}
                        {...register("oldPassword")}
                      />
                      <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-zinc-600">visibility</span>
                    </div>
                    {errors.oldPassword ? <p className="mt-1 text-xs text-destructive">{errors.oldPassword.message}</p> : null}
                  </div>

                  <div className="h-px bg-gradient-to-r from-border/30 to-transparent" />

                  <div className="group">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                    <div className="relative mb-3">
                      <input
                        type="password"
                        placeholder="Create new password"
                        className={`w-full rounded-sm bg-black px-5 py-4 text-foreground placeholder:text-zinc-700 transition-all focus:outline-none focus:ring-1 focus:ring-primary ${errors.newPassword ? "ring-1 ring-destructive" : "ring-1 ring-border/30"}`}
                        {...register("newPassword")}
                      />
                      <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-zinc-600">visibility_off</span>
                    </div>
                    <div className="flex h-1 w-full gap-1.5 overflow-hidden rounded-full">
                      <div className="h-full w-1/4 rounded-full bg-primary" />
                      <div className="h-full w-1/4 rounded-full bg-primary" />
                      <div className="h-full w-1/4 rounded-full bg-zinc-800" />
                      <div className="h-full w-1/4 rounded-full bg-zinc-800" />
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">Strength: Medium</p>
                    {errors.newPassword ? <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p> : null}
                  </div>

                  <div className="group">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Repeat new password"
                        className={`w-full rounded-sm bg-black px-5 py-4 text-foreground placeholder:text-zinc-700 transition-all focus:outline-none focus:ring-1 focus:ring-primary ${errors.confirmPassword ? "ring-1 ring-destructive" : "ring-1 ring-border/30"}`}
                        {...register("confirmPassword")}
                      />
                      <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-zinc-600">lock_reset</span>
                    </div>
                    {errors.confirmPassword ? <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p> : null}
                  </div>

                  {serverError ? (
                    <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                      <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex flex-1 items-center justify-center rounded-sm bg-primary px-8 py-4 font-headline text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_rgba(229,9,20,0.2)] transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      {isLoading ? "Updating..." : "Update Password"}
                    </button>
                    <button type="button" className="flex-1 rounded-sm border border-border/20 bg-card px-8 py-4 font-headline font-bold text-foreground transition-all hover:bg-muted">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="space-y-8 rounded-lg border border-border/10 bg-card p-8 shadow-xl">
                <div>
                  <h3 className="mb-4 flex items-center gap-2 font-headline font-bold text-secondary">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    Security Requirements
                  </h3>
                  <ul className="space-y-4">
                    {[
                      [true, "Minimum Length", "At least 8 characters long."],
                      [true, "Character Variety", "At least one number (0-9)."],
                      [false, "Special Symbol", "At least one special symbol (!@#$%)."],
                    ].map(([done, title, copy]) => (
                      <li key={String(title)} className="flex items-start gap-3">
                        <span className={`material-symbols-outlined mt-0.5 text-lg ${done ? "text-primary" : "text-zinc-600"}`} style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                          {done ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{title}</p>
                          <p className="text-xs text-muted-foreground">{copy}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-secondary/15 bg-secondary/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Security Tip</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Use a password you don&apos;t reuse elsewhere and store it in a trusted password manager.
                  </p>
                </div>

                <Link href="/library" className="inline-flex items-center text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                  <span className="material-symbols-outlined mr-1 text-sm">keyboard_backspace</span>
                  Back to Library
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
