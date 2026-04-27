"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { StudioSidebar } from "./StudioSidebar";
import { StudioHeader } from "./StudioHeader";
import { useAuth } from "@/features/auth/context/AuthContext";

export function StudioLayoutFeature({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "creator") {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading || !isAuthenticated || user?.role !== "creator") {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-[#f9f5f8] flex items-center justify-center">
        <p className="font-headline text-sm uppercase tracking-[0.2em] text-zinc-500">Loading creator studio...</p>
      </div>
    );
  }

  return (
    <>
      <StudioSidebar />
      <main className="md:ml-64 min-h-screen bg-[#0e0e10] flex flex-col">
        <StudioHeader />
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </>
  );
}
