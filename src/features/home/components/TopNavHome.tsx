import type { ReactNode } from "react";

interface TopNavHomeProps {
  children: ReactNode;
}

export function TopNavHome({ children }: TopNavHomeProps) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0e0e0e]/70 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center">
              <span className="material-symbols-outlined text-black text-xl">play_arrow</span>
            </div>
            <span className="text-xl font-bold font-headline tracking-widest text-white">VELVET</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 bg-[#1a1a1a] border border-white/10 rounded-sm px-4 pl-10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30">search</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[#1a1a1a] hover:bg-[#262626] text-white/70 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">category</span>
              <span className="text-sm">Categories</span>
            </button>
            <button className="p-2 rounded-sm hover:bg-[#1a1a1a] text-white/70 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">bookmark</span>
            </button>
            <button className="w-8 h-8 rounded-sm bg-[#1a1a1a] flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">account_circle</span>
            </button>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}