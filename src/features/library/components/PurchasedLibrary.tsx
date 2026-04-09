export function PurchasedLibrary() {
  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-headline font-bold text-[#f9f5f8]">Purchased Library</h2>
        <div className="flex gap-2">
          <button className="p-2 bg-[#19191c] rounded-lg border border-[#48474a]/10 hover:bg-[#2c2c2f] transition-colors">
            <span className="material-symbols-outlined text-[#f9f5f8]">grid_view</span>
          </button>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Featured Purchase */}
        <div className="md:col-span-2 group relative h-80 rounded-xl overflow-hidden cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            alt="Feature image" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAid94BNE3sFtwcS3gkTJG4_t43RRz2EBDIFtsR9nKeloXj1VfBWq14vdCW7kWTCABeKrMHhjmaXnIt9--Fu4pJjBZwMDOnYXx5MxKxudVlWYPRTqj0JhUIAEHyTRlR9YyWl7rjk_jrtcdBUtqTd0t1CTv-tyIhOEXu2GU_3LL3qxNld8DcVYQLzpqC_FDDGwt-W7NANysU7R-qTaRXs5RYGd-Gs8u5h97Xgq-AJsIHYevJ-kyq8wmMq_XFPf-w9w4WQdPfySDZJJUX" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4">
            <span className="bg-[#fdc003] text-[#553e00] px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-1 shadow-xl shadow-[#fdc003]/20">
              <span className="material-symbols-outlined text-sm fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Purchased
            </span>
          </div>
          <div className="absolute bottom-8 left-8 space-y-2">
            <h3 className="text-4xl font-headline font-black tracking-tighter text-[#f9f5f8]">THE GOLDEN DUST</h3>
            <p className="text-zinc-300 max-w-md line-clamp-2">
              An experimental visual odyssey exploring the intersection of light and matter across forgotten worlds.
            </p>
          </div>
        </div>

        {/* Regular Purchase 1 */}
        <div className="group bg-[#131315] rounded-xl border border-[#48474a]/10 overflow-hidden hover:border-[#ff8e80]/40 transition-colors cursor-pointer">
          <div className="relative h-48 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Beyond the veil" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiLct64M1cwq1a6r1TM5I-i582vo7ZUmqTcS4Rrv2FMXKLT8120aRhbxQbjz--sVknbBXlbxR372qgEsNrQARFcGmtJVlTtKSoMog6f-W_vK7vD3HK8SOte1tLTdZgCZS-IKm8OeWyJQnpRzCu-b3t_7fNq9yKsEm96vUSo6mF1One4aNYxVPKDOHxeDCwcHx20rOCbTXDd5cRCWT4UfNMFU49ohBhTxEJ5ZJTXvkVHinCTKQPtnMyaXWKphsL5sAAO7DrNkCQfuKd" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-300">Owned</div>
          </div>
          <div className="p-5 space-y-2">
            <h4 className="font-headline font-bold text-lg text-[#f9f5f8]">Beyond the Veil</h4>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Sci-Fi Documentary</span>
              <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Regular Purchase 2 */}
        <div className="group bg-[#131315] rounded-xl border border-[#48474a]/10 overflow-hidden hover:border-[#ff8e80]/40 transition-colors cursor-pointer">
          <div className="relative h-48 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Cyber Streets" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-7inNEDJ7voj5WjL9cB53rsfsMi1u2P9AB8e_Gh5jjGRYYK6aNenK8cYRIzPPk6X9YDpGoSrMq1rkBT-r6GNnPhbHvQAwFPhuBPoq7-7t_flZ8qX_GJGaSlChzCmgECLITJi2xopcrx7cAvvNQ522sCuTOYf7zf3GxU0hIUd11tjyeWgOX99s04hfX_qV-c7kyf41eiaAp7aiNkhpL6KvvLOemsBujz9fs39thTYmTwh45r6jieBkwN7scQDdfLHahf-iHaxLJE4B" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-300">Owned</div>
          </div>
          <div className="p-5 space-y-2">
            <h4 className="font-headline font-bold text-lg text-[#f9f5f8]">Cyber Streets: Nightfall</h4>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Action Narrative</span>
              <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Regular Purchase 3 */}
        <div className="group bg-[#131315] rounded-xl border border-[#48474a]/10 overflow-hidden hover:border-[#ff8e80]/40 transition-colors cursor-pointer">
          <div className="relative h-48 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Prism Flow" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7WLfChg8KtIpZmAbTSlJeWLKulKRU_DHP2qFOQOH3SnuvsfGdAg3N48NjF8K3Fezgyix8DDFe_h1PPt5oqCCv-gqM8P_CWc1sougILjpx90Vkpu1UGbm691WqFpN3gVBypMtjttoYZnBXtbUuyYvQycZ9naWyAPnZC4dcENegYWKO2ZCP5v90dLpUWt_rTpa2W1hick3Rz4YuxzNWIbtiyGf_OpR01fCus_2Okk-Fli9uas2pw6nqrh6rsam0-QhSbLI9heWnpdIr" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-300">Owned</div>
          </div>
          <div className="p-5 space-y-2">
            <h4 className="font-headline font-bold text-lg text-[#f9f5f8]">Prism: Chromatic Flow</h4>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm">Art Film</span>
              <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
