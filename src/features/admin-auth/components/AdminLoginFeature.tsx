"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/shared/api/client";

export function AdminLoginFeature() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { setAuthData } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data?.accessToken) {
        const profile = await setAuthData(res.data.accessToken);
        if (!profile) {
          setServerError("Failed to load your profile after login.");
          return;
        }
        if (profile.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/library");
        }
      } else {
        setServerError(res.mess || "Login failed");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Authentication failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 py-10 font-body text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.16)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,hsl(var(--primary)/0.18),transparent_36%),radial-gradient(circle_at_18%_82%,hsl(var(--secondary)/0.10),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-8">
        <Link href="/" className="font-headline text-lg font-black uppercase tracking-[-0.04em] text-primary transition-opacity hover:opacity-90">
          System Admin
        </Link>
        <Link href="/" className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
          Public portal
        </Link>
      </header>

      <main className="relative z-10 w-full max-w-md pt-20">
        <section className="relative overflow-hidden rounded-lg border border-border/40 bg-card p-8 shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary shadow-[0_0_28px_hsl(var(--primary)/0.18)]">
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
              Classified access only
            </p>
            <h1 className="font-headline text-3xl font-black uppercase tracking-[-0.04em] text-foreground">
              Velvet Gallery Core
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Authenticate with an administrator account to manage platform policy, users, payouts, and moderation queues.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="ml-1 block font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Administrator email
              </label>
              <div className="relative">
                <Fingerprint className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@console.com"
                  className="w-full rounded-sm border border-border/50 bg-input py-4 pl-11 pr-4 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="ml-1 block font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Access key
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-sm border border-border/50 bg-input py-4 pl-11 pr-4 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {serverError ? (
              <div className="rounded-sm border border-destructive/35 bg-destructive/10 p-3" role="alert" aria-live="polite">
                <p className="text-center font-mono text-xs text-destructive">{serverError}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-12 w-full items-center justify-center rounded-sm bg-primary px-4 py-4 font-headline text-xs font-black uppercase tracking-[0.22em] text-primary-foreground shadow-[0_14px_32px_hsl(var(--primary)/0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isLoading ? "Authenticating" : "Authenticate"}
            </button>
          </form>

          <div className="mt-8 border-t border-border/30 pt-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Unauthorized access is logged and reviewed.
            </p>
            <Link href="/" className="mt-4 block font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary">
              Return to public portal
            </Link>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          <span>
            Sys.stat: <span className="text-secondary">Online</span>
          </span>
          <span>Core: Admin Console</span>
        </div>
      </main>
    </div>
  );
}
