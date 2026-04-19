"use client";

export function AdminHeader() {
  return (
    <header className="fixed top-0 right-0 left-64 bg-[#131315]/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 z-40 border-b border-[#262528]">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors">search</span>
          <input 
            className="bg-[#000] border border-zinc-800 focus:border-red-600 focus:ring-0 rounded-sm text-sm pl-10 pr-4 py-2.5 w-96 font-mono text-zinc-300 placeholder:text-zinc-600 transition-colors outline-none" 
            placeholder="Search by UID, email, or video hash..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-zinc-400">
          <button className="hover:bg-[#1f1f22] p-2 rounded transition-colors relative">
            <span className="material-symbols-outlined">notifications_active</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-[#262528]">
          <div className="text-right">
            <p className="text-xs font-bold font-headline text-white">SYS_ADMIN</p>
            <p className="text-[10px] text-red-500 font-mono tracking-widest">LEVEL 5</p>
          </div>
          <div className="h-10 w-10 rounded overflow-hidden border border-red-900/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Admin" className="w-full h-full object-cover grayscale opacity-80 mix-blend-screen" src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200" />
          </div>
        </div>
      </div>
    </header>
  );
}
