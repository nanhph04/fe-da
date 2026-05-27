"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";
import { Bell, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { adminFooterItems, adminSidebarItems } from "./navigation";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

function getInitials(displayName?: string, email?: string) {
  const source = (displayName || email || "System Admin").trim();
  return source.charAt(0).toUpperCase() || "S";
}

export function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const adminName = user?.displayName || "SYS_ADMIN";
  const adminEmail = user?.email || "admin@velvet.local";
  const mobileNavItems = [...adminSidebarItems, ...adminFooterItems];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl md:left-64 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close admin navigation" : "Open admin navigation"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/40 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>

          <Link href="/admin" className="min-w-0 font-headline text-base font-extrabold tracking-[-0.03em] text-foreground md:hidden">
            System Admin
          </Link>

          <form action="/admin/content" className="group relative hidden md:block" role="search">
            <label htmlFor="admin-global-search" className="sr-only">
              Search admin console
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" aria-hidden="true" />
            <input
              id="admin-global-search"
              name="q"
              className="w-[min(34rem,42vw)] rounded-sm border border-border/40 bg-input py-2.5 pl-10 pr-4 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Search UID, email, video hash..."
              type="search"
            />
          </form>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/admin/content/review" className="hidden font-headline text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary lg:block">
            Review Queue
          </Link>

          <LanguageSwitcher />

          <div className="flex items-center gap-3 border-l border-border/30 pl-3 md:pl-6">
            <div className="hidden max-w-44 text-right sm:block">
              <p className="truncate font-headline text-xs font-bold text-foreground">{adminName}</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{adminEmail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary/30 bg-muted font-headline text-xs font-bold text-primary shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
              {getInitials(user?.displayName, user?.email)}
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-border/30 bg-background/95 px-4 py-4 shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden">
          <nav className="grid max-h-[70dvh] grid-cols-1 gap-1 overflow-y-auto" aria-label="Admin mobile navigation">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || Boolean(item.matchStartsWith && pathname?.startsWith(item.path));

              if (item.disabled) {
                return (
                  <div key={item.path} aria-disabled="true" className="flex min-h-11 items-center gap-3 rounded-sm border border-dashed border-border/30 px-4 py-2.5 text-sm text-muted-foreground/40">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex min-h-11 items-center gap-3 rounded-sm border-r-2 px-4 py-2.5 text-sm transition-colors ${isActive
                    ? "border-primary bg-muted/55 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </>
  );
}
