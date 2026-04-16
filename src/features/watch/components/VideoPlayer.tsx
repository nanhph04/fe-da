import { Button } from "@/components/ui/button";

export function VideoPlayer() {
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl group border border-[#48474a]/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        className="w-full h-full object-cover" 
        data-alt="stunning cinematic shot of a futuristic cyberpunk city at night" 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTMw8WnHNBL1QHGB5ys3QkWzQDKyLnHeZPy3NnmdfL1nWseei6leGWEHvbWp89oay_zGAci1madI4wTgU2pZmIBPjY_xFmb4eh8oFwxtGz9oRLmhumVj6CJOJYdwK5rFCFknZU05AZoSzwy51JPsjVdmobbTLBCkDWoAmeXfnjGFtOKmDETp9T3_lGSCMlqdNPOXQgyC2bGjUQy6LsPQvCBk2Mbhg8tZZZ6615DIXCTd3FoLJ_wyXzWdc6CquhLOBOlVKLf3gD3r6M"
        alt="Video Cover"
      />
      
      {/* Player Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
        <div className="w-full h-1 bg-zinc-800 rounded-full mb-6 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-[45%] bg-[#ff8e80]"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="material-symbols-outlined text-white cursor-pointer text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            <span className="material-symbols-outlined text-white cursor-pointer">skip_next</span>
            <span className="material-symbols-outlined text-white cursor-pointer">volume_up</span>
            <span className="text-sm font-bold text-white/80">14:22 / 32:05</span>
          </div>
          
          <div className="flex items-center gap-8">
            <span className="material-symbols-outlined text-white cursor-pointer">settings</span>
            <span className="material-symbols-outlined text-white cursor-pointer">fullscreen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
