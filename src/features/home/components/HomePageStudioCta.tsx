"use client";

import { Link } from "@/i18n/routing";
import { useAuth } from "@/features/auth/context/AuthContext";

function canAccessStudio(user: ReturnType<typeof useAuth>["user"]) {
  return !!user && (user.isCreator || user.role === "creator");
}

export function HomePageStudioCta() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="flex h-14 w-full items-center justify-center rounded-sm border border-border/15 bg-card/40 px-8 py-4 text-sm font-semibold tracking-wide text-muted-foreground sm:h-auto sm:w-auto"
        aria-live="polite"
      >
        Đang kiểm tra quyền...
      </div>
    );
  }

  const href = !isAuthenticated
    ? `/login?redirect=${encodeURIComponent("/onboarding")}`
    : canAccessStudio(user)
      ? "/studio"
      : "/onboarding";

  return (
    <Link
      href={href}
      className="flex w-full items-center justify-center space-x-2 rounded-sm border border-border/15 bg-card/40 px-8 py-4 font-semibold tracking-wide text-foreground backdrop-blur-xl transition-all duration-300 hover:bg-muted sm:w-auto"
    >
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        play_arrow
      </span>
      <span>Khám phá Aura Studio</span>
    </Link>
  );
}
