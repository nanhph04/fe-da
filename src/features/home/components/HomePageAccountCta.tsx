"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";

export function HomePageAccountCta() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="h-16 w-40 rounded-sm bg-muted"
        aria-hidden="true"
      />
    );
  }

  const isAdmin = user?.role === "admin";
  const href = isAdmin ? "/admin" : isAuthenticated ? "/library" : "/register";
  const label = isAdmin ? "Vào trang quản lý" : isAuthenticated ? "Vào thư viện" : "Đăng ký ngay";

  return (
    <Link
      href={href}
      className="rounded-sm bg-gradient-to-br from-primary to-primary/75 px-10 py-5 text-lg font-bold tracking-wide text-primary-foreground shadow-[0_20px_50px_rgba(229,9,20,0.3)] transition-all duration-300 hover:brightness-110"
    >
      {label}
    </Link>
  );
}
