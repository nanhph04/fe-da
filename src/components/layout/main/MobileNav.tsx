"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { isNavItemVisible, mobileNavItems, type MainNavRole, type NavItem } from "./navigation";

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

function MobileNavEntry({ item, isActive }: { item: NavItem; isActive?: boolean }) {
  const className = `flex flex-col items-center gap-1 ${
    item.disabled ? "text-zinc-700 cursor-not-allowed" : isActive ? "text-red-500" : "text-zinc-500"
  }`;

  const content = (
    <>
      <span className="material-symbols-outlined">{item.icon}</span>
      <span className="text-[10px] font-bold">{item.label}</span>
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

export function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const role = getRole(user?.role, isAuthenticated, user?.isCreator);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-zinc-950/80 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around items-center z-50">
      {mobileNavItems
        .filter(item => isNavItemVisible(item, role))
        .map(item => (
          <MobileNavEntry
            key={item.label}
            item={item}
            isActive={!!item.path && (pathname === item.path || pathname?.startsWith(`${item.path}/`))}
          />
        ))}
    </nav>
  );
}
