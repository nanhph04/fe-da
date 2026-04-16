"use client";

import { useState } from "react";
import { EligibilityChecker } from "./EligibilityChecker";
import { MembershipManagement } from "./MembershipManagement";
import { TierEditorOverlay } from "./TierEditorOverlay";

export function StudioMembershipFeature() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 w-full">
      <div>
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-[#f9f5f8] mb-2">Community Memberships</h1>
        <p className="text-zinc-400">Offer exclusive perks, custom emojis, and loyalty badges to your most dedicated fans.</p>
      </div>

      {!isUnlocked ? (
        <EligibilityChecker onUnlock={() => setIsUnlocked(true)} />
      ) : (
        <MembershipManagement onEditTier={setEditingTier} />
      )}

      {editingTier && (
        <TierEditorOverlay 
          tier={editingTier} 
          onClose={() => setEditingTier(null)} 
        />
      )}
    </div>
  );
}
