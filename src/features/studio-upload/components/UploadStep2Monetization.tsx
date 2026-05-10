"use client";
import { UploadFormData } from "./StudioUploadFeature";

interface UploadStep2MonetizationProps {
  formData: UploadFormData;
  updateFormData: (data: Partial<UploadFormData>) => void;
  onPrev: () => void;
  onNext: () => void;
}

const pricePresets = [0, 100, 500, 1000];

export function UploadStep2Monetization({ formData, updateFormData, onPrev, onNext }: UploadStep2MonetizationProps) {
  return (
    <div className="mx-auto w-full max-w-6xl p-8 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="mb-12">
        <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">Monetization</p>
        <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-foreground">Pricing Strategy</h1>
        <p className="max-w-2xl font-body text-sm text-muted-foreground">
          Configure how viewers access your content. Aura Coins power all unlocks and creator settlements.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section className="space-y-6 rounded-lg border border-border/30 bg-card p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-headline text-lg font-bold text-foreground">Video Listing Price</h2>
                <p className="font-body text-sm text-muted-foreground">Set the access fee in Aura Coins. Use 0 AC for free releases.</p>
              </div>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">Premium Content</span>
            </div>

            <div className="group relative">
              <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-6 flex items-center text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                monetization_on
              </span>
              <input
                type="number"
                value={formData.price}
                onChange={(event) => updateFormData({ price: Number(event.target.value) })}
                min={0}
                className="w-full rounded-lg border border-border/40 bg-background py-6 pl-16 pr-24 font-headline text-4xl font-extrabold text-foreground outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/30"
              />
              <span className="absolute inset-y-0 right-6 flex items-center font-headline text-xl font-bold text-muted-foreground">AC</span>
            </div>

            <div className="flex flex-wrap gap-4">
              {pricePresets.map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => updateFormData({ price })}
                  className={`rounded border px-4 py-2 font-headline text-xs font-bold transition-colors ${
                    formData.price === price
                      ? "border-secondary/50 bg-secondary/20 text-secondary"
                      : "border-border/40 bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {price === 0 ? "Free" : `${price.toLocaleString()} AC`}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-border/30 bg-card p-8">
            <div>
              <h2 className="font-headline text-lg font-bold text-foreground">Required Membership Tier</h2>
              <p className="font-body text-sm text-muted-foreground">Optional. Restrict access to viewers with a specific tier level.</p>
            </div>
            <select
              value={formData.requiredTierLevel || ""}
              onChange={(event) => updateFormData({ requiredTierLevel: event.target.value ? Number(event.target.value) : null })}
              className="w-full rounded-lg border border-border/40 bg-input px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">None (Available to all)</option>
              <option value="1">Tier Level 1</option>
              <option value="2">Tier Level 2</option>
              <option value="3">Tier Level 3</option>
            </select>
          </section>
        </div>

        <aside className="sticky top-28 lg:col-span-5">
          <div className="overflow-hidden rounded-lg border border-border/30 bg-card shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
            <div className="p-8">
              <h2 className="mb-8 font-headline text-xl font-bold text-foreground">Earnings Breakdown</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-body text-sm">Gross Price ({formData.price} AC)</span>
                  <span className="font-headline text-foreground">{formData.price * 100} VND</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-muted-foreground">Platform Fee</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-label text-[10px] font-bold text-muted-foreground">10%</span>
                  </div>
                  <span className="font-headline text-primary">- {formData.price * 10} VND</span>
                </div>

                <div className="h-px bg-border/30" />

                <div className="pt-2">
                  <p className="mb-1 font-label text-xs font-bold uppercase tracking-widest text-secondary">Estimated Net</p>
                  <p className="font-headline text-4xl font-extrabold text-foreground">{formData.price * 90} VND</p>
                  <p className="mt-1 font-body text-xs text-muted-foreground">Per purchase</p>
                </div>

                <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <p className="font-body text-xs leading-relaxed text-secondary">
                      Aura DRM protects premium releases. Payments settle automatically to your Wallet after unlocks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t border-border/30 bg-card/80 px-8 backdrop-blur-2xl md:left-64">
        <button onClick={onPrev} className="px-6 py-2.5 font-headline text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
          Back
        </button>
        <button onClick={onNext} className="rounded-sm bg-primary px-8 py-2.5 font-headline text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
          Next: Review & Publish
        </button>
      </div>
    </div>
  );
}
