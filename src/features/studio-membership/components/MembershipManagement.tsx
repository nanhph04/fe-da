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

function formatReviewStatus(status: MembershipReviewStatus) {
  return status.replace(/_/g, " ");
}

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
  const acceptingTierCount = tiers.filter((tier) => tier.isAcceptingNew).length;
  const monthlyFloor = tiers.reduce((acc, tier) => acc + tier.price, 0).toLocaleString("vi-VN");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col gap-6 rounded-lg border border-border/30 bg-gradient-to-r from-card to-muted/40 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Membership Active</p>
          <h2 className="mb-2 font-headline text-2xl font-bold text-foreground">Your tier system is connected</h2>
          <p className="font-body text-sm text-muted-foreground">
            <strong className="text-primary">{acceptingTierCount} tiers accepting new members</strong> across{" "}
            <strong className="text-secondary">{monthlyFloor} AC</strong> total monthly entry price.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-sm border border-border/40 bg-muted/40 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Review: {formatReviewStatus(reviewStatus)}
            </span>
            {isAdminClosed ? (
              <span className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-destructive">
                Closed by admin
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
          Add Tier
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
                    Level {tier.level}
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
                  aria-label={`Edit ${tier.name}`}
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>

              <div className="relative space-y-5">
                <div>
                  <span className="mb-1 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Price</span>
                  <span className="font-headline text-3xl font-black text-secondary">
                    {tier.price.toLocaleString("vi-VN")} <span className="text-sm text-muted-foreground">AC</span>
                  </span>
                </div>

                <div className="rounded-sm border border-border/30 bg-muted/30 p-4">
                  <span className="mb-2 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Join Status</span>
                  <span className={`inline-flex items-center gap-2 font-body text-sm font-semibold ${tier.isAcceptingNew ? "text-emerald-400" : "text-muted-foreground"}`}>
                    <span className={`h-2 w-2 rounded-full ${tier.isAcceptingNew ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                    {tier.isAcceptingNew ? "Accepting new members" : "Paused for new members"}
                  </span>
                </div>

                <ul className="space-y-2 border-t border-border/30 pt-4">
                  {tier.perks.map((perk) => (
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
                  {isMutating ? "Saving..." : tier.isAcceptingNew ? "Pause Joins" : "Resume Joins"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
