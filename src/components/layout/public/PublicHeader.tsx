import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { PublicBrand } from "./PublicBrand";
import type { PublicNavLink } from "@/shared/navigation/branding";
import { publicMarketingLinks } from "@/shared/navigation/branding";
import { PublicHeaderAuthActions } from "./PublicHeaderAuthActions";

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-background/82 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-6 px-6 md:px-8">
        <PublicBrand href="/" subtitle={subtitle} emphasize={emphasizeBrand} />

        <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
          <nav className="hidden items-center gap-1 rounded-sm border border-white/10 bg-card/55 p-1 shadow-inner shadow-black/30 md:flex">
            {links.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-[4px] px-4 py-2 font-headline text-sm font-bold tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {children}

          {showAuthActions ? <PublicHeaderAuthActions /> : null}
        </div>
      </div>
    </header>
  );
}
