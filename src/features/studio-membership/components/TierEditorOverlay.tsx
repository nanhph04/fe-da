import { useRef, useState } from "react";
import { StudioTier } from "./StudioMembershipFeature";

interface TierEditorOverlayProps {
  tier: StudioTier | null;
  onClose: () => void;
  onSave: (tier: StudioTier) => void;
}

export function TierEditorOverlay({ tier, onClose, onSave }: TierEditorOverlayProps) {
  const [name, setName] = useState(tier?.name || "");
  const [price, setPrice] = useState(tier?.price || 500);
  const [perks, setPerks] = useState<string[]>(tier?.perks || ["Loyalty badges", "Custom emojis"]);
  const newPerkRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({
      ...tier,
      name,
      price,
      perks,
      id: tier?.id || Date.now(),
      subscribers: tier?.subscribers || 0,
      revenue: tier?.revenue || "0",
      badgeColor: tier?.badgeColor || "bg-muted-foreground",
    });
  };

  const handleAddPerk = () => {
    const newPerk = newPerkRef.current?.value?.trim();
    if (!newPerk) {
      return;
    }

    setPerks((currentPerks) => [...currentPerks, newPerk]);
    if (newPerkRef.current) {
      newPerkRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg border border-border/40 bg-card shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden border-r border-border/30 bg-muted/30 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="mb-4 inline-flex rounded-sm bg-primary/15 px-3 py-1 font-label text-xs font-bold uppercase tracking-widest text-primary">
              Tier Editor
            </span>
            <h3 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
              Shape the member room
            </h3>
            <p className="mt-4 font-body text-sm leading-6 text-muted-foreground">
              Tune pricing, perks, and access language before publishing changes to the creator membership surface.
            </p>
          </div>

          <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">Monthly Price</p>
            <p className="mt-2 font-headline text-4xl font-black text-secondary">{price.toLocaleString()} AC</p>
            <p className="mt-2 font-body text-xs text-muted-foreground">Changes are local until saved.</p>
          </div>
        </aside>

        <section className="flex max-h-[90vh] flex-col">
          <header className="flex items-center justify-between border-b border-border/30 bg-muted/40 px-6 py-4">
            <div>
              <h3 className="font-headline text-xl font-bold text-foreground">
                {tier?.id ? "Edit Tier" : "Create New Tier"}
              </h3>
              <p className="font-body text-xs text-muted-foreground">Configure tier name, AC price, and included perks.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close tier editor"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="grid gap-6 overflow-y-auto p-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Tier Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Silver Member"
                  className="w-full rounded-md border border-border/40 bg-input px-4 py-3 font-headline font-bold text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Monthly Price (AC)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                    monetization_on
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    className="w-full rounded-md border border-border/40 bg-input py-3 pl-12 pr-4 font-headline font-bold text-foreground outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
                <p className="font-body text-[10px] text-muted-foreground">Pricing should stay between 100 AC and 10,000 AC.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Included Perks</label>
              <ul className="space-y-2">
                {perks.map((perk, index) => (
                  <li key={`${perk}-${index}`} className="flex items-center justify-between rounded-md border border-border/30 bg-muted/40 p-3">
                    <span className="font-body text-sm text-foreground">{perk}</span>
                    <button
                      type="button"
                      onClick={() => setPerks((currentPerks) => currentPerks.filter((_, itemIndex) => itemIndex !== index))}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      aria-label={`Remove ${perk}`}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  ref={newPerkRef}
                  type="text"
                  placeholder="Add a new perk"
                  className="min-w-0 flex-1 border-0 border-b border-border/50 bg-transparent py-2 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddPerk}
                  className="rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold text-primary transition-colors hover:border-primary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <footer className="flex gap-4 border-t border-border/30 bg-muted/40 p-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-headline text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="flex-[2] rounded-sm bg-primary py-3 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
              Save Tier
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
