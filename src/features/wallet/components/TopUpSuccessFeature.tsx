"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TopUpSuccessFeature({ amount = 5000, referenceId = "TXN-9821-VLT" }: { amount?: number, referenceId?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] p-4 font-body text-[#f9f5f8] relative overflow-hidden">
      
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f59e0b]/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="bg-[#131313] border border-[#262626] rounded-2xl p-10 max-w-lg w-full text-center relative z-10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 fade-in duration-700">
        
        {/* Success Icon */}
        <div className="mx-auto w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-[#f59e0b]/30 mb-8 relative">
          <div className="absolute inset-0 rounded-full border border-[#f59e0b] animate-ping opacity-20"></div>
          <span className="material-symbols-outlined text-5xl text-[#f59e0b]">check_circle</span>
        </div>

        <h1 className="text-4xl font-black font-headline tracking-tighter mb-2">Payment Successful</h1>
        <p className="text-[#adaaaa] text-lg mb-8">Your Aura Coins have been credited to your wallet.</p>

        {/* Transaction Details */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 border border-[#262626] text-left">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#262626]">
            <span className="text-[#adaaaa]">Amount Credited</span>
            <span className="text-2xl font-bold text-[#f59e0b]">+{amount.toLocaleString()} AC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#adaaaa]">Reference ID</span>
            <span className="font-mono text-sm text-[#f9f5f8] bg-[#131313] px-2 py-1 rounded">{referenceId}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link href="/wallet" passHref>
            <Button className="w-full bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#be123c] hover:to-[#9f1239] text-white py-6 rounded-md font-bold text-lg shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all">
              Return to Wallet
            </Button>
          </Link>
          <Link href="/library" passHref>
            <Button variant="outline" className="w-full py-6 rounded-md font-bold border-[#262626] text-[#adaaaa] hover:text-white hover:bg-[#1a1a1a] bg-transparent transition-all">
              Browse Content
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
