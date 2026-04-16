import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function RelatedVideosSidebar() {
  return (
    <aside className="xl:w-1/3 space-y-8">
      {/* Sidebar Balance Indicator */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-[#48474a]/10 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#fdc003]/10 flex items-center justify-center border border-[#fdc003]/20">
            <span className="material-symbols-outlined text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Aura Balance</p>
            <p className="text-xl font-headline font-black text-[#f9f5f8]">120 <span className="text-[#fdc003]">AC</span></p>
          </div>
        </div>
        <Button className="bg-[#ff8e80] hover:bg-[#ff7668] text-[#4f0002] px-5 py-5 rounded font-black text-xs tracking-widest uppercase transition-all shadow-lg shadow-[#ff8e80]/20">
          Top Up
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
        <Badge className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase cursor-pointer">
          All
        </Badge>
        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase cursor-pointer transition-colors">
          Recent
        </Badge>
        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase cursor-pointer transition-colors">
          Futurism
        </Badge>
      </div>

      {/* Video List */}
      <div className="space-y-6">
        {/* Video 1 */}
        <div className="flex gap-4 group cursor-pointer">
          <div className="relative w-44 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-[#48474a]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Ks0NTdahN0A45X2L_NZOaWOxWIaQOynNMveJB1NDJ1Xk_ZWViDZQzf_9An0rU0ygE79LARv9yMGgRPHnHTp4FnQE2kkwarFRleksjeoBAbwipTKcYQKqjok8ryU1__4hbndZfkho3WS_4KIZNvnzuLU8baXgfDMHB8ah6_GeEN4tPROalk6-jjldUFoj-RcbQQDkP1xLulFCnhPZpz6Z60xg3JBmJpYZ84kNJOcCuKIzARNizqQovyiaGLmAiLCm7HC_TyE_X90d" 
              alt="Related video cover" 
            />
            <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-white font-black px-1.5 py-0.5 rounded uppercase">12:45</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-sm font-bold text-[#f9f5f8] line-clamp-2 group-hover:text-[#ff8e80] transition-colors leading-snug">
              Hyper-Growth: The Vertical Forests of Singapore 2.0
            </h4>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">EcoVisual Studio</p>
            <p className="text-[11px] text-zinc-600 font-bold">850K views • 1 month ago</p>
          </div>
        </div>

        {/* Video 2 */}
        <div className="flex gap-4 group cursor-pointer">
          <div className="relative w-44 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-[#48474a]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPd76q4yaPE0ap2cBSxl3T5GURhq-CGzEK6F2snZx8pblVwyYCHBytNDxFbqqdZskj-es_KWOea3Sf5JDYufIGmBjmZmL5zdrsbhk_4FyZORg7Sdpl6bqxNpBhORr1O6D1bo_Siw1tqhCet_IXAh-pZZIGNgvKjuUHGRysGZQgNoXPZHHe4YmEcjpPTjsxX6om_nsQnLxLyiVWsZ1FKTZG58hSKVuibmzGVoQePFNmkQd9ymvjQOLFGys1pZiMo9FLzBa7pI9vbufX" 
              alt="Related video cover 2" 
            />
            <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-white font-black px-1.5 py-0.5 rounded uppercase">08:12</span>
            <div className="absolute top-2 left-2 bg-[#fdc003] text-black px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">Premium</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-sm font-bold text-[#f9f5f8] line-clamp-2 group-hover:text-[#ff8e80] transition-colors leading-snug">
              Neural Networks: Visualizing the Global Mind
            </h4>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">TechNova Films</p>
            <p className="text-[11px] text-zinc-600 font-bold">2.1M views • 2 weeks ago</p>
          </div>
        </div>

        {/* Ad/Sponsorship Spot */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 mt-12 p-8 flex flex-col justify-end shadow-2xl border border-[#48474a]/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            className="absolute inset-0 w-full h-full object-cover opacity-40" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKf6fKZeTjQQ_nWdEenofWE5plqePqDICum_Js1ouKCbH2rJTE3dKB6DGw7MWcHT36LPOTBI3q6WWLhzeIUuMq5iyZmacaAmc5YqV0e00Ry1Ar_b1jBCk1Cut86VrIT69MWmO_IoFocu8DzmqdACcUtZllLekMbI8jsgnXAWP6o-ZZaQVyI5nZsmL9PX7KzCOYoa77EI8ApDY2USgYwPK47ruMp2XnxyUDomBJaVNdLo2X4RtAMXu6znD2aykGHT8-8X45ZBVkpbwa" 
            alt="Ad background" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="relative z-10 space-y-5">
            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20 inline-block">
              Sponsored
            </span>
            <h3 className="text-3xl font-headline font-black text-white leading-tight tracking-tighter">
              Master the Gallery with Creator Pro.
            </h3>
            <p className="text-zinc-400 text-xs font-bold leading-relaxed">
              Unlock advanced cinematic tools and global distribution today.
            </p>
            <Button className="w-full bg-white text-black py-6 rounded font-black text-sm uppercase tracking-widest hover:bg-[#ff8e80] transition-all">
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
