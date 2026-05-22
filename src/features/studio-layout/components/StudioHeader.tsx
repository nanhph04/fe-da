"use client";

import Form from "next/form";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudioWalletService } from "@/features/studio-wallet";
import { studioQuickLinks } from "./navigation";

const getInitials = (value?: string | null) => {
  const cleaned = value?.trim();
  if (!cleaned) {
    return "U";
  }
  return cleaned.charAt(0).toUpperCase();
};

export function StudioHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const avatarLabel = user?.displayName || user?.email || "Creator";
  const canRenderAvatar = Boolean(user?.avatarUrl && user.avatarUrl !== failedAvatarUrl);
  const showContentSearch = pathname?.startsWith("/studio/content");
  const walletBalanceLabel = isWalletLoading
    ? "... AC"
    : walletBalance === null
      ? "-- AC"
      : `${walletBalance.toLocaleString("vi-VN")} AC`;

  useEffect(() => {
    let isMounted = true;

    const loadWalletBalance = async () => {
      setIsWalletLoading(true);

      try {
        const wallet = await StudioWalletService.getStudioWallet();

        if (isMounted) {
          setWalletBalance(wallet.balance);
        }
      } catch {
        if (isMounted) {
          setWalletBalance(null);
        }
      } finally {
        if (isMounted) {
          setIsWalletLoading(false);
        }
      }
    };

    void loadWalletBalance();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/70 px-8 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-8">
        <nav className="hidden gap-5 font-headline text-sm tracking-wide lg:flex">
          {studioQuickLinks.map((item) => {
            const isActive = pathname === item.path || (!!item.matchStartsWith && pathname?.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {showContentSearch ? (
          <Form action="/studio/content" className="relative hidden items-center sm:flex">
            <span className="material-symbols-outlined absolute left-3 text-sm text-muted-foreground">search</span>
            <Input
              className="h-9 w-64 rounded-sm border-border/40 bg-input pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue={searchParams.get("q") ?? ""}
              name="q"
              placeholder="Search content..."
              type="search"
            />
          </Form>
        ) : null}

        <div className="relative flex items-center gap-4">
          <Link
            href="/studio/wallet"
            className="flex h-9 items-center gap-2 rounded-sm border border-secondary/30 bg-secondary/10 px-3 font-headline text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:border-secondary/60 hover:bg-secondary/15 focus:outline-none focus:ring-2 focus:ring-ring/60"
            aria-label="Open studio wallet"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">account_balance_wallet</span>
            <span className="hidden lg:inline">{walletBalanceLabel}</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowAccountMenu(value => !value)}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-bold uppercase text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/60"
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
                className="block px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setShowAccountMenu(false)}
              >
                My Profile
              </Link>
              <Link
                href="/library"
                className="block px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
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
