"use client";

export function AdminOverviewFeature() {
  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-[#262528] pb-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white uppercase">Command Center</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2">GLOBAL NETWORK OVERSIGHT • AURA CINEMATIC</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-red-600/10 border border-red-600/30 text-red-500 px-4 py-2 rounded-sm font-mono text-xs hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">sync</span> Force Sync
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat Card 1 */}
        <div className="bg-[#111] p-6 border border-[#262528] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">groups</span>
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Network Users</p>
          <h3 className="text-4xl font-headline font-black text-white">1.24M</h3>
          <div className="mt-4 flex items-center gap-1 text-emerald-500 text-[10px] font-mono">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            <span>+12.4% / 30 DAYS</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-[#111] p-6 border border-[#262528] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">movie_edit</span>
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Active Creators</p>
          <h3 className="text-4xl font-headline font-black text-[#ff8e80]">42.8K</h3>
          <div className="mt-4 flex items-center gap-1 text-[#ff8e80] text-[10px] font-mono">
            <span>UPLOADING CONTINUOUSLY</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-[#1a0000] p-6 border-l-4 border-red-600 border-r border-t border-b border-[#262528] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
             <span className="material-symbols-outlined text-6xl text-red-500">warning</span>
           </div>
           <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Active Alerts / Reports</p>
           <h3 className="text-4xl font-headline font-black text-red-500">156</h3>
           <div className="mt-4 flex items-center gap-1 text-red-400 text-[10px] font-mono">
             <span className="material-symbols-outlined text-[14px]">error</span>
             <span>REQUIRES MODERATION</span>
           </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-[#111] p-6 border border-[#262528] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
           </div>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Payouts Pending (AC)</p>
           <h3 className="text-4xl font-headline font-black text-[#fdc003]">2.4M</h3>
           <div className="mt-4 flex items-center gap-1 text-zinc-500 text-[10px] font-mono">
             <span>~ 240,000,000 VND</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Logs */}
        <div className="bg-[#0a0a0a] border border-zinc-900 rounded-sm overflow-hidden">
          <div className="bg-[#111] px-4 py-3 border-b border-zinc-900 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Real-time Activity Log</h3>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
          <div className="p-4 space-y-2 font-mono text-[10px] text-zinc-500 max-h-[300px] overflow-y-auto">
            <div className="flex gap-4 hover:bg-[#111] px-2 py-1"><span className="text-zinc-600">14:22:01</span><span className="text-emerald-400">[AUTH]</span> User @alex88 authenticated successfully</div>
            <div className="flex gap-4 hover:bg-[#111] px-2 py-1"><span className="text-zinc-600">14:21:45</span><span className="text-red-400">[WARN]</span> Video ID #98F2 flagged by Auto-Mod</div>
            <div className="flex gap-4 hover:bg-[#111] px-2 py-1"><span className="text-zinc-600">14:21:12</span><span className="text-blue-400">[PAYOUT]</span> AC transfer initiated: 15,000 AC -{'>'} Wallet #0xa2</div>
            <div className="flex gap-4 hover:bg-[#111] px-2 py-1"><span className="text-zinc-600">14:20:55</span><span className="text-emerald-400">[UPLOAD]</span> Transcoding finished: The Ethereal Horizon</div>
            <div className="flex gap-4 hover:bg-[#111] px-2 py-1"><span className="text-zinc-600">14:20:10</span><span className="text-amber-400">[SYS]</span> DB Connection pool spiked at 85%</div>
            <div className="flex gap-4 hover:bg-[#111] px-2 py-1"><span className="text-zinc-600">14:19:44</span><span className="text-emerald-400">[AUTH]</span> Admin SYS_ADMIN logged in</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#111] border border-[#262528] p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono mb-4">Priority Actions</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#0a0a0a] border border-[#262528] p-4 hover:border-red-500 group cursor-pointer transition-colors">
               <span className="material-symbols-outlined text-red-500 mb-2">gavel</span>
               <p className="text-sm font-bold text-white uppercase tracking-widest font-headline">Review Queue</p>
               <p className="text-[10px] text-zinc-500 mt-1">156 Items Pending</p>
             </div>
             <div className="bg-[#0a0a0a] border border-[#262528] p-4 hover:border-[#fdc003] group cursor-pointer transition-colors">
               <span className="material-symbols-outlined text-[#fdc003] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
               <p className="text-sm font-bold text-white uppercase tracking-widest font-headline">Approve Payouts</p>
               <p className="text-[10px] text-zinc-500 mt-1">12 Requests</p>
             </div>
             <div className="bg-[#0a0a0a] border border-[#262528] p-4 hover:border-blue-500 group cursor-pointer transition-colors">
               <span className="material-symbols-outlined text-blue-500 mb-2">verified</span>
               <p className="text-sm font-bold text-white uppercase tracking-widest font-headline">Verifications</p>
               <p className="text-[10px] text-zinc-500 mt-1">45 Apps to Review</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
