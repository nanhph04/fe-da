import Link from "next/link";
import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

interface TopNavHomeProps {
  children: ReactNode;
}

export function TopNavHome({ children }: TopNavHomeProps) {
  return (
    <>
      <PublicHeader currentPath="/" subtitle="Public Marketing">
        <div className="hidden max-w-md flex-1 xl:flex">
          <Link
            href="/search"
            className="group relative flex h-11 w-full items-center rounded-sm border border-white/10 bg-[#1a1a1a] px-4 pl-10 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
          >
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-hover:text-white/60">
              search
            </span>
            Search the library
          </Link>
        </div>
      </PublicHeader>
      {children}
    </>
  );
}
