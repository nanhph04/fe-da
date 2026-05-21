"use client";

import { Link } from "@/i18n/routing";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { publicAuthLinks } from "@/shared/navigation/branding";

const actionButtonClassName =
  "group relative hidden h-11 items-center gap-2 overflow-hidden rounded-sm border border-primary/45 bg-primary px-4 text-sm font-black text-primary-foreground shadow-[0_16px_34px_rgba(229,9,20,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_20px_42px_rgba(229,9,20,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 sm:inline-flex";

const getPrimaryAction = (user?: ReturnType<typeof useAuth>["user"]) => {
  if (user?.role === "admin") {
    return { href: "/admin", icon: "admin_panel_settings", label: "Trang quản lý" };
  }

  if (user?.isCreator || user?.role === "creator") {
    return { href: "/studio", icon: "dashboard", label: "Mở Studio" };
  }

  return { href: "/wallet", icon: "account_balance_wallet", label: "Ví Aura" };
};

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
    return <div className="hidden h-11 w-40 rounded-sm bg-muted sm:block" aria-hidden="true" />;
  }

  if (isAuthenticated) {
    const avatarLabel = user?.displayName || user?.email || "User";
    const canRenderAvatar = Boolean(user?.avatarUrl && user.avatarUrl !== failedAvatarUrl);
    const primaryAction = getPrimaryAction(user);

    return (
      <div className="flex items-center gap-3">
        <Link href={primaryAction.href} className={actionButtonClassName}>
          <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.24)_45%,transparent_68%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="material-symbols-outlined relative text-[18px]" aria-hidden="true">
            {primaryAction.icon}
          </span>
          <span className="relative">{primaryAction.label}</span>
        </Link>
        <Link
          href="/profile"
          aria-label="Mở hồ sơ cá nhân"
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-muted text-xs font-bold uppercase text-foreground transition-colors hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/60"
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
        className="px-4 py-2 text-sm font-bold text-foreground transition-colors duration-300 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {publicAuthLinks[0].label}
      </Link>
      <Link href={publicAuthLinks[1].path} className={actionButtonClassName}>
        <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.24)_45%,transparent_68%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="material-symbols-outlined relative text-[18px]" aria-hidden="true">
          person_add
        </span>
        <span className="relative">{publicAuthLinks[1].label}</span>
      </Link>
    </div>
  );
}
