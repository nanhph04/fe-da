"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", path: "/admin", icon: "dashboard" },
    { name: "User Management", path: "/admin/users", icon: "group" },
    { name: "Verification", path: "/admin/verifications", icon: "verified" },
    { name: "Content Review", path: "/admin/content", icon: "movie" },
    { name: "Payouts & Revenue", path: "/admin/payouts", icon: "payments" },
    { name: "Audit Logs", path: "/admin/audit", icon: "history" }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 border-r border-[#262528] bg-[#0e0e10] font-body text-sm font-medium w-64 z-50">
      <div className="px-6 mb-10">
        <span className="text-xl font-black font-headline text-white tracking-tight uppercase">V-Console</span>
        <p className="text-[10px] uppercase tracking-widest text-[#ff8e80] mt-1 font-bold">System Oversight</p>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded transition-all ease-in-out font-headline tracking-wide text-xs uppercase
                ${isActive 
                  ? "text-red-500 border-r-2 border-red-600 bg-gradient-to-r from-red-600/10 to-transparent font-bold" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-[#19191c]"}`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span>{item.name}</span>
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
        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-200 font-headline text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>Config</span>
        </Link>
        <Link href="/admin/login" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-red-500 font-headline text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Terminate</span>
        </Link>
      </footer>
    </aside>
  );
}
