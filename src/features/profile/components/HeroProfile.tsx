import { Button } from "@/components/ui/button";

export function HeroProfile() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-zinc-900/50 p-8 md:p-12 border border-[#48474a]/10">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#ff8e80]/10 to-transparent"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8">
        
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-2xl ring-4 ring-[#19191c]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzD5KXgB48481weQ_mh_xVK6YxdSUyUr41Rtd_T-pK13v6ILN5q4EbDa4PUuPUQ6nChumvNhTOpfzewKIr2c7iJUA6ASkM2bBJyGLqvJA8foHIE1zb8h_OUzqUIqfm6eYHngiQTEHhgGjQWjLBLwqQNCZuai36J7tXTDNTxWhBqq4Vdk4B0wAbaQL-WOww1GtVqwortiHGa31PNylFaVlXITpZOnseqJLZjSrsDj9yaOwf929YQJfu_CEd3WkqM6kcCLfUKjEEhCIn" 
              alt="Profile" 
            />
          </div>
          <button className="absolute -bottom-2 -right-2 bg-[#ff8e80] p-2 rounded-lg text-black shadow-lg hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        <div className="flex-grow text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-headline text-[#f9f5f8]">Alex Rivera</h1>
            <span className="inline-flex items-center px-3 py-1 bg-[#fdc003]/10 border border-[#fdc003]/20 text-[#fdc003] text-[10px] uppercase font-black tracking-[0.2em] rounded">
              Gold Member
            </span>
          </div>
          
          <p className="text-zinc-500 font-medium mb-6">Member since October 2023</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="bg-[#19191c] px-6 py-3 rounded-lg border-l-4 border-[#fdc003] shadow-lg">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Aura Balance</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                <span className="text-2xl font-black text-[#f9f5f8] font-headline">
                  1,250 <span className="text-sm font-medium text-[#fdc003]">AC</span>
                </span>
              </div>
            </div>
            
            <Button className="h-full px-8 py-5 bg-[#ff8e80] hover:bg-[#ff7668] text-[#650003] rounded font-black text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0px_10px_30px_rgba(255,142,128,0.3)]">
              Top Up Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
