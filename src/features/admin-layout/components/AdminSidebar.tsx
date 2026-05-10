"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { adminFooterItems, adminSidebarItems } from "./navigation";

function isActivePath(pathname: string | null, path: string, matchStartsWith?: boolean) {
  if (!pathname) {
    return false;
  }

  if (path === "/admin") {
    return pathname === "/admin";
  }

  return pathname === path || Boolean(matchStartsWith && pathname.startsWith(path));
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-border/30 bg-sidebar py-6 font-body text-sm font-medium shadow-[4px_0_24px_rgba(0,0,0,0.5)] md:flex">
      <div className="mb-8 flex flex-col items-start gap-2 px-6">
        <span className="font-display text-lg font-bold tracking-tight text-foreground">System Admin</span>
        <span className="font-body text-xs text-muted-foreground">Global Configuration</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {adminSidebarItems.map((item) => {
          const isActive = isActivePath(pathname, item.path, item.matchStartsWith);
          const className = `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
            item.disabled
              ? "cursor-not-allowed border border-dashed border-border/30 text-muted-foreground/40"
              : isActive
                ? "scale-[0.99] bg-muted/60 text-primary shadow-[inset_0_0_12px_rgba(229,9,20,0.1)]"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`;
          const content = (
            <>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          );

          if (item.disabled) {
            return (
              <div key={item.path} aria-disabled="true" className={className}>
                {content}
              </div>
            );
          }

          return (
            <Link key={item.path} href={item.path} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>

      <footer className="mt-auto space-y-1 border-t border-border/20 px-3 pt-6">
        {adminFooterItems.map((item) => {
          const isActive = isActivePath(pathname, item.path, item.matchStartsWith);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? "scale-[0.99] bg-muted/60 text-primary shadow-[inset_0_0_12px_rgba(229,9,20,0.1)]"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="px-4 pt-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 font-headline text-sm font-semibold text-primary-foreground shadow-[0_4px_12px_rgba(229,9,20,0.2)] transition-opacity hover:opacity-90">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              rocket_launch
            </span>
            Deploy Updates
          </button>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-primary"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            logout
          </span>
          <span>Sign Out</span>
        </button>
      </footer>
    </aside>
  );
}
