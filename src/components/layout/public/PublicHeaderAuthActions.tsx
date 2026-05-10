"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { publicAuthLinks } from "@/shared/navigation/branding";

const getInitials = (value?: string | null) => {
  if (!value?.trim()) {
    return "U";
  }

  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export function PublicHeaderAuthActions() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  if (isLoading) {
    return <div className="hidden h-9 w-36 rounded-sm bg-muted sm:block" aria-hidden="true" />;
  }

  if (isAuthenticated) {
    const avatarLabel = user?.displayName || user?.email || "User";
    const canRenderAvatar = Boolean(user?.avatarUrl && user.avatarUrl !== failedAvatarUrl);

    return (
      <div className="hidden items-center gap-3 sm:flex">
        <Link
          href="/library"
          className="rounded-sm border border-border/30 bg-card px-4 py-2 text-sm font-bold text-foreground transition-colors duration-300 hover:border-primary/50 hover:text-primary"
        >
          Vào thư viện
        </Link>
        <Link
          href="/profile"
          aria-label="Mở hồ sơ cá nhân"
          className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/40 bg-muted text-xs font-bold uppercase text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          {user?.avatarUrl && canRenderAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="Ảnh đại diện người dùng"
              src={user.avatarUrl}
              className="h-full w-full object-cover"
              onError={() => setFailedAvatarUrl(user.avatarUrl || null)}
            />
          ) : (
            <span aria-hidden="true">{getInitials(avatarLabel)}</span>
          )}
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link
        href={publicAuthLinks[0].path}
        className="px-4 py-2 text-sm font-bold text-white transition-colors duration-300 hover:text-primary"
      >
        {publicAuthLinks[0].label}
      </Link>
      <Link
        href={publicAuthLinks[1].path}
        className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors duration-300 hover:bg-primary/80"
      >
        {publicAuthLinks[1].label}
      </Link>
    </div>
  );
}
