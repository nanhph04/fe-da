'use client';

import { useState } from "react";
import { WithdrawalService } from "../services/withdrawalService";
import { colorSchemes } from "@/shared/utils/theme-utils";

export function WithdrawFundsOverlay({ balance, onClose, onSuccess }: { balance: number, onClose: () => void, onSuccess: (amount: number) => void }) {
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankCode, setBankCode] = useState("VCB");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const conversionRate = 100; // 1 AC = 100 VND

  const handleWithdraw = async () => {
    if (amount <= 0 || amount > balance) return;
    if (!accountNumber || !accountHolderName) {
      alert("Please enter your bank account details.");
      return;
    }

    setIsProcessing(true);
    
    try {
      await WithdrawalService.requestWithdrawal({
        coinAmount: amount,
        moneyAmount: amount * conversionRate,
        exchangeRate: conversionRate,
        bankInfo: {
          bankCode,
          bankName: bankCode, // Simplification for now, should map from code
          accountNumber,
          accountHolderName
        },
        description: `Withdrawal of ${amount} AC`
      });
      onSuccess(amount);
    } catch (error) {
      console.error("Failed to create withdrawal:", error);
      alert("Failed to process withdrawal. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${colorSchemes.card.bg} w-full max-w-lg rounded-xl ${colorSchemes.card.border} shadow-2xl overflow-hidden flex flex-col relative`}>
        {/* Processing State */}
        {isProcessing && (
           <div className="absolute inset-0 z-50 bg-[var(--color-background-950)]/90 backdrop-blur-md flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-[var(--color-primary-600)] border-t-transparent rounded-full animate-spin mb-6"></div>
             <h3 className="font-headline font-bold text-xl text-white">Processing Withdrawal</h3>
             <p className="text-sm text-zinc-400 mt-2 text-center max-w-xs">Connecting to secure payment gateway. Please do not close this window.</p>
           </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-700)] flex justify-between items-center bg-[var(--color-background-900)]">
          <h3 className="text-xl font-headline font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary-600)]">account_balance</span>
            Withdraw Funds
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className={`p-8 space-y-8 ${isProcessing ? 'opacity-30 pointer-events-none' : ''}`}>
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Withdraw Amount (AC)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[var(--color-secondary-600)]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              </div>
              <input 
                type="number" 
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[var(--color-background-900)] border-2 border-zinc-800 focus:border-[var(--color-primary-600)] focus:ring-0 rounded-lg py-4 pl-12 pr-4 text-3xl font-extrabold font-headline text-white transition-all outline-none"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-zinc-500">Available: <strong className="text-[var(--color-secondary-600)]">{balance.toLocaleString()} AC</strong></span>
              <button 
                onClick={() => setAmount(balance)}
                className="text-[10px] font-bold text-[var(--color-primary-600)] uppercase hover:underline"
              >
                Max
              </button>
            </div>
          </div>

          {/* Conversion Details */}
          <div className="bg-[var(--color-background-900)] p-4 rounded-lg border border-[var(--color-border-700)] space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Conversion Rate</span>
              <span className="font-bold text-white">1 AC = {conversionRate.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Platform Fee (0%)</span>
              <span className="font-bold text-white">0 VND</span>
            </div>
            <div className="border-t border-[var(--color-border-700)] pt-3 flex justify-between items-center">
              <span className="text-xs font-bold text-[var(--color-primary-600)] uppercase tracking-widest">You will receive</span>
              <span className="text-2xl font-extrabold text-white font-headline">{(amount * conversionRate).toLocaleString()} VND</span>
            </div>
          </div>

          {/* Destination Account */}
          <div className="space-y-4">
             <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Destination Account</label>
             <div className="space-y-3">
               <select 
                 value={bankCode} 
                 onChange={(e) => setBankCode(e.target.value)}
                 className="w-full bg-[var(--color-background-900)] border border-zinc-800 rounded-lg p-3 text-sm text-white outline-none focus:border-[var(--color-primary-600)]"
               >
                 <option value="VCB">Vietcombank</option>
                 <option value="TCB">Techcombank</option>
                 <option value="MB">MB Bank</option>
                 <option value="ACB">ACB</option>
               </select>
               <input 
                 type="text" 
                 placeholder="Account Number"
                 value={accountNumber}
                 onChange={(e) => setAccountNumber(e.target.value)}
                 className="w-full bg-[var(--color-background-900)] border border-zinc-800 rounded-lg p-3 text-sm text-white outline-none focus:border-[var(--color-primary-600)]"
               />
               <input 
                 type="text" 
                 placeholder="Account Holder Name (e.g. NGUYEN VAN A)"
                 value={accountHolderName}
                 onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())}
                 className="w-full bg-[var(--color-background-900)] border border-zinc-800 rounded-lg p-3 text-sm text-white outline-none focus:border-[var(--color-primary-600)]"
               />
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-[var(--color-border-700)] bg-[var(--color-background-900)] flex gap-4">
          <button onClick={onClose} disabled={isProcessing} className="flex-1 py-3 text-sm font-bold text-zinc-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
          <button 
            disabled={amount <= 0 || amount > balance || isProcessing}
            onClick={handleWithdraw}
            className="flex-[2] py-3 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-black font-bold text-sm rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-headline"
          >
            Confirm Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}
