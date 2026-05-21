"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";

interface AccountDropdownProps {
  avatarLabel: string;
  avatarUrl?: string | null;
  roleLabel: string;
  profileHref?: string;
  menuAriaLabel: string;
  avatarAlt: string;
  profileLabel: string;
  signOutLabel: string;
  onLogout: () => void | Promise<void>;
  avatarTextClassName?: string;
}

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

export function AccountDropdown({
  avatarLabel,
  avatarUrl,
  roleLabel,
  profileHref = "/profile",
  menuAriaLabel,
  avatarAlt,
  profileLabel,
  signOutLabel,
  onLogout,
  avatarTextClassName = "text-sm",
}: AccountDropdownProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const canRenderAvatar = Boolean(avatarUrl && avatarUrl !== failedAvatarUrl);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={menuAriaLabel}
        aria-expanded={showDropdown}
        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/20 bg-muted font-bold uppercase text-foreground transition-colors hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/60 ${avatarTextClassName}`}
        onClick={() => setShowDropdown(value => !value)}
      >
        {avatarUrl && canRenderAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={avatarAlt}
            src={avatarUrl}
            className="h-full w-full object-cover"
            onError={() => setFailedAvatarUrl(avatarUrl || null)}
          />
        ) : (
          <span aria-hidden="true">{getInitials(avatarLabel)}</span>
        )}
      </button>

      {showDropdown ? (
        <div className="absolute right-0 top-12 flex w-56 flex-col overflow-hidden rounded-sm border border-white/10 bg-card py-2 shadow-2xl shadow-background/60">
          <div className="mb-2 border-b border-border px-4 py-3">
            <p className="truncate font-bold text-foreground">{avatarLabel}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{roleLabel}</p>
          </div>
          <Link
            href={profileHref}
            className="px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setShowDropdown(false)}
          >
            {profileLabel}
          </Link>
          <button
            type="button"
            onClick={() => {
              void onLogout();
              setShowDropdown(false);
            }}
            className="px-4 py-2 text-left text-sm font-bold text-destructive transition-colors hover:bg-accent"
          >
            {signOutLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
