import Link from "next/link";

export function SideNav() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-zinc-950 flex-col pt-24 px-4 pb-8 hidden md:flex border-r border-[#48474a]/10">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-[#fdc003]/10 flex items-center justify-center border border-[#fdc003]/20">
            <span className="material-symbols-outlined text-[#fdc003] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          </div>
          <div>
            <div className="font-headline font-semibold text-sm text-[#f9f5f8]">Premium Member</div>
            <div className="text-xs text-[#ecb200] font-medium uppercase tracking-widest">Gold Status</div>
          </div>
        </div>
        <button className="w-full mt-4 bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-lg transition-all">
          Upgrade Plan
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        <Link href="/library" className="flex items-center gap-3 px-3 py-3 text-zinc-500 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined">video_library</span>
          <span className="font-headline font-semibold text-sm">Library</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-3 text-red-500 bg-zinc-900/80 rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-headline font-semibold text-sm">Purchased</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-3 text-zinc-500 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined">subscriptions</span>
          <span className="font-headline font-semibold text-sm">Subscriptions</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-3 text-zinc-500 hover:bg-zinc-800/50 hover:text-white rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-headline font-semibold text-sm">Wallet</span>
        </Link>
        
        <div className="pt-4 mt-4 border-t border-[#48474a]/10">
          <Link href="#" className="flex items-center gap-3 px-3 py-3 text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-[#48474a]/20 rounded-lg transition-all duration-200 group">
            <span className="material-symbols-outlined text-zinc-500 group-hover:text-[#ff8e80] transition-colors">sync_alt</span>
            <span className="font-headline font-semibold text-sm">Switch to Creator</span>
          </Link>
        </div>
      </nav>

      <div className="pt-8 border-t border-[#48474a]/10 space-y-1">
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-white transition-all">
          <span className="material-symbols-outlined text-xl">settings</span>
          <span className="font-headline font-semibold text-sm">Settings</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-white transition-all">
          <span className="material-symbols-outlined text-xl">help_outline</span>
          <span className="font-headline font-semibold text-sm">Help</span>
        </Link>
      </div>
    </aside>
  );
}
