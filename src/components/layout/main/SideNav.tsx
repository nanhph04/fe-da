"use client";

import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTranslations } from "next-intl";
import {
  isNavItemVisible,
  sideNavFooterItems,
  sideNavItems,
  studioEntryByRole,
  type MainNavRole,
  type NavItem,
} from "./navigation";

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

function NavEntry({ item, isActive }: { item: NavItem; isActive?: boolean }) {
  const t = useTranslations("Navigation");
  const className = `relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 ${
    item.disabled
      ? "cursor-not-allowed border border-dashed border-border/20 text-muted-foreground/30"
      : isActive
        ? "bg-accent text-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
  }`;

  const content = (
    <>
      {isActive && !item.disabled ? (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-secondary"
        />
      ) : null}
      <span className={`material-symbols-outlined ${isActive && !item.disabled ? "text-secondary" : ""}`}>
        {item.icon}
      </span>
      <span className="font-headline text-sm font-semibold">{t(item.label)}</span>
    </>
  );

  if (item.disabled || !item.path) {
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <Link href={item.path} className={className}>
      {content}
    </Link>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const role = getRole(user?.role, isAuthenticated, user?.isCreator);
  const roleEntry = role === "guest" ? null : studioEntryByRole[role];
  const t = useTranslations("Navigation");

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-sidebar flex-col pt-24 px-4 pb-8 hidden md:flex border-r border-sidebar-border/10">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <span className="material-symbols-outlined text-secondary fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          </div>
          <div>
            <div className="font-headline font-semibold text-sm text-foreground">
              {role === "guest" ? "Visitor Access" : "Member Access"}
            </div>
            <div className="text-xs text-secondary font-medium uppercase tracking-widest">
              {role === "guest" ? "Browse Mode" : role}
            </div>
          </div>
        </div>
        {roleEntry ? (
          <Link
            href={roleEntry.path!}
            className="w-full mt-4 bg-accent hover:bg-accent/80 text-foreground text-xs font-bold py-2 rounded-lg transition-all inline-flex items-center justify-center"
          >
            {t(roleEntry.label)}
          </Link>
        ) : (
          <div className="w-full mt-4 bg-accent text-muted-foreground text-xs font-bold py-2 rounded-lg border border-dashed border-border/20 text-center">
            {t("signIn")} for more
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {sideNavItems
          .filter(item => isNavItemVisible(item, role))
          .map(item => (
            <NavEntry
              key={item.label}
              item={item}
              isActive={!!item.path && (pathname === item.path || pathname?.startsWith(`${item.path}/`))}
            />
          ))}
      </nav>

      <div className="pt-8 border-t border-border/10 space-y-1">
        {sideNavFooterItems.map(item => (
          <NavEntry key={item.label} item={item} />
        ))}
      </div>
    </aside>
  );
}
