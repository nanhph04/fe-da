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
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="font-headline text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Authorizing admin console...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground selection:bg-primary/30">
      <AdminSidebar />
      <AdminHeader />
      <main className="min-h-screen px-6 pb-12 pt-24 animate-in fade-in duration-500 md:ml-64 md:px-8">
        {children}
      </main>
    </div>
  );
}
