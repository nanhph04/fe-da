import { Input } from "@/components/ui/input";

export function AccountInfo() {
  return (
    <section>
      <h2 className="text-xl font-bold mb-6 font-headline flex items-center gap-3 text-[#f9f5f8]">
        <span className="w-1 h-6 bg-[#ff8e80] rounded-full"></span>
        Account Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
          <div className="relative group">
            <Input 
              className="w-full bg-black/50 border-[#48474a]/20 rounded-lg py-6 px-5 text-[#f9f5f8] shadow-inner focus-visible:ring-[#ff8e80]" 
              type="email" 
              defaultValue="alex.rivera@cinema.studio" 
              readOnly 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-600 group-hover:text-[#ff8e80] cursor-pointer text-xl">edit</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Phone Number</label>
          <div className="relative group">
            <Input 
              className="w-full bg-black/50 border-[#48474a]/20 rounded-lg py-6 px-5 text-[#f9f5f8] shadow-inner focus-visible:ring-[#ff8e80]" 
              type="text" 
              defaultValue="+1 (555) 902-4412" 
              readOnly 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-600 group-hover:text-[#ff8e80] cursor-pointer text-xl">edit</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Password Security</label>
          <div className="flex items-center justify-between w-full bg-black/50 border border-[#48474a]/20 rounded-lg py-4 px-5 shadow-inner">
            <span className="text-[#f9f5f8] tracking-[0.5em] font-black">••••••••••••</span>
            <button className="text-[#ff8e80] text-xs font-bold uppercase tracking-wider hover:underline">Change Password</button>
          </div>
        </div>
      </div>
    </section>
  );
}
