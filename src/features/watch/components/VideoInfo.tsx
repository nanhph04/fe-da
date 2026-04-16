import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function VideoInfo() {
  return (
    <div className="mt-10 space-y-8">
      {/* Main Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-[#f9f5f8]">
            Neon Dreams: The Architecture of Neo-Tokyo 2099
          </h1>
          <div className="flex items-center gap-6 text-zinc-500 text-sm font-bold">
            <span>1.2M views</span>
            <span>•</span>
            <span>Oct 24, 2023</span>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-[10px] uppercase tracking-widest font-black rounded-md px-3 py-1 text-zinc-300">4K</Badge>
              <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-[10px] uppercase tracking-widest font-black rounded-md px-3 py-1 text-zinc-300">ATMOS</Badge>
            </div>
          </div>
        </div>
        
        {/* Unlock Button */}
        <Button 
          className="bg-[#ff8e80] hover:bg-[#ff7668] text-[#4f0002] px-8 py-6 rounded font-black text-sm tracking-widest uppercase transition-all transform active:scale-95 shadow-lg shadow-[#ff8e80]/20 flex-shrink-0"
        >
          Unlock for 50 AC
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between py-6 border-y border-[#48474a]/10">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors">thumb_up</span>
            <span className="text-sm font-bold group-hover:text-[#ff8e80] transition-colors">45K</span>
          </div>
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-red-500 transition-colors">thumb_down</span>
          </div>
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors">share</span>
            <span className="text-sm font-bold group-hover:text-[#ff8e80] transition-colors">Share</span>
          </div>
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors">bookmark</span>
            <span className="text-sm font-bold group-hover:text-[#ff8e80] transition-colors">Save</span>
          </div>
        </div>
        <span className="material-symbols-outlined text-zinc-400 hover:text-white cursor-pointer">more_horiz</span>
      </div>
    </div>
  );
}
