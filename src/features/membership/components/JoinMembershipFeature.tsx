"use client";

import { useState } from "react";
import { CreatorHero } from "./CreatorHero";
import { MembershipTiers } from "./MembershipTiers";
import { MembershipFAQ } from "./MembershipFAQ";
import { CheckoutOverlay } from "./CheckoutOverlay";

export function JoinMembershipFeature() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 z-50 w-full bg-black/40 shadow-[0px_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex w-full items-center justify-between px-8 py-4">
          <div className="font-headline text-2xl font-black tracking-tight text-primary">Velvet Gallery</div>
          <nav className="hidden items-center gap-8 md:flex">
            <span className="text-sm font-medium text-zinc-400">Browse</span>
            <span className="border-b-2 border-primary pb-1 text-sm font-bold text-primary">Memberships</span>
            <span className="text-sm font-medium text-zinc-400">Live</span>
            <span className="text-sm font-medium text-zinc-400">My Coins</span>
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 rounded-full border border-border/20 bg-card px-3 py-1.5">
              <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-headline text-sm font-bold text-foreground">1,240 AC</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-screen max-w-7xl px-6 pt-24 pb-20 lg:px-8">
        <CreatorHero />
        <MembershipTiers onSelectTier={() => setIsCheckoutOpen(true)} />
        <MembershipFAQ />
      </main>

      {isCheckoutOpen && (
        <CheckoutOverlay onClose={() => setIsCheckoutOpen(false)} />
      )}
    </div>
  );
}
