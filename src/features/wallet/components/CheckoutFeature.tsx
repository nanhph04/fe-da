"use client";

import { EmbeddedPayOsCheckout } from "./EmbeddedPayOsCheckout";
import type { DepositPackage } from "../types/wallet.types";

interface CheckoutFeatureProps {
  initialPackage: DepositPackage;
}

export function CheckoutFeature({ initialPackage }: CheckoutFeatureProps) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12 md:py-24 md:pl-64">
      <EmbeddedPayOsCheckout selectedPackage={initialPackage} />
    </main>
  );
}
