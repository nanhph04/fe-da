"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const legalLinks = [
  { href: "/privacy-policy", labelKey: "privacyPolicy" },
  { href: "/terms-of-service", labelKey: "termsOfService" },
  { href: "/cookie-preferences", labelKey: "cookiePreferences" },
] as const;

export function PublicLegalFooter() {
  const t = useTranslations("Auth.footer");

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-border/10 bg-background/82 px-6 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/64 sm:py-5">
      <nav aria-label={t("ariaLabel")} className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8">
        {legalLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background sm:text-xs"
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
