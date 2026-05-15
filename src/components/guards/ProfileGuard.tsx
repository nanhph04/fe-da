"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (isAuthenticated && user && !user.displayName) {
      // Prevent redirect loop by checking if already on onboarding page
      if (!pathname.startsWith("/onboarding")) {
        router.replace("/onboarding/profile");
      }
    }
  }, [isAuthenticated, user, isLoading, router, pathname]);

  return <>{children}</>;
}