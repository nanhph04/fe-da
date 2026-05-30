import { useLocale, useTranslations } from "next-intl";
import type { MembershipReviewStatus } from "@/features/watch/services/mediaService";
import type { StudioTier } from "./StudioMembershipFeature";

interface MembershipManagementProps {
  tiers: StudioTier[];
  canCreateTier: boolean;
  isAdminClosed: boolean;
  reviewStatus: MembershipReviewStatus;
  onCreateTier: () => void;
  onEditTier: (tier: StudioTier) => void;
  onToggleTierStatus: (tier: StudioTier) => void;
  mutatingTierId: string | null;
}

const tierToneByLevel: Record<StudioTier["level"], string> = {
  1: "bg-muted-foreground",
  2: "bg-secondary",
  3: "bg-primary",
};

const tierAccentByLevel: Record<StudioTier["level"], string> = {
  1: "text-muted-foreground",
  2: "text-secondary",
  3: "text-primary",
};

export function MembershipManagement({
  tiers,
  canCreateTier,
  isAdminClosed,
  reviewStatus,
  onCreateTier,
  onEditTier,
  onToggleTierStatus,
  mutatingTierId,
}: MembershipManagementProps) {
  const t = useTranslations("Studio.memberships.management");
  const locale = useLocale();
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";
  const acceptingTierCount = tiers.filter((tier) => tier.isAcceptingNew).length;
  const monthlyFloor = tiers.reduce((acc, tier) => acc + tier.price, 0).toLocaleString(numberLocale);
  const tierPerks: Record<StudioTier["level"], string[]> = {
    1: [t("perks.level1.access"), t("perks.level1.badge"), t("perks.level1.comments")],
    2: [t("perks.level2.access"), t("perks.level2.earlyAccess"), t("perks.level2.livestreams")],
    3: [t("perks.level3.access"), t("perks.level3.behindScenes"), t("perks.level3.updates")],
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col gap-6 rounded-lg border border-border/30 bg-gradient-to-r from-card to-muted/40 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("summary.eyebrow")}</p>
          <h2 className="mb-2 font-headline text-2xl font-bold text-foreground">{t("summary.title")}</h2>
          <p className="font-body text-sm text-muted-foreground">
            <strong className="text-primary">{t("summary.acceptingCount", { count: acceptingTierCount })}</strong>{" "}
            {t("summary.across")}{" "}
            <strong className="text-secondary">{t("summary.monthlyFloor", { amount: monthlyFloor })}</strong>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-sm border border-border/40 bg-muted/40 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("summary.review", { status: t(`reviewStatus.${reviewStatus}`) })}
            </span>
            {isAdminClosed ? (
              <span className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-destructive">
                {t("summary.closedByAdmin")}
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateTier}
          disabled={!canCreateTier}
          className={`inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-headline text-sm font-bold shadow-lg transition-transform ${
            canCreateTier
              ? "bg-primary text-primary-foreground shadow-primary/20 hover:-translate-y-0.5"
              : "cursor-not-allowed bg-muted text-muted-foreground shadow-none"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t("actions.addTier")}
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const isMutating = mutatingTierId === tier.id;
          const tierAccent = tierAccentByLevel[tier.level];

          return (
            <article key={tier.id} className="group relative overflow-hidden rounded-lg border border-border/30 bg-card p-6 transition-colors hover:border-border">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 opacity-50 blur-2xl" />

              <div className="relative mb-6 flex items-start justify-between gap-4">
                <div>
                  <span className={`mb-2 block font-label text-[10px] font-bold uppercase tracking-widest ${tierAccent}`}>
                    {t("tier.level", { level: tier.level })}
                  </span>
                  <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-foreground">
                    <span className={`h-3 w-3 rounded-full ${tierToneByLevel[tier.level]}`} />
                    {tier.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onEditTier(tier)}
                  className="rounded p-1 text-muted-foreground opacity-100 transition-all hover:bg-muted hover:text-foreground md:opacity-0 md:group-hover:opacity-100"
                  aria-label={t("actions.editTierAria", { name: tier.name })}
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>

              <div className="relative space-y-5">
                <div>
                  <span className="mb-1 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("tier.monthlyPrice")}</span>
                  <span className="font-headline text-3xl font-black text-secondary">
                    {tier.price.toLocaleString(numberLocale)} <span className="text-sm text-muted-foreground">AC</span>
                  </span>
                </div>

                <div className="rounded-sm border border-border/30 bg-muted/30 p-4">
                  <span className="mb-2 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("tier.joinStatus")}</span>
                  <span className={`inline-flex items-center gap-2 font-body text-sm font-semibold ${tier.isAcceptingNew ? "text-emerald-400" : "text-muted-foreground"}`}>
                    <span className={`h-2 w-2 rounded-full ${tier.isAcceptingNew ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                    {tier.isAcceptingNew ? t("tier.accepting") : t("tier.paused")}
                  </span>
                </div>

                <ul className="space-y-2 border-t border-border/30 pt-4">
                  {tierPerks[tier.level].map((perk) => (
                    <li key={perk} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                      <span className={`material-symbols-outlined mt-0.5 text-sm ${tierAccent}`}>check_circle</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mt-6 border-t border-border/30 pt-5">
                <button
                  type="button"
                  onClick={() => onToggleTierStatus(tier)}
                  disabled={isMutating || isAdminClosed}
                  className="w-full rounded-sm border border-border/40 bg-muted px-4 py-3 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMutating ? t("actions.saving") : tier.isAcceptingNew ? t("actions.pauseJoins") : t("actions.resumeJoins")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
