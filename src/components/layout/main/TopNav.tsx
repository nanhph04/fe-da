"use client";

import Form from "next/form";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
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

function CategoryMenu({
  categories,
  isActive,
}: {
  categories: NavigationCategory[];
  isActive?: boolean;
}) {
  const t = useTranslations("Navigation");
  const visibleCategories = categories.slice(0, NAV_CATEGORY_LIMIT);
  const triggerClassName = `inline-flex items-center gap-1.5 font-headline font-bold tracking-tight transition-colors duration-300 ${
    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const role = getRole(user?.role, isAuthenticated, user?.isCreator);
  const visibleNavItems = topNavItems.filter(item => isNavItemVisible(item, role));
  const roleEntry = role === "guest" ? null : studioEntryByRole[role];
  const avatarLabel = user?.displayName || user?.email || "User";
  const avatarInitials = getInitials(avatarLabel);
  const canRenderAvatar = Boolean(user?.avatarUrl && user.avatarUrl !== failedAvatarUrl);

  return (
    <nav className="fixed top-0 z-50 flex h-20 w-full items-center gap-6 bg-background/40 bg-gradient-to-b from-muted to-transparent px-6 backdrop-blur-xl md:px-8">
      <Link href="/" className="shrink-0 text-2xl font-black tracking-tighter text-primary font-headline">
        Aura
      </Link>

      <div className="hidden flex-1 justify-center lg:flex">
        <GlobalSearchForm action={searchAction} />
      </div>

      {!isLoading && (
        <div className="flex shrink-0 items-center gap-8">
          <div className="hidden md:flex gap-6 items-center">
            {visibleNavItems.map(item => {
              if (item.label === "library") {
                return (
                  <CategoryMenu
                    key={item.label}
                    categories={categories}
                    isActive={pathname?.startsWith("/category")}
                  />
                );
              }

              const isActive = item.path === pathname;
              return (
                <Link
                  key={item.label}
                  href={item.path!}
                  className={`font-headline tracking-tight font-bold transition-colors duration-300 ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(item.label)}
                </Link>
              );
            })}

            {roleEntry ? (
              <Link
                href={roleEntry.path!}
                className={`font-headline tracking-tight font-bold transition-colors duration-300 ml-2 ${
                  pathname?.startsWith(roleEntry.path!) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(roleEntry.label)}
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-4 relative">
            <LanguageSwitcher />
            <ThemeToggle />

            {role === "guest" ? (
              <div className="flex gap-4">
                <Link href="/login" className="text-foreground font-bold hover:text-primary transition-colors">
                  {t("signIn")}
                </Link>
                <Link href="/register" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm font-bold transition-colors">
                  {t("signUp")}
                </Link>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  aria-label="Mở menu tài khoản"
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-bold uppercase text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  onClick={() => setShowDropdown(value => !value)}
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
                    <span aria-hidden="true">{avatarInitials}</span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute top-12 right-0 w-48 bg-popover border border-border rounded-sm shadow-2xl py-2 flex flex-col">
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-foreground font-bold truncate">{user?.displayName || user?.email}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{role}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
                      onClick={() => setShowDropdown(false)}
                    >
                      {t("myProfile")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors text-left font-bold"
                    >
                      {t("signOut")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
