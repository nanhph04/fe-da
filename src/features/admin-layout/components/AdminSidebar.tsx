"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { adminFooterItems, adminSidebarItems } from "./navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 border-r border-[#262528] bg-[#0e0e10] font-body text-sm font-medium w-64 z-50">
      <div className="px-6 mb-10">
        <span className="text-xl font-black font-headline text-white tracking-tight uppercase">Velvet Gallery</span>
        <p className="text-[10px] uppercase tracking-widest text-[#ff8e80] mt-1 font-bold">Admin Console</p>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 relative">
        {adminSidebarItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (!!item.matchStartsWith && pathname?.startsWith(item.path));
          const className = `flex items-center gap-3 px-3 py-3 rounded transition-all ease-in-out font-headline tracking-wide text-xs uppercase ${
            item.disabled
              ? "text-zinc-700 border border-dashed border-[#262528] cursor-not-allowed"
              : isActive
                ? "text-red-500 border-r-2 border-red-600 bg-gradient-to-r from-red-600/10 to-transparent font-bold"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-[#19191c]"
          }`;
          const content = (
            <>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
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

      <div className="px-6 py-4">
        <div className="bg-[#131315] p-4 rounded-lg border border-[#262528]">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-zinc-200 font-mono">100% HEALTHY</span>
          </div>
        </div>
      </div>

      <footer className="px-3 space-y-1 pt-4 border-t border-[#262528]">
        {adminFooterItems.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2 font-headline text-xs uppercase tracking-widest transition-all ${
              pathname === item.path
                ? "text-red-500 border-r-2 border-red-600 bg-gradient-to-r from-red-600/10 to-transparent font-bold"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-[#19191c]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-zinc-500 hover:text-red-500 font-headline text-xs uppercase tracking-widest cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Terminate</span>
        </button>
      </footer>
    </aside>
  );
}
