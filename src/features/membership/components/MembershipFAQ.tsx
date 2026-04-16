import { Button } from "@/components/ui/button";

export function MembershipFAQ() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-[#48474a]/20 pt-16 mt-16">
      <div>
        <h4 className="font-headline font-bold text-xl mb-4 text-[#f9f5f8]">Membership Rules</h4>
        <ul className="space-y-4 text-zinc-400 text-sm leading-relaxed list-disc pl-5">
          <li>Subscriptions renew automatically every 30 days.</li>
          <li>You can cancel or change your tier at any time through your account settings.</li>
          <li>All memberships are non-refundable once the perks have been accessed.</li>
        </ul>
      </div>

      <div>
        <h4 className="font-headline font-bold text-xl mb-4 text-[#f9f5f8]">Need More Aura Coins?</h4>
        <div className="bg-[#19191c] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#48474a]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#fdc003]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>add_shopping_cart</span>
            </div>
            <div>
              <div className="text-[#f9f5f8] font-bold">Refill Wallet</div>
              <div className="text-zinc-400 text-xs mt-1">Starting from 100 AC / 100,000 VND</div>
            </div>
          </div>
          <Button className="px-6 py-5 bg-[#f9f5f8] text-[#0e0e10] font-bold text-xs uppercase rounded-full hover:bg-[#ff8e80] transition-colors">
            Top Up
          </Button>
        </div>
      </div>
    </section>
  );
}
