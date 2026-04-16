import Link from 'next/link';

export function StudioSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r-0 bg-[#0a0a0a] shadow-2xl shadow-black z-50 flex flex-col hidden md:flex">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter text-[#ff1a1a] uppercase font-headline">Aura Studio</h1>
        <p className="text-xs text-zinc-500 font-headline uppercase tracking-widest mt-1">Creator Hub</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link 
          href="/studio" 
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-[#ff8e80] font-bold bg-[#1f1f22]/80 border-r-2 border-[#ff8e80] transition-transform font-headline text-sm"
        >
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </Link>
        <Link 
          href="/studio/content" 
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-zinc-400 hover:text-zinc-100 hover:bg-[#19191c]/50 transition-colors duration-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">video_library</span>
          Content
        </Link>
        <Link 
          href="/studio/analytics" 
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-zinc-400 hover:text-zinc-100 hover:bg-[#19191c]/50 transition-colors duration-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">analytics</span>
          Analytics
        </Link>
        <Link 
          href="/studio/wallet" 
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-zinc-400 hover:text-zinc-100 hover:bg-[#19191c]/50 transition-colors duration-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">payments</span>
          Monetization
        </Link>
        <Link 
          href="/studio/memberships" 
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-zinc-400 hover:text-zinc-100 hover:bg-[#19191c]/50 transition-colors duration-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">stars</span>
          Memberships
        </Link>
        <Link 
          href="/studio/settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-zinc-400 hover:text-zinc-100 hover:bg-[#19191c]/50 transition-colors duration-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>
      </nav>

      <div className="px-6 py-6">
        <Link href="/studio/upload">
          <button className="w-full bg-[#ff8e80] hover:bg-[#ff7668] text-[#650003] py-3 rounded-sm font-headline font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#ff8e80]/20 uppercase text-xs tracking-widest">
            <span className="material-symbols-outlined">add_circle</span>
            Upload
          </button>
        </Link>
      </div>

      <div className="px-4 py-6 border-t border-[#19191c] space-y-1">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-zinc-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">person_outline</span>
          Exit Studio
        </Link>
        <Link 
          href="#" 
          className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-zinc-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">help</span>
          Help
        </Link>
      </div>
    </aside>
  );
}
