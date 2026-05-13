"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { studioSidebarItems } from "./navigation";

export function StudioSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r-0 bg-[#0a0a0a] shadow-2xl shadow-black z-50 flex flex-col hidden md:flex">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter text-[#ff1a1a] uppercase font-headline">Velvet Gallery</h1>
        <p className="text-xs text-zinc-500 font-headline uppercase tracking-widest mt-1">Creator Studio</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {studioSidebarItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (!!item.matchStartsWith && pathname?.startsWith(item.path));
          const className = `flex items-center gap-3 px-4 py-3 rounded-sm transition-transform font-headline text-sm ${
            item.disabled
              ? "text-zinc-700 border border-dashed border-[#262528] cursor-not-allowed"
              : isActive
                ? "text-[#ff8e80] font-bold bg-[#1f1f22]/80 border-r-2 border-[#ff8e80]"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-[#19191c]/50 transition-colors duration-300"
          }`;

          const content = (
            <>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </>
          );

          if (item.disabled) {
            return (
              <div key={item.path} aria-disabled="true" className={className}>
                {content}
              </div>
            );
          }

          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6">
        <Link
          href="/studio/upload"
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#ff8e80] py-3 font-headline text-xs font-black uppercase tracking-widest text-[#650003] shadow-lg shadow-[#ff8e80]/20 transition-colors hover:bg-[#ff7668]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Upload
        </Link>
      </div>

      <div className="px-4 py-6 border-t border-[#19191c] space-y-1">
        <Link 
          href="/library" 
          className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-zinc-300 font-headline text-sm"
        >
          <span className="material-symbols-outlined">public</span>
          Back to Library
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
