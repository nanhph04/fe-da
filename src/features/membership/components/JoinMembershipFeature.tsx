"use client";

import { useState } from "react";
import { CreatorHero } from "./CreatorHero";
import { MembershipTiers } from "./MembershipTiers";
import { MembershipFAQ } from "./MembershipFAQ";
import { CheckoutOverlay } from "./CheckoutOverlay";

export function JoinMembershipFeature() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="md:pl-64">
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 lg:px-8 min-h-screen">
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
