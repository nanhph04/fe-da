import { Link } from "@/i18n/routing";
import { Compass, Crown, LockKeyhole } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { UserMembershipResponse } from "@/features/watch/services/mediaService";
import { formatProfileDate, getAvatarFallbackUrl } from "../utils/profile-formatters";

interface ActiveMembershipsProps {
  memberships: UserMembershipResponse[];
  error?: string;
}

export function ActiveMemberships({ memberships, error }: ActiveMembershipsProps) {
  const t = useTranslations("ProfilePage.memberships");
  const locale = useLocale();

  return (
    <section className="space-y-6 lg:sticky lg:top-28">
      <h2 className="flex items-center gap-3 font-headline text-xl font-bold text-foreground">
        <span className="h-6 w-1 rounded-full bg-secondary" aria-hidden="true" />
        {t("title")}
      </h2>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-card p-6 text-sm text-destructive">{error}</div>
      ) : memberships.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/30 bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-muted-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <p className="font-headline text-lg font-bold text-foreground">{t("empty.title")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("empty.description")}</p>
          <Link
            href="/library"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("empty.cta")}
          </Link>
        </div>
      ) : (
        memberships.map(membership => {
          const blocked = membership.isMembershipClosedByAdmin || !membership.isActive;

          return (
            <article
              key={membership.membershipId}
              className={`group relative overflow-hidden rounded-lg border-l-2 bg-card p-6 shadow-xl transition-colors hover:bg-muted/20 ${blocked ? "border-destructive" : "border-primary"}`}
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" aria-hidden="true" />
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="h-full w-full object-cover"
                      src={membership.channelAvatarUrl || getAvatarFallbackUrl(membership.channelName)}
                      alt={t("avatarAlt", { name: membership.channelName })}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-headline text-lg font-black text-foreground">{membership.channelName}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      {blocked ? <LockKeyhole className="h-3.5 w-3.5 text-destructive" /> : <Crown className="h-3.5 w-3.5 text-secondary" />}
                      <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                        {t("level", { level: membership.tierLevel })} {membership.isActive ? t("status.active") : t("status.inactive")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">{t("expires", { date: formatProfileDate(membership.expiryDate, locale) })}</span>
                  <span className="font-bold text-secondary">{t("pricePerMonth", { amount: membership.priceCoin.toLocaleString(locale === "vi" ? "vi-VN" : "en-US") })}</span>
                </div>
                {membership.membershipBlockedReason && (
                  <p className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    {membership.membershipBlockedReason}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/creator/${membership.channelId}/join`}
                    className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-background px-3 text-[11px] font-black uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
                  >
                    {t("actions.manage")}
                  </Link>
                  <Link
                    href={membership.canUpgrade && !blocked ? `/creator/${membership.channelId}/join` : "#"}
                    aria-disabled={!membership.canUpgrade || blocked}
                    className="inline-flex h-9 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 px-3 text-[11px] font-black uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  >
                    {t("actions.upgrade")}
                  </Link>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
