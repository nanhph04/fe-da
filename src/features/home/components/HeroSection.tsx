interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export function HeroSection({ title, subtitle, imageUrl }: HeroSectionProps) {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/60 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full pb-16 px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          {/* Tagline */}
          <p className="text-[#fbbf24] text-sm font-medium tracking-widest uppercase">
            Featured Premiere
          </p>
          
          {/* Title */}
          <h1 className="text-5xl font-bold font-headline text-white tracking-tight leading-tight">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-white/60 max-w-xl">
            {subtitle}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-sm hover:bg-[#f1f1f1] transition-colors">
              <span className="material-symbols-outlined">play_arrow</span>
              <span>Watch Now</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a]/80 border border-white/10 text-white rounded-sm hover:bg-[#262626] transition-colors">
              <span className="material-symbols-outlined">bookmark_add</span>
              <span>Add to Watchlist</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}