import { Button } from "@/components/ui/button";

export function MembershipTiers({ onSelectTier }: { onSelectTier?: () => void }) {
  return (
    <div className="mb-24">
      <div className="mb-12">
        <h2 className="font-headline text-3xl font-bold text-[#f9f5f8] mb-2">Join The Velvet Gallery</h2>
        <p className="text-zinc-400 max-w-2xl">
          Support your favorite creators and unlock exclusive cinematic content, early access, and unique member identities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Level 1: Standard */}
        <div className="group relative bg-[#131315] rounded-xl p-8 flex flex-col transition-all duration-300 hover:bg-[#19191c] border border-transparent hover:border-[#48474a]/20">
          <div className="mb-8">
            <h3 className="font-headline text-sm font-bold text-zinc-500 tracking-[0.2em] uppercase mb-1">Level 1</h3>
            <div className="text-2xl font-headline font-black text-[#f9f5f8] uppercase">Standard</div>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-headline font-black text-[#f9f5f8]">50</span>
              <span className="text-[#fdc003] font-headline font-bold">AC</span>
              <span className="text-zinc-500 text-sm ml-2">/ month</span>
            </div>
          </div>
          <div className="space-y-4 mb-12 flex-grow">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-zinc-400 text-sm">Exclusive Loyalty Badge</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-zinc-400 text-sm">Custom Emojis in Live Chat</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-zinc-400 text-sm">Members-only Community Posts</span>
            </div>
          </div>
          <Button 
            onClick={onSelectTier}
            variant="secondary" 
            className="w-full bg-[#262528] text-white hover:bg-[#48474a] font-bold py-6 rounded-sm uppercase tracking-widest text-xs"
          >
            Join Now
          </Button>
        </div>

        {/* Level 2: Premium (Featured) */}
        <div className="relative bg-[#19191c] rounded-xl p-8 flex flex-col shadow-[0px_20px_60px_rgba(255,142,128,0.08)] border border-[#ff8e80]/20 scale-105 z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff8e80] text-black text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-sm">
            Most Popular
          </div>
          <div className="mb-8 mt-2">
            <h3 className="font-headline text-sm font-bold text-[#ff8e80] tracking-[0.2em] uppercase mb-1">Level 2</h3>
            <div className="text-2xl font-headline font-black text-[#f9f5f8] uppercase">Premium</div>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-headline font-black text-[#f9f5f8]">150</span>
              <span className="text-[#fdc003] font-headline font-bold">AC</span>
              <span className="text-zinc-500 text-sm ml-2">/ month</span>
            </div>
          </div>
          <div className="space-y-4 mb-12 flex-grow">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-[#f9f5f8] text-sm font-semibold">All Level 1 Perks</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-[#f9f5f8] text-sm">Early Access to New Videos</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-[#f9f5f8] text-sm">Behind the Scenes Content</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-[#f9f5f8] text-sm">Priority Comment Response</span>
            </div>
          </div>
          <Button 
            onClick={onSelectTier}
            className="w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] text-[#650003] hover:from-[#ff7668] hover:to-[#ff5b4c] font-black py-6 rounded-sm uppercase tracking-widest text-xs"
          >
            Join Now
          </Button>
        </div>

        {/* Level 3: Exclusive */}
        <div className="group relative bg-[#131315] rounded-xl p-8 flex flex-col transition-all duration-300 hover:bg-[#19191c] border border-transparent hover:border-[#48474a]/20">
          <div className="mb-8">
            <h3 className="font-headline text-sm font-bold text-[#fdc003] tracking-[0.2em] uppercase mb-1">Level 3</h3>
            <div className="text-2xl font-headline font-black text-[#f9f5f8] uppercase">Exclusive</div>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-headline font-black text-[#f9f5f8]">300</span>
              <span className="text-[#fdc003] font-headline font-bold">AC</span>
              <span className="text-zinc-500 text-sm ml-2">/ month</span>
            </div>
          </div>
          <div className="space-y-4 mb-12 flex-grow">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#fdc003] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-[#f9f5f8] text-sm font-semibold">Lv1 + Lv2 Access</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-zinc-400 text-sm">Live Member Hangouts</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-zinc-400 text-sm">Monthly Q&A Participation</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ff8e80] text-xl">check_circle</span>
              <span className="text-zinc-400 text-sm">Exclusive Badges & Merch Discounts</span>
            </div>
          </div>
          <Button 
            onClick={onSelectTier}
            variant="secondary" 
            className="w-full bg-[#262528] text-white hover:bg-[#48474a] font-bold py-6 rounded-sm uppercase tracking-widest text-xs"
          >
            Join Now
          </Button>
        </div>

      </div>
    </div>
  );
}
