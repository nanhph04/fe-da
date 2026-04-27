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
      <div className="min-h-screen bg-[#000] text-[#f9f5f8] flex items-center justify-center">
        <p className="font-headline text-sm uppercase tracking-[0.2em] text-zinc-500">Authorizing admin console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000] text-[#f9f5f8] font-body selection:bg-red-600/30">
      <AdminSidebar />
      <AdminHeader />
      <main className="ml-64 pt-24 pb-12 px-8 min-h-screen animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
