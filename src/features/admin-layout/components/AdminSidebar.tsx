"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Rocket } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { adminFooterItems, adminSidebarItems, type AdminNavItem } from "./navigation";

function isActivePath(pathname: string | null, item: AdminNavItem) {
  if (!pathname) {
    return false;
  }

  if (item.path === "/admin") {
    return pathname === "/admin";
  }

  return pathname === item.path || Boolean(item.matchStartsWith && pathname.startsWith(item.path));
}

function getNavItemClassName(isActive: boolean, disabled?: boolean) {
  if (disabled) {
    return "cursor-not-allowed border border-dashed border-border/30 text-muted-foreground/40";
  }

  if (isActive) {
    return "border-r-2 border-primary bg-muted/55 text-primary shadow-[inset_0_0_12px_hsl(var(--primary)/0.10)]";
  }

  return "border-r-2 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground";
}

function AdminNavLink({ item }: { item: AdminNavItem }) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, item);
  const Icon = item.icon;
  const className = `flex min-h-11 items-center gap-3 rounded-sm px-4 py-2.5 transition-all duration-200 ${getNavItemClassName(
    isActive,
    item.disabled,
  )}`;
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </>
  );

  if (item.disabled) {
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <Link href={item.path} className={className} aria-current={isActive ? "page" : undefined}>
      {content}
    </Link>
  );
}

export function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-border/30 bg-sidebar py-7 font-body text-sm font-medium shadow-[20px_0_40px_rgba(0,0,0,0.34)] md:flex">
      <div className="mb-9 flex flex-col items-start gap-1.5 px-6">
        <span className="font-headline text-lg font-extrabold tracking-[-0.03em] text-foreground">System Admin</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Admin Console</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Admin primary navigation">
        {adminSidebarItems.map((item) => (
          <AdminNavLink key={item.path} item={item} />
        ))}
      </nav>

      <footer className="mt-auto space-y-1 border-t border-border/20 px-3 pt-5">
        <nav className="space-y-1" aria-label="Admin secondary navigation">
          {adminFooterItems.map((item) => (
            <AdminNavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="px-1 pt-4">
          <button
            type="button"
            disabled
            aria-label="Deploy updates is not available in this build"
            className="flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm bg-primary/70 px-4 py-2 font-headline text-sm font-semibold text-primary-foreground/80 shadow-[0_10px_24px_hsl(var(--primary)/0.12)]"
          >
            <Rocket className="h-4 w-4" aria-hidden="true" />
            Deploy Updates
          </button>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 w-full items-center gap-3 rounded-sm border-r-2 border-transparent px-4 py-2.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </footer>
    </aside>
  );
}
