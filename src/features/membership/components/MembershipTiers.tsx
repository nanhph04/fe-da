"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MembershipTiers({ onSelectTier }: { onSelectTier?: (tier: string) => void }) {
  const [activeTier, setActiveTier] = useState<string>("Premium");

  const handleSelect = (tier: string) => {
    setActiveTier(tier);
    if(onSelectTier) onSelectTier(tier);
  };

  return (
    <div className="mb-24">
      <div className="mb-12">
        <h2 className="font-headline text-3xl font-bold text-foreground mb-2">Join The Velvet Gallery</h2>
        <p className="text-muted-foreground max-w-2xl">
          Support your favorite creators and unlock exclusive cinematic content, early access, and unique member identities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Level 1: Standard */}
        <div className={`group relative bg-card rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out cursor-pointer
            ${activeTier === 'Standard' ? 'border-2 border-primary shadow-[0_0_30px_rgba(255,142,128,0.15)] ring-1 ring-primary' : 'border border-border/20 hover:border-primary/50'}`}
          onClick={() => handleSelect("Standard")}
        >
          <div className="mb-8">
            <h3 className="font-headline text-sm font-bold text-muted-foreground tracking-[0.2em] uppercase mb-1">Level 1</h3>
            <div className={`text-2xl font-headline font-black uppercase ${activeTier === 'Standard' ? 'text-primary' : 'text-foreground'}`}>Standard</div>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-headline font-black text-foreground">50</span>
              <span className="text-[#fdc003] font-headline font-bold">AC</span>
              <span className="text-muted-foreground text-sm ml-2">/ month</span>
            </div>
          </div>
          <div className="space-y-4 mb-12 flex-grow">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-muted-foreground text-sm">Exclusive Loyalty Badge</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-muted-foreground text-sm">Custom Emojis in Live Chat</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-muted-foreground text-sm">Members-only Community Posts</span>
            </div>
          </div>
          <Button 
            className={`w-full font-bold py-6 rounded-sm uppercase tracking-widest text-xs transition-colors ${activeTier === 'Standard' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-foreground hover:bg-muted'}`}
          >
            {activeTier === 'Standard' ? 'Proceeding...' : 'Join Now'}
          </Button>
        </div>

        {/* Level 2: Premium (Featured) */}
        <div className={`relative bg-background rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out cursor-pointer scale-105 z-10
            ${activeTier === 'Premium' ? 'border-2 border-primary shadow-[0px_20px_60px_rgba(255,142,128,0.2)]' : 'border border-primary/20 shadow-[0px_20px_60px_rgba(255,142,128,0.08)]'}`}
            onClick={() => handleSelect("Premium")}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-sm">
            Most Popular
          </div>
          <div className="mb-8 mt-2">
            <h3 className="font-headline text-sm font-bold text-primary tracking-[0.2em] uppercase mb-1">Level 2</h3>
            <div className="text-2xl font-headline font-black text-foreground uppercase">Premium</div>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-headline font-black text-foreground">150</span>
              <span className="text-[#fdc003] font-headline font-bold">AC</span>
              <span className="text-muted-foreground text-sm ml-2">/ month</span>
            </div>
          </div>
          <div className="space-y-4 mb-12 flex-grow">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-foreground text-sm font-semibold">All Level 1 Perks</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-foreground text-sm">Early Access to New Videos</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-foreground text-sm">Behind the Scenes Content</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-foreground text-sm">Priority Comment Response</span>
            </div>
          </div>
          <Button 
            className={`w-full font-black py-6 rounded-sm uppercase tracking-widest text-xs transition-colors ${activeTier === 'Premium' ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80' : 'bg-muted text-foreground hover:bg-muted'}`}
          >
            {activeTier === 'Premium' ? 'Proceeding...' : 'Join Now'}
          </Button>
        </div>

        {/* Level 3: Exclusive */}
        <div className={`group relative bg-card rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out cursor-pointer
            ${activeTier === 'Exclusive' ? 'border-2 border-[#fdc003] shadow-[0_0_30px_rgba(253,192,3,0.15)] ring-1 ring-[#fdc003]' : 'border border-border/20 hover:border-[#fdc003]/50'}`}
          onClick={() => handleSelect("Exclusive")}
        >
          <div className="mb-8">
            <h3 className="font-headline text-sm font-bold text-[#fdc003] tracking-[0.2em] uppercase mb-1">Level 3</h3>
            <div className={`text-2xl font-headline font-black uppercase ${activeTier === 'Exclusive' ? 'text-[#fdc003]' : 'text-foreground'}`}>Exclusive</div>
          </div>
          <div className="mb-10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-headline font-black text-foreground">300</span>
              <span className="text-[#fdc003] font-headline font-bold">AC</span>
              <span className="text-muted-foreground text-sm ml-2">/ month</span>
            </div>
          </div>
          <div className="space-y-4 mb-12 flex-grow">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#fdc003] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-foreground text-sm font-semibold">Lv1 + Lv2 Access</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-muted-foreground text-sm">Live Member Hangouts</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-muted-foreground text-sm">Monthly Q&A Participation</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-muted-foreground text-sm">Exclusive Badges & Merch Discounts</span>
            </div>
          </div>
          <Button 
            className={`w-full font-bold py-6 rounded-sm uppercase tracking-widest text-xs transition-colors ${activeTier === 'Exclusive' ? 'bg-[#fdc003] text-primary-foreground hover:bg-[#e6a800]' : 'bg-muted text-foreground hover:bg-muted'}`}
          >
            {activeTier === 'Exclusive' ? 'Proceeding...' : 'Join Now'}
          </Button>
        </div>

      </div>
    </div>
  );
}
