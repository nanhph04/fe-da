"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAuth } from "@/features/auth/context/AuthContext";

export function AdminLayoutFeature({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/library");
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.14),transparent_34%)]" />
        <section className="relative w-full max-w-sm rounded-lg border border-border/40 bg-card p-6 text-center shadow-[0_24px_64px_rgba(0,0,0,0.38)]">
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-primary" />
          <p className="font-headline text-sm font-bold uppercase tracking-[0.22em] text-foreground">
            Authorizing admin console
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Validating your session and access level before loading system controls.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background font-body text-foreground selection:bg-primary/30">
      <AdminSidebar />
      <AdminHeader />
      <main className="min-h-dvh px-4 pb-12 pt-24 animate-in fade-in duration-500 md:ml-64 md:px-8 lg:px-12 xl:px-16">
        {children}
      </main>
    </div>
  );
}
