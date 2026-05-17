export function WalletDashboard({ balance, frozenBalance, onWithdrawClick }: { balance: number, frozenBalance: number, onWithdrawClick: () => void }) {
  const vndEquivalent = balance * 100; // 1 AC = 100 VND
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Primary Balance Card */}
      <div className="lg:col-span-2 bg-card rounded-xl border border-[var(--color-border-700)] p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[var(--color-secondary-600)]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div>
           <div className="flex items-center gap-2 mb-4">
             <span className="material-symbols-outlined text-[var(--color-secondary-600)]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
             <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Available Balance</h2>
           </div>
           <div className="flex items-baseline gap-2 animate-in slide-in-from-bottom-2 duration-500">
             <h1 className="text-5xl md:text-6xl font-extrabold font-headline text-foreground">{balance.toLocaleString()}</h1>
             <span className="text-2xl font-bold text-muted-foreground">AC</span>
           </div>
           <p className="text-muted-foreground text-sm mt-2 font-medium">≈ {vndEquivalent.toLocaleString()} VND</p>
        </div>

        <div className="mt-12 flex gap-4 relative z-10">
          <button 
            onClick={onWithdrawClick}
            disabled={balance <= 0}
            className="px-8 py-3 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-black font-bold font-headline text-sm rounded-sm shadow-lg shadow-[var(--color-primary-600)]/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            Withdraw Funds
          </button>
          <button className="px-8 py-3 bg-transparent border border-zinc-700 hover:border-white text-foreground font-bold font-headline text-sm rounded-sm transition-all">
            Link Bank Account
          </button>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="space-y-6">
        <div className="bg-[var(--color-background-900)] p-6 rounded-xl border border-[var(--color-border-700)]">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-muted-foreground">pending_actions</span>
            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-bold uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">In Escrow / Pending</p>
          <p className="text-2xl font-extrabold font-headline text-foreground">{frozenBalance.toLocaleString()} <span className="text-sm text-muted-foreground">AC</span></p>
          <p className="text-[10px] text-muted-foreground mt-2">Locked for pending withdrawals</p>
        </div>

        <div className="bg-[var(--color-background-900)] p-6 rounded-xl border border-[var(--color-border-700)]">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-muted-foreground">history</span>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Lifetime Earnings</p>
          <p className="text-2xl font-extrabold font-headline text-[var(--color-primary-600)]">2,450,200 <span className="text-sm text-[var(--color-primary-600)]/60">AC</span></p>
        </div>
      </div>
    </div>
  );
}
