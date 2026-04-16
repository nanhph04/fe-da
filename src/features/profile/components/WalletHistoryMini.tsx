const MINIHISTORY = [
  { id: 1, title: "Aura Top-up", date: "Nov 12, 2023 • 14:20", amount: "+500 AC", details: "Mastercard **88", type: "add" },
  { id: 2, title: 'Unlocked: "Neon Pulse" 4K', date: "Nov 08, 2023 • 21:05", amount: "-120 AC", details: "Video Purchase", type: "unlock" },
  { id: 3, title: "CinemaLabs - Level 2 Renewal", date: "Nov 01, 2023 • 00:00", amount: "-450 AC", details: "Monthly Sub", type: "sub" }
];

export function WalletHistoryMini() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-headline flex items-center gap-3 text-[#f9f5f8]">
          <span className="w-1 h-6 bg-[#ff8e80] rounded-full"></span>
          Wallet History
        </h2>
        <button className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-[#ff8e80] transition-colors">
          View All
        </button>
      </div>
      
      <div className="bg-[#19191c] rounded-xl overflow-hidden border border-[#48474a]/10 shadow-lg">
        {MINIHISTORY.map((item, id) => (
          <div key={item.id} className={`flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors ${id !== MINIHISTORY.length - 1 ? 'border-b border-[#48474a]/10' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-[#1f1f22] flex items-center justify-center ${item.type === 'add' ? 'text-[#fdc003]' : 'text-[#ff8e80]'}`}>
                <span className="material-symbols-outlined text-sm">
                  {item.type === 'add' ? 'add_circle' : item.type === 'unlock' ? 'play_circle' : 'stars'}
                </span>
              </div>
              <div>
                <p className="font-bold text-[#f9f5f8] text-sm">{item.title}</p>
                <p className="text-[10px] text-zinc-500">{item.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-black ${item.type === 'add' ? 'text-[#fdc003]' : 'text-[#f9f5f8]'}`}>{item.amount}</p>
              <p className="text-[10px] text-zinc-500">{item.details}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
