export function WalletDashboard({ balance, onWithdrawClick }: { balance: number, onWithdrawClick: () => void }) {
  const vndEquivalent = balance * 100; // 1 AC = 100 VND
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Primary Balance Card */}
      <div className="lg:col-span-2 bg-[#131315] rounded-xl border border-[#262528] p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#fdc003]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div>
           <div className="flex items-center gap-2 mb-4">
             <span className="material-symbols-outlined text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
             <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Available Balance</h2>
           </div>
           <div className="flex items-baseline gap-2 animate-in slide-in-from-bottom-2 duration-500">
             <h1 className="text-5xl md:text-6xl font-extrabold font-headline text-white">{balance.toLocaleString()}</h1>
             <span className="text-2xl font-bold text-zinc-500">AC</span>
           </div>
           <p className="text-zinc-500 text-sm mt-2 font-medium">≈ {vndEquivalent.toLocaleString()} VND</p>
        </div>

        <div className="mt-12 flex gap-4 relative z-10">
          <button 
            onClick={onWithdrawClick}
            disabled={balance <= 0}
            className="px-8 py-3 bg-[#ff8e80] hover:bg-[#ff7668] text-black font-bold font-headline text-sm rounded-sm shadow-lg shadow-[#ff8e80]/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            Withdraw Funds
          </button>
          <button className="px-8 py-3 bg-transparent border border-zinc-700 hover:border-white text-white font-bold font-headline text-sm rounded-sm transition-all">
            Link Bank Account
          </button>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="space-y-6">
        <div className="bg-[#19191c] p-6 rounded-xl border border-[#262528]">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-zinc-500">pending_actions</span>
            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-bold uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">In Escrow / Pending</p>
          <p className="text-2xl font-extrabold font-headline text-white">45,500 <span className="text-sm text-zinc-500">AC</span></p>
          <p className="text-[10px] text-zinc-500 mt-2">Clears in 3-5 business days</p>
        </div>

        <div className="bg-[#19191c] p-6 rounded-xl border border-[#262528]">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-zinc-500">history</span>
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Lifetime Earnings</p>
          <p className="text-2xl font-extrabold font-headline text-[#ff8e80]">2,450,200 <span className="text-sm text-[#ff8e80]/60">AC</span></p>
        </div>
      </div>
    </div>
  );
}
