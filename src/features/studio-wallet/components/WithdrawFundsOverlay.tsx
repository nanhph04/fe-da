import { useState } from "react";

export function WithdrawFundsOverlay({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState<number>(0);
  const conversionRate = 100; // 1 AC = 100 VND

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#131315] w-full max-w-lg rounded-xl border border-[#262528] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262528] flex justify-between items-center bg-[#19191c]">
          <h3 className="text-xl font-headline font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff8e80]">account_balance</span>
            Withdraw Funds
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Withdraw Amount (AC)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              </div>
              <input 
                type="number" 
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#19191c] border-2 border-zinc-800 focus:border-[#ff8e80] focus:ring-0 rounded-lg py-4 pl-12 pr-4 text-3xl font-extrabold font-headline text-white transition-all outline-none"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-zinc-500">Available: <strong className="text-[#fdc003]">850,200 AC</strong></span>
              <button 
                onClick={() => setAmount(850200)}
                className="text-[10px] font-bold text-[#ff8e80] uppercase hover:underline"
              >
                Max
              </button>
            </div>
          </div>

          {/* Conversion Details */}
          <div className="bg-[#19191c] p-4 rounded-lg border border-[#262528] space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Conversion Rate</span>
              <span className="font-bold text-white">1 AC = {conversionRate.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Platform Fee (0%)</span>
              <span className="font-bold text-white">0 VND</span>
            </div>
            <div className="border-t border-[#262528] pt-3 flex justify-between items-center">
              <span className="text-xs font-bold text-[#ff8e80] uppercase tracking-widest">You will receive</span>
              <span className="text-2xl font-extrabold text-white font-headline">{(amount * conversionRate).toLocaleString()} VND</span>
            </div>
          </div>

          {/* Destination Account */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Destination Account</label>
             <div className="p-4 bg-[#19191c] rounded-lg border border-zinc-800 flex justify-between items-center cursor-pointer hover:border-[#ff8e80] transition-colors">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-[#ff8e80]">account_balance</span>
                 <div>
                   <p className="text-sm font-bold text-white">Techcombank</p>
                   <p className="text-[10px] text-zinc-500">**** **** 8829</p>
                 </div>
               </div>
               <span className="material-symbols-outlined text-zinc-500 text-sm">chevron_right</span>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-[#262528] bg-[#19191c] flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button 
            disabled={amount <= 0 || amount > 850200}
            onClick={() => { alert("Withdrawal requested"); onClose(); }}
            className="flex-[2] py-3 bg-[#ff8e80] hover:bg-[#ff7668] text-black font-bold text-sm rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-headline"
          >
            Confirm Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}
