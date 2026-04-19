"use client";

import Link from "next/link";

export function VerificationDetailFeature() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/verifications">
          <button className="p-2 hover:bg-[#19191c] rounded-full transition-colors flex items-center justify-center text-zinc-400 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </Link>
        <span className="font-headline text-2xl font-bold tracking-tight uppercase">Application Review</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#262528]">
        <div className="flex items-center gap-6">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" alt="Creator Portrait" className="w-24 h-24 rounded-sm object-cover border border-red-600" />
            <div className="absolute -bottom-2 -right-2 bg-red-600 p-1 flex items-center justify-center rounded-sm">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
          <div>
            <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-white">Kaelen Thorne</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-zinc-400 font-mono text-sm">@kaelen_studio</span>
              <span className="px-2 py-0.5 bg-red-600/10 text-red-500 border border-red-600/30 text-[10px] font-bold uppercase tracking-widest rounded-sm">Premier</span>
            </div>
            <div className="flex gap-4 mt-4 font-mono text-xs text-zinc-500">
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>London, UK</div>
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>Applied 2 days ago</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Info */}
        <div className="col-span-1 md:col-span-8 space-y-8">
          <div className="bg-[#0a0a0a] p-6 border border-zinc-800 rounded-sm">
            <h3 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">badge</span> Verification Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="aspect-video bg-black rounded-sm border border-zinc-800 relative flex flex-col items-center justify-center text-center p-4 overflow-hidden group cursor-pointer">
                  <span className="material-symbols-outlined text-3xl mb-2 text-zinc-600">visibility_off</span>
                  <p className="text-xs font-mono text-zinc-500">ID Card - Front</p>
                  <button className="mt-2 text-[10px] uppercase font-bold text-red-500 group-hover:text-red-400">Reveal Encrypted Content</button>
               </div>
               <div className="aspect-video bg-black rounded-sm border border-zinc-800 relative flex flex-col items-center justify-center text-center p-4 overflow-hidden group cursor-pointer">
                  <span className="material-symbols-outlined text-3xl mb-2 text-zinc-600">visibility_off</span>
                  <p className="text-xs font-mono text-zinc-500">Facial Match Selfie</p>
                  <button className="mt-2 text-[10px] uppercase font-bold text-red-500 group-hover:text-red-400">Reveal Encrypted Content</button>
               </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] p-6 border border-zinc-800 rounded-sm">
             <h3 className="font-headline text-lg font-bold text-white mb-4">Application Statement</h3>
             <p className="text-zinc-400 text-sm leading-relaxed font-mono">
              "I am applying for Velvet verification to unlock the Premier tier benefits. As a full-time digital artist and creative director based in London, my work focuses on high-fidelity visual storytelling. I intend to use the platform for exclusive behind-the-scenes content and direct art commissions. I have a clean track record across all major social platforms and maintain a professional presence."
             </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          <div className="bg-[#111] border border-zinc-800 rounded-sm p-6 sticky top-28">
             <h3 className="font-headline text-xl font-bold mb-6 text-white uppercase tracking-widest">Decision</h3>
             
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-3 block">Starting Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center justify-center py-3 border border-zinc-800 rounded-sm hover:border-red-500 transition-colors">
                      <span className="text-sm font-bold text-white">Lv1</span>
                    </button>
                    <button className="flex flex-col items-center justify-center py-3 border border-red-600 bg-red-600/10 rounded-sm transition-colors">
                      <span className="text-sm font-bold text-red-500">Lv2</span>
                    </button>
                    <button className="flex flex-col items-center justify-center py-3 border border-zinc-800 rounded-sm hover:border-red-500 transition-colors">
                      <span className="text-sm font-bold text-white">Lv3</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-3 block">Internal Review Notes</label>
                  <textarea className="w-full bg-black border border-zinc-800 rounded-sm text-sm p-3 focus:outline-none focus:border-red-600 text-zinc-300 min-h-[100px]" placeholder="Reason for approval or rejection..."></textarea>
                </div>

                <div className="space-y-3 pt-2">
                  <button className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20">
                     Approve Creator
                  </button>
                  <button className="w-full py-3 bg-transparent border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs rounded-sm hover:text-red-500 hover:border-red-500 transition-colors">
                     Reject Application
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
