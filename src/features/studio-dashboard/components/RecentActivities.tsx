export function RecentActivities() {
  return (
    <div className="bg-[#19191c] rounded-sm p-8 flex flex-col h-full border border-[#262528]">
      <h2 className="text-xl font-headline font-bold text-[#f9f5f8] mb-6">Recent Activity</h2>
      
      <div className="space-y-6 flex-1">
        <div className="flex gap-4 items-start">
          <div className="w-2 h-2 mt-2 rounded-full bg-[#fdc003] shadow-[0_0_10px_rgba(253,192,3,0.5)]"></div>
          <div>
            <p className="text-sm font-medium text-[#f9f5f8]">New Milestone reached!</p>
            <p className="text-xs text-zinc-400 mt-1">You just hit 1M total views on &quot;Midnight Noir&quot;.</p>
            <span className="text-[10px] text-zinc-600 uppercase mt-2 block font-bold tracking-widest">2 HOURS AGO</span>
          </div>
        </div>
        
        <div className="flex gap-4 items-start opacity-70">
          <div className="w-2 h-2 mt-2 rounded-full bg-[#ff8e80] shadow-[0_0_10px_rgba(255,142,128,0.5)]"></div>
          <div>
            <p className="text-sm font-medium text-[#f9f5f8]">Payout Processed</p>
            <p className="text-xs text-zinc-400 mt-1">150,000 Coins converted and sent to bank.</p>
            <span className="text-[10px] text-zinc-600 uppercase mt-2 block font-bold tracking-widest">YESTERDAY</span>
          </div>
        </div>
        
        <div className="flex gap-4 items-start opacity-50">
          <div className="w-2 h-2 mt-2 rounded-full bg-zinc-500"></div>
          <div>
            <p className="text-sm font-medium text-[#f9f5f8]">System Update</p>
            <p className="text-xs text-zinc-400 mt-1">Creator Studio v4.2 is now live with enhanced 8K support.</p>
            <span className="text-[10px] text-zinc-600 uppercase mt-2 block font-bold tracking-widest">3 DAYS AGO</span>
          </div>
        </div>
      </div>
      
      <button className="w-full mt-8 text-xs font-bold text-[#ff8e80] hover:text-[#ff7668] transition-colors py-3 border-t border-[#262528] uppercase tracking-widest">
        View All Logs
      </button>
    </div>
  );
}
