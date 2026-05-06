"use client";

import { useState, useEffect } from "react";
import { EligibilityChecker } from "./EligibilityChecker";
import { MembershipManagement } from "./MembershipManagement";
import { TierEditorOverlay } from "./TierEditorOverlay";
import { mediaService, ChannelDetailResponse } from "@/features/watch/services/mediaService";

export interface StudioTier {
  id: number;
  name: string;
  price: number;
  subscribers: number;
  revenue: string;
  badgeColor?: string;
  perks: string[];
}

const INITIAL_TIERS: StudioTier[] = [
  { id: 1, name: "Silver Vongola", price: 500, subscribers: 124, revenue: "62,000", badgeColor: "bg-zinc-400", perks: ["Loyalty badges", "Custom emojis"] },
  { id: 2, name: "Gold Arcobaleno", price: 1500, subscribers: 45, revenue: "67,500", badgeColor: "bg-[#fdc003]", perks: ["Early access to videos", "Members-only chat"] },
  { id: 3, name: "Platinum Boss", price: 5000, subscribers: 12, revenue: "60,000", badgeColor: "bg-[#ff8e80]", perks: ["Exclusive live streams", "Direct message access"] },
];

export function StudioMembershipFeature() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [editingTier, setEditingTier] = useState<StudioTier | null>(null);
  const [tiers, setTiers] = useState(INITIAL_TIERS);
  const [channelDetail, setChannelDetail] = useState<ChannelDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const myChannelRes = await mediaService.getMyChannel();
        if (myChannelRes.success && myChannelRes.data?.channelId) {
          const detailRes = await mediaService.getChannel(myChannelRes.data.channelId);
          if (detailRes.success && detailRes.data) {
            setChannelDetail(detailRes.data);
            if (detailRes.data.membershipTiers && detailRes.data.membershipTiers.length > 0) {
              // Map API tiers to StudioTier
              const mappedTiers = detailRes.data.membershipTiers.map(t => ({
                id: parseInt(t.id) || Math.floor(Math.random() * 1000), // Note: UI uses number id, API uses string
                name: t.name,
                price: t.priceCoin,
                subscribers: 0, // Mock for now until API supports subscriber count per tier
                revenue: "0",
                badgeColor: t.level === 3 ? "bg-[#ff8e80]" : t.level === 2 ? "bg-[#fdc003]" : "bg-zinc-400",
                perks: t.level === 3 ? ["Exclusive live streams"] : t.level === 2 ? ["Early access"] : ["Loyalty badges"],
              }));
              setTiers(mappedTiers);
              setIsUnlocked(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load channel membership data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembershipData();
  }, []);

  const handleSaveTier = (updatedTier: StudioTier) => {
    setTiers((currentTiers) => {
      const existingTier = currentTiers.find((tier) => tier.id === updatedTier.id);
      if (!existingTier) {
        return [...currentTiers, updatedTier];
      }

      return currentTiers.map((tier) =>
        tier.id === updatedTier.id ? { ...tier, ...updatedTier } : tier
      );
    });
    setEditingTier(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 w-full">
      <div>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Community Memberships</h1>
        <p className="text-zinc-400">Offer exclusive perks, custom emojis, and loyalty badges to your most dedicated fans.</p>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 py-12">Loading membership details...</div>
      ) : !isUnlocked ? (
        <EligibilityChecker onUnlock={() => setIsUnlocked(true)} eligibility={channelDetail?.membershipEligibility} />
      ) : (
        <MembershipManagement tiers={tiers} onEditTier={setEditingTier} />
      )}

      {editingTier && (
        <TierEditorOverlay 
          tier={editingTier} 
          onClose={() => setEditingTier(null)} 
          onSave={handleSaveTier}
        />
      )}
    </div>
  );
}
