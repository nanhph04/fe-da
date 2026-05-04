import type { ReactNode } from "react";
import Link from "next/link";
import { PublicBrand } from "./PublicBrand";
import type { PublicNavLink } from "@/shared/navigation/branding";
import { publicAuthLinks, publicMarketingLinks } from "@/shared/navigation/branding";

interface PublicHeaderProps {
  currentPath?: string;
  subtitle?: string;
  emphasizeBrand?: boolean;
  links?: PublicNavLink[];
  showAuthActions?: boolean;
  children?: ReactNode;
}

export function PublicHeader({
  currentPath,
  subtitle,
  emphasizeBrand = false,
  links = publicMarketingLinks,
  showAuthActions = true,
  children,
}: PublicHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0e0e10]/78 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-6 px-6 md:px-8">
        <PublicBrand href="/" subtitle={subtitle} emphasize={emphasizeBrand} />

        <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`font-headline text-sm font-bold tracking-tight transition-colors duration-300 ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {children}

          {showAuthActions ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href={publicAuthLinks[0].path}
                className="px-4 py-2 text-sm font-bold text-white transition-colors duration-300 hover:text-[#ff8e80]"
              >
                {publicAuthLinks[0].label}
              </Link>
              <Link
                href={publicAuthLinks[1].path}
                className="rounded-sm bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors duration-300 hover:bg-red-500"
              >
                {publicAuthLinks[1].label}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
