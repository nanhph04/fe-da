import type { MembershipReviewStatus } from "@/features/watch/services/mediaService";
import type { ChannelDetailResponse } from "@/features/watch/services/mediaService";

interface EligibilityCheckerProps {
  eligibility?: ChannelDetailResponse["membershipEligibility"];
  isAdminClosed: boolean;
  reviewStatus: MembershipReviewStatus;
  rejectionReason: string | null;
  canRequestReview: boolean;
  canCreateFirstTier: boolean;
  isRequestingReview: boolean;
  onRequestReview: () => void;
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
  canRequestReview,
  canCreateFirstTier,
  isRequestingReview,
  onRequestReview,
  onCreateFirstTier,
}: EligibilityCheckerProps) {
  const isEligible = Boolean(eligibility?.isEligible);
  const isPendingReview = reviewStatus === "pending";

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

  const isActionDisabled = canCreateFirstTier ? false : !canRequestReview || isRequestingReview;
  const actionIcon = canCreateFirstTier
    ? "add"
    : isRequestingReview
      ? "hourglass_top"
      : canRequestReview
        ? "outgoing_mail"
        : isPendingReview
          ? "hourglass_top"
          : "lock";
  const actionLabel = canCreateFirstTier
    ? "Create First Tier"
    : isAdminClosed
      ? "Membership Closed"
      : isRequestingReview
        ? "Sending..."
        : isPendingReview
          ? "Waiting for Admin"
          : "Request Opening";
  const heroTitle = canCreateFirstTier
    ? "Create your first tier"
    : isAdminClosed
      ? "Membership closed"
      : isEligible
        ? "Request membership review"
        : "Unlock Memberships";
  const heroDescription = isAdminClosed
    ? "Admin closed membership for this channel. New members cannot join."
    : canCreateFirstTier
      ? "Admin approved membership for this channel. You can now create API-backed tiers."
      : isPendingReview
        ? "Your request is in the admin queue. Tier creation unlocks after approval."
        : canRequestReview
          ? "All requirements are met. Send the opening request so admin can approve tier creation."
          : "Meet the requirements below before requesting admin review for recurring Aura Coin revenue.";

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-6 md:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-48 rounded-full bg-secondary/10 opacity-40 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-3 font-label text-xs font-bold uppercase tracking-[0.3em] text-secondary">Exclusive Milestone</p>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {heroTitle}
            </h2>
            <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
              {heroDescription}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:items-end ">
            <button
              type="button"
              disabled={isActionDisabled}
              onClick={canCreateFirstTier ? onCreateFirstTier : onRequestReview}
              className={`inline-flex w-full items-center justify-center gap-3 rounded-sm px-8 py-5 font-headline text-sm font-extrabold tracking-wide shadow-lg transition duration-300 hover:opacity-90 active:scale-[0.98] md:w-auto md:min-w-72 ${isActionDisabled
                ? "cursor-not-allowed bg-muted text-muted-foreground shadow-none hover:opacity-100"
                : "bg-primary text-primary-foreground shadow-primary/20  cursor-pointer"
                }`}
            >
              <span className="material-symbols-outlined text-xl">{actionIcon}</span>
              {actionLabel}
            </button>
            <span className="inline-flex w-fit items-center rounded-sm border border-border/30 bg-muted/20 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Review: {formatReviewStatus(reviewStatus)}
            </span>
            {rejectionReason ? <p className="w-full text-xs text-destructive md:w-72">{rejectionReason}</p> : null}
          </div>
        </div>
      </div>

      <section className="space-y-4" aria-label="Membership requirement details">
        <div>
          <h3 className="font-headline text-xl font-bold text-foreground">{isEligible ? "Requirements met" : "Milestone details"}</h3>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {isEligible ? "Ready video count and total views have reached the opening thresholds." : "Track the two thresholds required before requesting membership review."}
          </p>
        </div>

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
                  <span className={`font-label text-xs font-bold uppercase tracking-widest ${requirement.met ? "text-secondary" : "text-primary"}`}>
                    {progress}%
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${requirement.met ? "bg-secondary" : "bg-primary"}`} style={{ width: `${progress}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
