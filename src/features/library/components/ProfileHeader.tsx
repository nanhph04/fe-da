export function ProfileHeader() {
  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-[#48474a]/10 pb-12">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-[#f9f5f8]">
          Alex Rivera
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <span className="px-3 py-1 bg-[#fdc003]/10 border border-[#fdc003]/30 text-[#fdc003] text-xs font-bold tracking-widest uppercase rounded">
            Gold Status
          </span>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="material-symbols-outlined text-zinc-500">calendar_today</span>
            <span className="text-sm font-medium">Member since 2022</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 p-6 bg-[#131315] rounded-xl border border-[#48474a]/10">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#adaaad] font-bold">
            Aura Balance
          </span>
          <div className="text-3xl font-headline font-black text-[#fdc003] flex items-center gap-2">
            120 AC
            <span className="material-symbols-outlined text-[#fdc003] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
          </div>
        </div>
        <button className="bg-[#ff8e80] hover:bg-[#e80f16] text-[#610003] px-6 py-3 rounded font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-[#ff8e80]/20">
          Top Up
        </button>
      </div>
    </section>
  );
}
