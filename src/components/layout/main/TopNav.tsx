"use client";

import { useEffect, useState } from "react";
import Form from "next/form";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StudioAccessLink } from "@/features/studio-access";
import { WalletService } from "@/features/wallet/services/walletService";
import { getErrorMessage } from "@/shared/api/client";
import { ChevronDown, Search } from "lucide-react";
import { usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { PublicBrand } from "@/components/layout/public/PublicBrand";
import { AccountDropdown } from "@/components/layout/shared/AccountDropdown";
import type { Wallet } from "@/features/wallet/types/wallet.types";
import {
  isNavItemVisible,
  studioEntryByRole,
  topNavItems,
  type MainNavRole,
} from "./navigation";

type NavigationCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

type TopNavProps = {
  categories?: NavigationCategory[];
  searchAction?: string;
};

const NAV_CATEGORY_LIMIT = 12;

const formatCoins = (value: number) => value.toLocaleString("vi-VN");

const getRole = (role?: string, isAuthenticated?: boolean, isCreator?: boolean): MainNavRole => {
  if (!isAuthenticated || !role) {
    return "guest";
  }

  if (role === "admin") {
    return "admin";
  }

  if (isCreator || role === "creator") {
    return "creator";
  }

  if (role === "viewer") {
    return "viewer";
  }

  return "viewer";
};

function GlobalSearchForm({ action }: { action: string }) {
  const t = useTranslations("Navigation");

  return (
    <Form action={action} className="relative w-full max-w-md 2xl:max-w-xl">
      <label htmlFor="top-nav-search" className="sr-only">
        {t("search")}
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="top-nav-search"
        name="q"
        type="search"
        maxLength={200}
        placeholder={t("searchPlaceholder")}
        className="h-11 w-full rounded-sm border border-border/70 bg-input pl-11 pr-14 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-border focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <button
        type="submit"
        aria-label={t("search")}
        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </Form>
  );
}

type WalletBalanceState = {
  status: "idle" | "loading" | "success" | "error";
  data: Wallet | null;
  error: string | null;
};

function WalletBalanceLink({ isAuthenticated, userId }: { isAuthenticated: boolean; userId?: string }) {
  const t = useTranslations("Navigation");
  const walletUnavailableLabel = t("walletBalanceUnavailable");
  const [walletState, setWalletState] = useState<WalletBalanceState>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !userId) {
      return;
    }

    async function loadWallet() {
      setWalletState(current => ({ ...current, status: "loading", error: null }));

      try {
        const wallet = await WalletService.getMyWallet();
        if (isMounted) {
          setWalletState({ status: "success", data: wallet, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setWalletState({
            status: "error",
            data: null,
            error: getErrorMessage(error, walletUnavailableLabel),
          });
        }
      }
    }

    void loadWallet();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, userId, walletUnavailableLabel]);

  const balanceLabel = walletState.status === "loading"
    ? t("walletBalanceLoading")
    : walletState.data
      ? `${formatCoins(walletState.data.balance)} AC`
      : "-- AC";

  return (
    <Link
      href="/wallet"
      aria-label={t("walletBalance")}
      title={walletState.error ?? t("wallet")}
      className="hidden h-10 items-center gap-2 rounded-sm border border-secondary/30 bg-secondary/10 px-3 font-headline text-sm font-black text-secondary shadow-[inset_0_0_0_1px_rgba(245,158,11,0.08)] transition-all duration-300 hover:border-secondary/50 hover:bg-secondary/15 hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
        toll
      </span>
      <span className="tabular-nums">{balanceLabel}</span>
    </Link>
  );
}

function CategoryMenu({
  categories,
  isActive,
}: {
  categories: NavigationCategory[];
  isActive?: boolean;
}) {
  const t = useTranslations("Navigation");
  const visibleCategories = categories.slice(0, NAV_CATEGORY_LIMIT);
  const triggerClassName = `inline-flex items-center gap-1.5 rounded-[4px] px-4 py-2 font-headline text-sm font-bold tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    isActive
      ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
  }`;

  return (
    <div className="group relative">
      <button
        type="button"
        className={triggerClassName}
        aria-haspopup="menu"
      >
        {t("categories")}
        <ChevronDown
          className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
          aria-hidden="true"
        />
      </button>

      <div className="invisible absolute right-0 top-full w-80 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-background/60">
          <div className="border-b border-border px-4 py-3">
            <p className="font-headline text-sm font-black text-foreground">
              {t("browseCategories")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("categoryMenuHint")}
            </p>
          </div>

          <div className="max-h-[22rem] overflow-y-auto p-2">
            <Link
              href="/category/latest"
              className="flex min-h-11 items-center justify-between rounded-sm px-3 text-sm font-bold text-foreground transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("latestCategory")}
              <span className="text-xs uppercase tracking-[0.16em] text-secondary">Aura</span>
            </Link>

            {visibleCategories.length > 0 ? (
              visibleCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block rounded-sm px-3 py-2.5 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block text-sm font-bold text-foreground">{category.name}</span>
                  {category.description ? (
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                      {category.description}
                    </span>
                  ) : null}
                </Link>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                {t("categoryMenuEmpty")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopNav({ categories = [], searchAction = "/search" }: TopNavProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const role = getRole(user?.role, isAuthenticated, user?.isCreator);
  const visibleNavItems = topNavItems.filter(item => isNavItemVisible(item, role));
  const roleEntry = role === "guest" ? null : studioEntryByRole[role];
  const avatarLabel = user?.displayName || user?.email || "User";
  const roleLabel: Record<MainNavRole, string> = {
    guest: t("roles.guest"),
    user: t("roles.user"),
    viewer: t("roles.viewer"),
    creator: t("roles.creator"),
    admin: t("roles.admin"),
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-background/82 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-6 px-6 md:px-8">
        <PublicBrand href="/" />

        <div className="hidden min-w-0 flex-1 justify-center px-4 lg:flex">
          <GlobalSearchForm action={searchAction} />
        </div>

        {!isLoading && (
          <div className="flex shrink-0 items-center gap-4 md:gap-6">
            <div className="hidden items-center gap-1 rounded-sm border border-white/10 bg-card/55 p-1 shadow-inner shadow-black/30 md:flex">
              {visibleNavItems.map(item => {
                if (!item.path) {
                  return null;
                }

                const isActive = item.path === "/"
                  ? pathname === "/"
                  : pathname === item.path || pathname?.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-[4px] px-4 py-2 font-headline text-sm font-bold tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    {t(item.label)}
                  </Link>
                );
              })}

              <CategoryMenu
                categories={categories}
                isActive={pathname?.startsWith("/category")}
              />

              {roleEntry ? (() => {
                const roleEntryClassName = `rounded-[4px] px-4 py-2 font-headline text-sm font-bold tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  pathname?.startsWith(roleEntry.path!)
                    ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`;

                return roleEntry.path === "/studio" ? (
                  <StudioAccessLink
                    href={roleEntry.path}
                    aria-current={pathname?.startsWith(roleEntry.path) ? "page" : undefined}
                    className={roleEntryClassName}
                  >
                    {t(roleEntry.label)}
                  </StudioAccessLink>
                ) : (
                  <Link
                    href={roleEntry.path!}
                    aria-current={pathname?.startsWith(roleEntry.path!) ? "page" : undefined}
                    className={roleEntryClassName}
                  >
                    {t(roleEntry.label)}
                  </Link>
                );
              })() : null}
            </div>

            <div className="relative flex items-center gap-3 md:gap-4">
              {role !== "guest" ? (
                <WalletBalanceLink isAuthenticated={isAuthenticated} userId={user?.userId} />
              ) : null}
              <LanguageSwitcher />
              <ThemeToggle />

              {role === "guest" ? (
                <div className="hidden items-center gap-3 sm:flex">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-bold text-foreground transition-colors duration-300 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-sm border border-primary/45 bg-primary px-4 text-sm font-black text-primary-foreground shadow-[0_16px_34px_rgba(229,9,20,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_20px_42px_rgba(229,9,20,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0"
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.24)_45%,transparent_68%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="material-symbols-outlined relative text-[18px]" aria-hidden="true">
                      person_add
                    </span>
                    <span className="relative">{t("signUp")}</span>
                  </Link>
                </div>
              ) : (
                <AccountDropdown
                  avatarLabel={avatarLabel}
                  avatarUrl={user?.avatarUrl}
                  roleLabel={roleLabel[role]}
                  menuAriaLabel={t("accountMenuLabel")}
                  avatarAlt={t("userAvatarAlt")}
                  profileLabel={t("myProfile")}
                  signOutLabel={t("signOut")}
                  onLogout={logout}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
