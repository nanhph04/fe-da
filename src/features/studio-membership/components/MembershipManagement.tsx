export function MembershipManagement({ onEditTier }: { onEditTier: (tier: any) => void }) {
  const TIERS = [
    { id: 1, name: "Silver Vongola", price: 500, subscribers: 124, revenue: "62,000", badgeColor: "bg-zinc-400" },
    { id: 2, name: "Gold Arcobaleno", price: 1500, subscribers: 45, revenue: "67,500", badgeColor: "bg-[#fdc003]" },
    { id: 3, name: "Platinum Boss", price: 5000, subscribers: 12, revenue: "60,000", badgeColor: "bg-[#ff8e80]" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Banner */}
      <div className="bg-[#131315] p-8 rounded-xl border border-[#262528] flex justify-between items-center bg-gradient-to-r from-[#19191c] to-[#262528]/50">
        <div>
          <h2 className="text-xl font-bold font-headline text-white mb-2">Membership is Active</h2>
          <p className="text-sm text-zinc-400">You currently have <strong className="text-[#ff8e80]">181 active members</strong> generating <strong className="text-[#fdc003]">189,500 AC</strong> monthly.</p>
        </div>
        <button onClick={() => onEditTier({})} className="px-6 py-2 bg-[#ff8e80] text-black font-bold text-sm rounded-sm shadow-lg shadow-[#ff8e80]/20 hover:scale-105 transition-transform flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Tier
        </button>
      </div>

      {/* Tiers List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map(tier => (
          <div key={tier.id} className="bg-[#131315] rounded-xl border border-[#262528] p-6 hover:border-zinc-700 transition-colors relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${tier.badgeColor} opacity-5 blur-2xl rounded-full`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold font-headline text-white flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${tier.badgeColor}`}></div>
                {tier.name}
              </h3>
              <button onClick={() => onEditTier(tier)} className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Monthly Price</span>
                <span className="text-2xl font-black text-[#fdc003] font-headline">{tier.price} <span className="text-sm text-zinc-500">AC</span></span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[#262528] pt-4">
                 <div>
                   <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Members</span>
                   <span className="text-lg font-bold text-white">{tier.subscribers}</span>
                 </div>
                 <div>
                   <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Est. Revenue</span>
                   <span className="text-lg font-bold text-zinc-300">{tier.revenue}</span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
