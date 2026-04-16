import { Button } from "@/components/ui/button";

export function ActiveMemberships() {
  return (
    <section className="sticky top-28 space-y-6">
      <h2 className="text-xl font-bold font-headline flex items-center gap-3 text-[#f9f5f8]">
        <span className="w-1 h-6 bg-[#fdc003] rounded-full"></span>
        Active Memberships
      </h2>

      {/* Membership Card 1 */}
      <div className="group relative bg-[#19191c] p-6 rounded-xl border-l-2 border-[#ff8e80] shadow-xl overflow-hidden hover:bg-[#1f1f22] transition-colors">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ff8e80]/5 rounded-full blur-3xl transition-all group-hover:bg-[#ff8e80]/10"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTL3EALuT5HK3bYon06bqXezCCmgDsnoyoZaLeIkh_wTvhbbCEUn0KWba6c0awNLWqfVD3GkRI_sxlPEW1s_ii3T52viB6h-AEj9pMmfss8dhRCVUY0sM4x6NpCNgHs6j1vUOnAdQKyM4DE6JlvWqEOkbBsco66DdHY3F0M_TrxTaK-AVijACj8tP6yn5EtiTe-GCZbYpbudpyWaKlz45cRf_eMRO4Zv_702AEpl8_JolRrajLuC46lsK2xPfxdrnBVth-Y2nznxpL" 
                alt="CinemaLabs" 
              />
            </div>
            <div>
              <h3 className="font-black text-lg font-headline text-[#f9f5f8]">CinemaLabs</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Level 2 Active</span>
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-zinc-600 hover:text-white cursor-pointer">more_vert</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Next billing: Dec 01, 2023</span>
            <span className="text-[#fdc003] font-bold">450 AC / mo</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-9 bg-[#262528] border-[#48474a]/20 text-[11px] font-black uppercase tracking-wider hover:bg-zinc-800 text-white">
              Manage
            </Button>
            <Button variant="outline" className="h-9 bg-[#ff8e80]/10 border-[#ff8e80]/20 text-[#ff8e80] text-[11px] font-black uppercase tracking-wider hover:bg-[#ff8e80] hover:text-black">
              Upgrade
            </Button>
          </div>
        </div>
      </div>

      {/* Membership Card 2 */}
      <div className="group relative bg-[#19191c] p-6 rounded-xl border-l-2 border-[#fdc003] shadow-xl overflow-hidden hover:bg-[#1f1f22] transition-colors">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#fdc003]/5 rounded-full blur-3xl transition-all group-hover:bg-[#fdc003]/10"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYuoRir045_ApaWbZKkJUaaA4ZCiSEsY8HTF2cO08xUn4B4eacwJSP7k50f0Om5Vy8Ib15tELny7pZbkFuyHfbj8giJP33GNGxSDqBcfd7oS974OJA9tJQm2XCfEpyJzAPEVe1iWc80nfAPhaY9_g-gaMl_ZO2C46ce-Eoo5D0uxDM4OU-fMXW55qHTtF-fPrwKsvl0SuENKDV1i0AaEgjPF5K_cIyVeno3RFTG2osSuma2_capMl0Pl1VgSxqMFVhpLmCVWXtdDth" 
                alt="Vivid Motion" 
              />
            </div>
            <div>
              <h3 className="font-black text-lg font-headline text-[#f9f5f8]">Vivid Motion</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Level 1 Active</span>
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-zinc-600 hover:text-white cursor-pointer">more_vert</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Next billing: Nov 28, 2023</span>
            <span className="text-[#fdc003] font-bold">200 AC / mo</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-9 bg-[#262528] border-[#48474a]/20 text-[11px] font-black uppercase tracking-wider hover:bg-zinc-800 text-white">
              Manage
            </Button>
            <Button variant="outline" className="h-9 bg-[#fdc003]/10 border-[#fdc003]/20 text-[#fdc003] text-[11px] font-black uppercase tracking-wider hover:bg-[#fdc003] hover:text-black">
              Upgrade
            </Button>
          </div>
        </div>
      </div>

      {/* Add Membership CTA */}
      <div className="border-2 border-dashed border-[#48474a]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:border-[#ff8e80]/40 transition-colors cursor-pointer group bg-black/20">
        <div className="w-12 h-12 rounded-full bg-[#1f1f22] flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-zinc-500 group-hover:text-[#ff8e80]">add</span>
        </div>
        <div>
          <p className="font-bold text-[#f9f5f8] text-sm">Explore Gallery Channels</p>
          <p className="text-xs text-zinc-500">Unlock exclusive director cuts and premium features</p>
        </div>
      </div>
    </section>
  );
}
