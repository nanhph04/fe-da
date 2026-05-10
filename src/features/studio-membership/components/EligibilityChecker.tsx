import { ChannelDetailResponse } from "@/features/watch/services/mediaService";

export function EligibilityChecker({
  onUnlock,
  eligibility,
}: {
  onUnlock: () => void;
  eligibility?: ChannelDetailResponse["membershipEligibility"];
}) {
  const isEligible = eligibility?.isEligible || false;

  const requirements = [
    {
      label: "Ready Videos",
      current: eligibility?.readyVideoCount || 0,
      required: eligibility?.minReadyVideoCount || 1,
      met: (eligibility?.readyVideoCount || 0) >= (eligibility?.minReadyVideoCount || 1),
    },
    {
      label: "Total Views",
      current: eligibility?.totalVideoViews || 0,
      required: eligibility?.minTotalVideoViews || 1,
      met: (eligibility?.totalVideoViews || 0) >= (eligibility?.minTotalVideoViews || 1),
    },
  ];

  return (
    <section className="mx-auto mt-12 flex max-w-4xl flex-col items-center rounded-lg border border-border/30 bg-card p-10 text-center shadow-2xl md:p-12">
      <div
        className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl ${
          isEligible ? "bg-primary/10 text-primary shadow-primary/20" : "bg-muted text-muted-foreground"
        }`}
      >
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          stars
        </span>
      </div>

      <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">Creator Economy</p>
      <h2 className="mb-4 font-headline text-3xl font-extrabold text-foreground">
        {isEligible ? "You are eligible" : "Unlock channel memberships"}
      </h2>
      <p className="mb-8 max-w-xl font-body text-sm leading-6 text-muted-foreground">
        {isEligible
          ? "Your channel meets the requirements to launch membership tiers and start earning recurring Aura Coin revenue."
          : "Build a loyal community with exclusive perks, badges, and member-only releases. Meet the requirements below to unlock."}
      </p>

      <div className="mb-8 w-full space-y-4">
        {requirements.map((requirement) => (
          <div key={requirement.label} className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/40 p-4 text-left">
            <span className="font-label text-sm font-bold uppercase tracking-widest text-foreground">{requirement.label}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">
                {requirement.current.toLocaleString()} / {requirement.required.toLocaleString() === "0" ? "None" : requirement.required.toLocaleString()}
              </span>
              <span className={`material-symbols-outlined ${requirement.met ? "text-emerald-400" : "text-muted-foreground"}`}>
                {requirement.met ? "check_circle" : "radio_button_unchecked"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!isEligible}
        onClick={onUnlock}
        className={`rounded-sm px-8 py-3 font-headline text-sm font-bold uppercase tracking-widest transition-all ${
          isEligible
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
            : "cursor-not-allowed bg-muted text-muted-foreground"
        }`}
      >
        Enable Memberships
      </button>
    </section>
  );
}
