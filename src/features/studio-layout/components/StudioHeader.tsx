"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { studioQuickLinks } from "./navigation";

export function StudioHeader() {
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-40 bg-[#0e0e10]/80 backdrop-blur-xl border-b border-[#262528]">
      <div className="flex items-center gap-8">
        <nav className="flex gap-6 font-headline text-sm tracking-wide">
          {studioQuickLinks.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors duration-300 ${
                  isActive ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative flex items-center hidden sm:flex">
          <span className="material-symbols-outlined absolute left-3 text-zinc-500 text-sm">search</span>
          <Input 
            className="bg-[#131315] border-none text-sm h-9 rounded-sm pl-9 pr-4 w-64 focus-visible:ring-1 focus-visible:ring-[#ff8e80] text-[#f9f5f8]" 
            placeholder="Search gallery..." 
            type="text"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button type="button" className="text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-[#262528] cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-full object-cover" 
              alt="Creator Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPLORxV10a8CWKHniMkQ4NtLpGKDMudvqQVSNHukvXyMIKfJQ31LLOrDrlR8vusZfZ7JH-WRJDn84tkCBQdObMwwSCvD7uy4WkAfeMeDMHRlKJiKm8t1kQNeqIPKQL1wetKh_DGrgpBMP1nT1g1KYatf1rin3YgoB3iK0eF1DdinxQ0Vyznhv-19EAXzg2U2NSlMysq7zsUPDcmXUsLc8mFd4wqICn3pNWDmHZsj2mDxYkIxbYgvNHrU12HXuqCgasXwThs54G-pxx"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
