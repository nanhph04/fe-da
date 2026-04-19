"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function ContentModerationDetailFeature() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/content/review">
          <button className="p-2 hover:bg-[#19191c] rounded-full transition-colors flex items-center justify-center text-zinc-400 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </Link>
        <span className="font-headline text-2xl font-bold tracking-tight uppercase">Moderation Detail: {id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-1 lg:col-span-8 space-y-6">
          {/* Video Player Placeholder */}
          <div className="aspect-video bg-black rounded-sm border border-zinc-800 relative flex flex-col items-center justify-center text-center p-4 overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1200" alt="Video" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="material-symbols-outlined text-red-500 text-6xl opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#111]/80 backdrop-blur-md p-3 border border-red-900/40 rounded-sm">
               <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[16px]">warning</span> Auto-Mod Timestamp Flag: 02:45 - 03:10
               </div>
            </div>
          </div>

          <div className="bg-[#111] p-6 border border-zinc-800 rounded-sm">
             <h3 className="font-headline text-lg font-bold text-white mb-2">Dangerous Act</h3>
             <p className="text-zinc-500 font-mono text-sm leading-relaxed mb-4">
              Metadata desc: Visual demonstration of extreme stunts without safety gear.
             </p>
             <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
                <div>
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Uploader</p>
                   <p className="text-sm font-mono text-white mt-1">@stunt_guy99</p>
                </div>
                <div>
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Upload Date</p>
                   <p className="text-sm font-mono text-white mt-1">2026-04-16</p>
                </div>
                <div>
                   <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Current Status</p>
                   <p className="text-sm font-mono text-red-500 mt-1 uppercase tracking-widest">Flagged</p>
                </div>
             </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-[#1a0000] border border-red-900/40 rounded-sm p-6 sticky top-28">
             <h3 className="font-headline text-xl font-bold mb-6 text-red-500 uppercase tracking-widest">Review Judgement</h3>
             
             <div className="space-y-6">
                <div>
                   <p className="text-xs text-red-400 font-mono mb-4 border-l-2 border-red-500 pl-3">
                     Auto-Mod Confidence: 94%<br/>
                     Reason: Harmful or dangerous acts.
                   </p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-3 block">Mod Notes</label>
                  <textarea className="w-full bg-black border border-red-900/40 rounded-sm text-sm p-3 focus:outline-none focus:border-red-600 text-zinc-300 min-h-[100px]" placeholder="Record reason for intervention..."></textarea>
                </div>

                <div className="space-y-3 pt-2">
                  <button className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">delete_forever</span> Takedown Media
                  </button>
                  <button className="w-full py-3 bg-transparent border border-red-900/40 text-red-400 font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">gavel</span> Issue Strike to Channel
                  </button>
                  <button className="w-full py-3 mt-4 bg-transparent border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs rounded-sm hover:text-white hover:border-zinc-500 transition-colors">
                     Dismiss Report (Safe)
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
