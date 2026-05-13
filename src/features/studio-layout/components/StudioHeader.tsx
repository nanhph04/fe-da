"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/AuthContext";
import { studioQuickLinks } from "./navigation";

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

export function StudioHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const avatarLabel = user?.displayName || user?.email || "Creator";
  const canRenderAvatar = Boolean(user?.avatarUrl && user.avatarUrl !== failedAvatarUrl);

  const showTemporaryMessage = (value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#262528] bg-[#0e0e10]/80 px-8 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-8">
        <nav className="hidden gap-5 font-headline text-sm tracking-wide lg:flex">
          {studioQuickLinks.map((item) => {
            const isActive = pathname === item.path || (!!item.matchStartsWith && pathname?.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <Form action="/studio/content" className="relative hidden items-center sm:flex">
          <span className="material-symbols-outlined absolute left-3 text-sm text-zinc-500">search</span>
          <Input
            className="h-9 w-64 rounded-sm border-none bg-[#131315] pl-9 pr-4 text-sm text-[#f9f5f8] focus-visible:ring-1 focus-visible:ring-[#ff8e80]"
            defaultValue={pathname?.startsWith("/studio/content") ? searchParams.get("q") ?? "" : ""}
            name="q"
            placeholder="Search content..."
            type="search"
          />
        </Form>

        <div className="relative flex items-center gap-4">
          {message ? (
            <div className="absolute right-12 top-11 w-72 rounded-sm border border-secondary/30 bg-card px-3 py-2 text-xs font-medium text-secondary shadow-xl">
              {message}
            </div>
          ) : null}

          <button
            type="button"
            className="text-zinc-400 transition-colors hover:text-white"
            aria-label="Notifications"
            onClick={() => showTemporaryMessage("Notifications API chưa sẵn sàng.")}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAccountMenu(value => !value)}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#262528] bg-muted text-xs font-bold uppercase text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
            aria-label="Open creator account menu"
          >
            {user?.avatarUrl && canRenderAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="h-full w-full object-cover"
                alt="Creator profile"
                src={user.avatarUrl}
                onError={() => setFailedAvatarUrl(user.avatarUrl || null)}
              />
            ) : (
              <span aria-hidden="true">{getInitials(avatarLabel)}</span>
            )}
          </button>

          {showAccountMenu ? (
            <div className="absolute right-0 top-11 w-56 rounded-sm border border-border/30 bg-card py-2 shadow-2xl shadow-black/40">
              <div className="mb-2 border-b border-border/30 px-4 py-2">
                <p className="truncate font-headline text-sm font-bold text-foreground">{avatarLabel}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Creator Studio</p>
              </div>
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-muted hover:text-white"
                onClick={() => setShowAccountMenu(false)}
              >
                My Profile
              </Link>
              <Link
                href="/library"
                className="block px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-muted hover:text-white"
                onClick={() => setShowAccountMenu(false)}
              >
                Back to Library
              </Link>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  void logout();
                }}
                className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 transition-colors hover:bg-muted"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
