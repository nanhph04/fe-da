"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  isNavItemVisible,
  studioEntryByRole,
  topNavItems,
  type MainNavRole,
} from "./navigation";

const getRole = (role?: string, isAuthenticated?: boolean): MainNavRole => {
  if (!isAuthenticated || !role) {
    return "guest";
  }

  if (role === "admin" || role === "creator" || role === "viewer") {
    return role;
  }

  return "viewer";
};

export function TopNav() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  const role = getRole(user?.role, isAuthenticated);
  const visibleNavItems = topNavItems.filter(item => isNavItemVisible(item, role));
  const roleEntry = role === "guest" ? null : studioEntryByRole[role];

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-zinc-950/40 backdrop-blur-xl bg-gradient-to-b from-zinc-900 to-transparent">
      <Link href="/" className="text-2xl font-black text-red-600 tracking-tighter font-headline">
        Velvet Gallery
      </Link>

      {!isLoading && (
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 items-center">
            {visibleNavItems.map(item => {
              const isActive = item.path === pathname;
              return (
                <Link
                  key={item.label}
                  href={item.path!}
                  className={`font-headline tracking-tight font-bold transition-colors duration-300 ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {roleEntry ? (
              <Link
                href={roleEntry.path!}
                className={`font-headline tracking-tight font-bold transition-colors duration-300 ml-2 ${
                  pathname?.startsWith(roleEntry.path!) ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {roleEntry.label}
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-4 relative">
            {role === "guest" ? (
              <div className="flex gap-4">
                <Link href="/login" className="text-white font-bold hover:text-red-500 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-sm font-bold transition-colors">
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-zinc-400 hover:text-white cursor-pointer transition-colors">notifications</span>
                <div
                  className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-zinc-700 cursor-pointer relative"
                  onClick={() => setShowDropdown(value => !value)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="User profile"
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email || "User"}&background=19191c&color=f9f5f8`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {showDropdown && (
                  <div className="absolute top-12 right-0 w-48 bg-[#111] border border-zinc-800 rounded-sm shadow-2xl py-2 flex flex-col">
                    <div className="px-4 py-2 border-b border-zinc-800 mb-2">
                      <p className="text-white font-bold truncate">{user?.displayName || user?.email}</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">{role}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="px-4 py-2 text-sm text-zinc-300 hover:bg-[#19191c] hover:text-white transition-colors text-left"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 text-sm text-red-500 hover:bg-[#19191c] transition-colors text-left font-bold"
                    >
                      Sign Out
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
