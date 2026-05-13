"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
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
  const className = `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
    item.disabled
      ? "text-zinc-700 border border-dashed border-[#48474a]/20 cursor-not-allowed"
      : isActive
        ? "text-white bg-zinc-900/80"
        : "text-zinc-500 hover:bg-zinc-800/50 hover:text-white"
  }`;

  const content = (
    <>
      <span className="material-symbols-outlined">{item.icon}</span>
      <span className="font-headline font-semibold text-sm">{item.label}</span>
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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-zinc-950 flex-col pt-24 px-4 pb-8 hidden md:flex border-r border-[#48474a]/10">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-[#fdc003]/10 flex items-center justify-center border border-[#fdc003]/20">
            <span className="material-symbols-outlined text-[#fdc003] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          </div>
          <div>
            <div className="font-headline font-semibold text-sm text-[#f9f5f8]">
              {role === "guest" ? "Visitor Access" : "Member Access"}
            </div>
            <div className="text-xs text-[#ecb200] font-medium uppercase tracking-widest">
              {role === "guest" ? "Browse Mode" : role}
            </div>
          </div>
        </div>
        {roleEntry ? (
          <Link
            href={roleEntry.path!}
            className="w-full mt-4 bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-lg transition-all inline-flex items-center justify-center"
          >
            {roleEntry.label}
          </Link>
        ) : (
          <div className="w-full mt-4 bg-zinc-900/80 text-zinc-700 text-xs font-bold py-2 rounded-lg border border-dashed border-[#48474a]/20 text-center">
            Sign in for more
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

      <div className="pt-8 border-t border-[#48474a]/10 space-y-1">
        {sideNavFooterItems.map(item => (
          <NavEntry key={item.label} item={item} />
        ))}
      </div>
    </aside>
  );
}
