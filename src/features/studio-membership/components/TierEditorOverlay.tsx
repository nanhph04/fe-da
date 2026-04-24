import { useState } from "react";

export function TierEditorOverlay({ tier, onClose, onSave }: { tier: any, onClose: () => void, onSave: (tier: any) => void }) {
  const [name, setName] = useState(tier?.name || "");
  const [price, setPrice] = useState(tier?.price || 500);
  const [perks, setPerks] = useState<string[]>(tier?.perks || ["Loyalty badges", "Custom emojis"]);

  const handleSave = () => {
    onSave({
      ...tier,
      name,
      price,
      perks,
      // If it's a new tier, provide default stats
      id: tier?.id || Date.now(),
      subscribers: tier?.subscribers || 0,
      revenue: tier?.revenue || "0",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#131315] w-full max-w-xl rounded-xl border border-[#262528] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262528] flex justify-between items-center bg-[#19191c]">
          <h3 className="text-xl font-headline font-bold text-white">
            {tier?.id ? "Edit Tier" : "Create New Tier"}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tier Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Silver Member"
              className="w-full bg-[#19191c] border-2 border-zinc-800 focus:border-[#ff8e80] focus:ring-0 rounded-lg py-3 px-4 text-white font-bold transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Monthly Price (AC)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-3 text-[#fdc003]">monetization_on</span>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#19191c] border-2 border-zinc-800 focus:border-[#fdc003] focus:ring-0 rounded-lg py-3 pl-12 pr-4 text-white font-bold transition-all outline-none"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Pricing must be between 100 AC and 10,000 AC.</p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Included Perks</label>
            <ul className="space-y-2">
              {perks.map((perk, i) => (
                <li key={i} className="flex items-center justify-between bg-[#19191c] p-3 rounded-lg border border-[#262528]">
                  <span className="text-sm text-zinc-300">{perk}</span>
                  <button onClick={() => setPerks(perks.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
               <input type="text" placeholder="Add a new perk" className="flex-1 bg-transparent border-b border-zinc-700 py-2 text-sm text-white focus:border-[#ff8e80] outline-none" id="new-perk" />
               <button 
                  onClick={() => {
                    const el = document.getElementById("new-perk") as HTMLInputElement;
                    if (el.value) { setPerks([...perks, el.value]); el.value = ""; }
                  }}
                  className="px-4 py-2 bg-[#19191c] text-[#ff8e80] text-xs font-bold rounded-sm border border-zinc-800 hover:border-[#ff8e80]"
               >
                 Add
               </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-[#262528] bg-[#19191c] flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-3 bg-[#ff8e80] hover:bg-[#ff7668] text-black font-bold text-sm rounded-sm transition-colors font-headline"
          >
            Save Tier
          </button>
        </div>
      </div>
    </div>
  );
}
