import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { cn } from "@/shared/utils/cn";

const legalLinks = [
  { href: "/privacy-policy", labelKey: "privacyPolicy" },
  { href: "/terms-of-service", labelKey: "termsOfService" },
  { href: "/cookie-preferences", labelKey: "cookiePreferences" },
] as const;

const COPYRIGHT_YEAR = 2026;

type PublicSiteFooterProps = {
  className?: string;
};

export async function PublicSiteFooter({ className }: PublicSiteFooterProps) {
  const t = await getTranslations("SiteFooter");

  return (
    <footer
      className={cn(
        "relative overflow-hidden border-t border-border/40 bg-background text-foreground",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(229,9,20,0.16),transparent_34%),radial-gradient(circle_at_86%_16%,rgba(245,158,11,0.1),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 md:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-start">
          <div className="max-w-xl">
            <Link
              href="/"
              aria-label={t("brandAriaLabel")}
              className="group inline-flex w-fit items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary/70 focus:ring-offset-2 focus:ring-offset-background"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/30 bg-primary text-primary-foreground shadow-[0_0_32px_rgba(229,9,20,0.22)] transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                  play_arrow
                </span>
              </span>
              <span className="font-headline text-lg font-extrabold uppercase tracking-[-0.02em] text-foreground">
                Velvet Gallery
              </span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">
              {t("description")}
            </p>
          </div>

          <nav aria-label={t("legalAriaLabel")} className="lg:justify-self-end">
            <p className="mb-4 font-headline text-xs font-bold uppercase tracking-[0.22em] text-secondary">
              {t("legalTitle")}
            </p>
            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex w-fit text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/25 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year: COPYRIGHT_YEAR })}</p>
          <p className="font-headline uppercase tracking-[0.18em] text-muted-foreground/80">
            {t("tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
