import type { MembershipReviewStatus } from "@/features/watch/services/mediaService";
import type { ChannelDetailResponse } from "@/features/watch/services/mediaService";

interface EligibilityCheckerProps {
  eligibility?: ChannelDetailResponse["membershipEligibility"];
  isAdminClosed: boolean;
  reviewStatus: MembershipReviewStatus;
  rejectionReason: string | null;
  onCreateFirstTier: () => void;
}

function formatRequirementValue(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatReviewStatus(status: MembershipReviewStatus) {
  return status.replace(/_/g, " ");
}

export function EligibilityChecker({
  eligibility,
  isAdminClosed,
  reviewStatus,
  rejectionReason,
  onCreateFirstTier,
}: EligibilityCheckerProps) {
  const isEligible = Boolean(eligibility?.isEligible);
  const canCreateFirstTier = isEligible && !isAdminClosed;

  const requirements = [
    {
      label: "Ready Videos",
      current: eligibility?.readyVideoCount ?? 0,
      required: eligibility?.minReadyVideoCount ?? 10,
      met: (eligibility?.readyVideoCount ?? 0) >= (eligibility?.minReadyVideoCount ?? 10),
      detail: "Published videos in READY state",
    },
    {
      label: "Total Views",
      current: eligibility?.totalVideoViews ?? 0,
      required: eligibility?.minTotalVideoViews ?? 1000,
      met: (eligibility?.totalVideoViews ?? 0) >= (eligibility?.minTotalVideoViews ?? 1000),
      detail: "Channel-level viewer demand",
    },
  ];

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-8 md:p-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 opacity-60 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-3 font-label text-xs font-bold uppercase tracking-[0.3em] text-secondary">Exclusive Milestone</p>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {isEligible ? "Create your first tier" : "Unlock Memberships"}
          </h2>
          <p className="mt-4 font-body text-sm leading-6 text-muted-foreground">
            {isEligible
              ? "Your channel meets the current membership requirements. Create a real API-backed tier to open the membership builder."
              : "Meet the requirements below before creating membership tiers for recurring Aura Coin revenue."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {requirements.map((requirement) => {
            const progress = requirement.required > 0
              ? Math.min(100, Math.round((requirement.current / requirement.required) * 100))
              : 100;

            return (
              <article key={requirement.label} className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-6">
                <div className="absolute right-4 top-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl">{requirement.met ? "verified" : "pending"}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-foreground">{requirement.label}</h3>
                <p className="mt-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{requirement.detail}</p>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <span className="font-headline text-4xl font-black text-foreground">
                    {formatRequirementValue(requirement.current)}{" "}
                    <span className="text-lg font-medium text-muted-foreground">/ {formatRequirementValue(requirement.required)}</span>
                  </span>
                  <span className={`font-label text-xs font-bold uppercase tracking-widest ${requirement.met ? "text-emerald-400" : "text-primary"}`}>
                    {progress}%
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${requirement.met ? "bg-emerald-400" : "bg-primary"}`} style={{ width: `${progress}%` }} />
                </div>
              </article>
            );
          })}
        </div>

        <aside className="rounded-lg border border-border/30 bg-card p-6 text-center">
          <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${canCreateFirstTier ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {canCreateFirstTier ? "stars" : "lock"}
            </span>
          </div>
          <h3 className="font-headline text-xl font-bold text-foreground">
            {canCreateFirstTier ? "Tier creation ready" : "Tier creation locked"}
          </h3>
          <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
            {isAdminClosed
              ? "Admin closed membership for this channel. New members cannot join."
              : canCreateFirstTier
                ? "Create Level 1, 2, or 3 membership tiers and persist them to Media Service."
                : "Complete all eligibility milestones before launching paid tiers."}
          </p>
          <div className="mt-5 rounded-sm border border-border/30 bg-muted/30 px-3 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Review: {formatReviewStatus(reviewStatus)}
          </div>
          {rejectionReason ? <p className="mt-3 text-xs text-destructive">{rejectionReason}</p> : null}
          <button
            type="button"
            disabled={!canCreateFirstTier}
            onClick={onCreateFirstTier}
            className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm px-5 py-4 font-headline text-xs font-bold uppercase tracking-widest transition-opacity ${
              canCreateFirstTier
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-sm">{canCreateFirstTier ? "add" : "lock"}</span>
            Create First Tier
          </button>
        </aside>
      </div>
    </section>
  );
}
