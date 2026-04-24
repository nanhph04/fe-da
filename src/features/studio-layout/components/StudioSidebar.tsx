"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/features/auth/context/AuthContext";

export function StudioSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/studio", icon: "dashboard" },
    { name: "Content", path: "/studio/content", icon: "video_library" },
    { name: "Analytics", path: "/studio/analytics", icon: "analytics" },
    { name: "Monetization", path: "/studio/wallet", icon: "payments" },
    { name: "Memberships", path: "/studio/memberships", icon: "stars" },
    { name: "Settings", path: "/studio/settings", icon: "settings" }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r-0 bg-[#0a0a0a] shadow-2xl shadow-black z-50 flex flex-col hidden md:flex">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter text-[#ff1a1a] uppercase font-headline">Aura Studio</h1>
        <p className="text-xs text-zinc-500 font-headline uppercase tracking-widest mt-1">Creator Hub</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/studio' && pathname?.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-transform font-headline text-sm
                ${isActive 
                  ? "text-[#ff8e80] font-bold bg-[#1f1f22]/80 border-r-2 border-[#ff8e80]" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-[#19191c]/50 transition-colors duration-300"}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
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
          <span className="material-symbols-outlined">public</span>
          Back to Discover
        </Link>
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-2 text-red-500/70 hover:text-red-500 font-headline text-sm cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
