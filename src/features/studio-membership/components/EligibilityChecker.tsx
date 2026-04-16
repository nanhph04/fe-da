export function EligibilityChecker({ onUnlock }: { onUnlock: () => void }) {
  // Mock data for Eligibility
  const requirements = [
    { label: "Subscribers", current: 42910, required: 10000, met: true },
    { label: "Total Views", current: 1284502, required: 500000, met: true },
    { label: "Community Violations", current: 0, required: 0, met: true },
  ];

  const isEligible = requirements.every(r => r.met);

  return (
    <div className="bg-[#131315] p-12 rounded-xl border border-[#262528] flex flex-col items-center text-center max-w-3xl mx-auto mt-12 shadow-2xl">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${isEligible ? 'bg-[#ff8e80]/10 text-[#ff8e80] shadow-[#ff8e80]/20' : 'bg-zinc-800 text-zinc-500'}`}>
        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
      </div>
      
      <h2 className="text-3xl font-extrabold font-headline text-white mb-4">
        {isEligible ? "You Are Eligible!" : "Unlock Channel Memberships"}
      </h2>
      <p className="text-zinc-400 mb-8 max-w-lg">
        {isEligible 
          ? "Congratulations! You have met all the requirements to launch your own Membership Tiers. Start earning reliable monthly revenue from your biggest fans."
          : "Build a loyal community and offer exclusive perks, badges, and emojis to your fans. Meet the requirements below to unlock."}
      </p>

      <div className="w-full space-y-4 mb-8">
        {requirements.map((req, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-[#19191c] rounded-lg border border-[#262528]">
            <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">{req.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">
                {req.current.toLocaleString()} / {req.required.toLocaleString() === "0" ? "None" : req.required.toLocaleString()}
              </span>
              {req.met ? (
                <span className="material-symbols-outlined text-green-500">check_circle</span>
              ) : (
                <span className="material-symbols-outlined text-zinc-600">radio_button_unchecked</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button 
        disabled={!isEligible}
        onClick={onUnlock}
        className={`px-8 py-3 font-bold font-headline rounded-sm transition-all text-sm uppercase tracking-widest ${
          isEligible 
            ? 'bg-[#ff8e80] text-black hover:bg-[#ff7668] shadow-lg shadow-[#ff8e80]/20' 
            : 'bg-[#262528] text-zinc-500 cursor-not-allowed'
        }`}
      >
        Enable Memberships
      </button>
    </div>
  );
}
