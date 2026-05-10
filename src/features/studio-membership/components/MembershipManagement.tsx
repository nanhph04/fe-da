import { StudioTier } from "./StudioMembershipFeature";

interface MembershipManagementProps {
  tiers: StudioTier[];
  onEditTier: (tier: StudioTier | null) => void;
}

export function MembershipManagement({ tiers, onEditTier }: MembershipManagementProps) {
  const totalRevenue = tiers.reduce((acc, tier) => acc + parseInt(tier.revenue.replace(/,/g, "")), 0).toLocaleString();
  const totalSubscribers = tiers.reduce((acc, tier) => acc + tier.subscribers, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col gap-6 rounded-lg border border-border/30 bg-gradient-to-r from-card to-muted/40 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Membership Active</p>
          <h2 className="mb-2 font-headline text-2xl font-bold text-foreground">Your tier system is live</h2>
          <p className="font-body text-sm text-muted-foreground">
            <strong className="text-primary">{totalSubscribers} active members</strong> generate{" "}
            <strong className="text-secondary">{totalRevenue} AC</strong> monthly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onEditTier(null)}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-headline text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Tier
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.id} className="group relative overflow-hidden rounded-lg border border-border/30 bg-card p-6 transition-colors hover:border-border">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 opacity-50 blur-2xl" />

            <div className="mb-6 flex items-start justify-between gap-4">
              <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-foreground">
                <span className={`h-3 w-3 rounded-full ${tier.badgeColor || "bg-muted-foreground"}`} />
                {tier.name}
              </h3>
              <button
                type="button"
                onClick={() => onEditTier(tier)}
                className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
                aria-label={`Edit ${tier.name}`}
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="mb-1 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Price</span>
                <span className="font-headline text-3xl font-black text-secondary">
                  {tier.price} <span className="text-sm text-muted-foreground">AC</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-4">
                <div>
                  <span className="mb-1 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Members</span>
                  <span className="font-headline text-lg font-bold text-foreground">{tier.subscribers || 0}</span>
                </div>
                <div>
                  <span className="mb-1 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Est. Revenue</span>
                  <span className="font-headline text-lg font-bold text-foreground">{tier.revenue || "0"}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
