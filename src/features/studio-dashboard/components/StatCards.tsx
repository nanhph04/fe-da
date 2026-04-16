export function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="p-6 rounded-sm bg-[#19191c] border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl text-white">visibility</span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Total Views</p>
        <h3 className="text-3xl font-headline font-extrabold mt-2 text-[#f9f5f8]">1,284,502</h3>
        <div className="mt-4 flex items-center gap-1 text-[#ff8e80] text-xs font-bold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          +12.4% <span className="text-zinc-600 font-normal ml-1">vs last month</span>
        </div>
      </div>
      
      <div className="p-6 rounded-sm bg-[#19191c] border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl text-white">person_add</span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">New Subscribers</p>
        <h3 className="text-3xl font-headline font-extrabold mt-2 text-[#f9f5f8]">42,910</h3>
        <div className="mt-4 flex items-center gap-1 text-[#ff8e80] text-xs font-bold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          +8.2% <span className="text-zinc-600 font-normal ml-1">vs last month</span>
        </div>
      </div>
      
      <div className="p-6 rounded-sm bg-[#19191c] border-none relative overflow-hidden group border-l-2 border-[#fdc003]/30">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl text-[#fdc003]">monetization_on</span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Earnings (Aura Coins)</p>
        <h3 className="text-3xl font-headline font-extrabold mt-2 text-[#fdc003]">850,200</h3>
        <div className="mt-4 flex items-center gap-1 text-[#fdc003] text-xs font-bold">
          <span className="material-symbols-outlined text-sm">payments</span>
          ≈ 85,020,000 VND
        </div>
      </div>
      
      <div className="p-6 rounded-sm bg-[#19191c] border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl text-white">schedule</span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Avg. Watch Time</p>
        <h3 className="text-3xl font-headline font-extrabold mt-2 text-[#f9f5f8]">14m 22s</h3>
        <div className="mt-4 flex items-center gap-1 text-red-500 text-xs font-bold">
          <span className="material-symbols-outlined text-sm">trending_down</span>
          -2.1% <span className="text-zinc-600 font-normal ml-1">vs last month</span>
        </div>
      </div>
    </div>
  );
}
