"use client";

import { useState } from "react";
import { EligibilityChecker } from "./EligibilityChecker";
import { MembershipManagement } from "./MembershipManagement";
import { TierEditorOverlay } from "./TierEditorOverlay";

const INITIAL_TIERS = [
  { id: 1, name: "Silver Vongola", price: 500, subscribers: 124, revenue: "62,000", badgeColor: "bg-zinc-400", perks: ["Loyalty badges", "Custom emojis"] },
  { id: 2, name: "Gold Arcobaleno", price: 1500, subscribers: 45, revenue: "67,500", badgeColor: "bg-[#fdc003]", perks: ["Early access to videos", "Members-only chat"] },
  { id: 3, name: "Platinum Boss", price: 5000, subscribers: 12, revenue: "60,000", badgeColor: "bg-[#ff8e80]", perks: ["Exclusive live streams", "Direct message access"] },
];

export function StudioMembershipFeature() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [tiers, setTiers] = useState(INITIAL_TIERS);

  const handleSaveTier = (updatedTier: any) => {
    setTiers(tiers.map(t => t.id === updatedTier.id ? { ...t, ...updatedTier } : t));
    setEditingTier(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 w-full">
      <div>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Community Memberships</h1>
        <p className="text-zinc-400">Offer exclusive perks, custom emojis, and loyalty badges to your most dedicated fans.</p>
      </div>

      {!isUnlocked ? (
        <EligibilityChecker onUnlock={() => setIsUnlocked(true)} />
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
