"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function PayoutDetailFeature() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/payouts">
          <button className="p-2 hover:bg-[#19191c] rounded-full transition-colors flex items-center justify-center text-zinc-400 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </Link>
        <span className="font-headline text-2xl font-bold tracking-tight uppercase">Payout Detail: {id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-1 lg:col-span-8 space-y-6">
          <div className="bg-[#0a0a0a] p-6 border border-zinc-800 rounded-sm">
             <h3 className="font-headline text-lg font-bold text-white mb-6 uppercase tracking-widest border-b border-zinc-800 pb-4">Transaction Details</h3>
             
             <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Creator</p>
                  <p className="text-sm font-bold text-white mt-1">Kaelen Studio (@kaelen_studio)</p>
                  <p className="text-xs font-mono text-zinc-500 mt-1">Level 3 • Verified</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Amount Requested</p>
                  <p className="text-2xl font-headline font-black text-[#fdc003] mt-1">12,500 AC</p>
                  <p className="text-xs font-mono text-zinc-500 mt-1">Exchange Rate: 100 VND/AC</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Bank Details</p>
                  <div className="mt-2 space-y-1 font-mono text-xs">
                     <p className="text-white">Bank: VPBank (Vietnam Prosperity Joint-Stock Commercial Bank)</p>
                     <p className="text-zinc-400">Account: **** **** 1245</p>
                     <p className="text-zinc-400">Name: NGUYEN VAN A</p>
                     <p className="text-emerald-500 flex items-center gap-1 mt-2"><span className="material-symbols-outlined text-[14px]">verified</span> Account Verified</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Final Payout Amount (Fiat)</p>
                  <p className="text-2xl font-headline font-black text-emerald-500 mt-1">1,250,000 VND</p>
                </div>
             </div>
          </div>

          <div className="bg-[#0a0a0a] p-6 border border-zinc-800 rounded-sm">
             <h3 className="font-headline text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-zinc-800 pb-4">Risk & Fraud Analysis</h3>
             <ul className="space-y-3 font-mono text-xs">
               <li className="flex items-center justify-between">
                 <span className="text-zinc-400">Suspicious Activity Check</span>
                 <span className="text-emerald-500">Passed</span>
               </li>
               <li className="flex items-center justify-between">
                 <span className="text-zinc-400">Velocity Check (Last 7 days)</span>
                 <span className="text-emerald-500">Normal (0 payouts)</span>
               </li>
               <li className="flex items-center justify-between">
                 <span className="text-zinc-400">KYC Status</span>
                 <span className="text-emerald-500">Verified & Active</span>
               </li>
             </ul>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-[#111] border border-zinc-800 rounded-sm p-6 sticky top-28">
             <h3 className="font-headline text-xl font-bold mb-6 text-white uppercase tracking-widest">Action</h3>
             
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-3 block">Transaction Notes</label>
                  <textarea className="w-full bg-black border border-zinc-800 rounded-sm text-sm p-3 focus:outline-none focus:border-[#fdc003] text-zinc-300 min-h-[100px]" placeholder="Reference ID or admin notes..."></textarea>
                </div>

                <div className="space-y-3 pt-2">
                  <button className="w-full py-3 bg-[#fdc003] text-black font-black uppercase tracking-widest text-xs rounded-sm hover:bg-[#ffe380] transition-colors shadow-lg shadow-[#fdc003]/20 flex items-center justify-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">account_balance</span> Execute Transfer
                  </button>
                  <button className="w-full py-3 bg-transparent border border-red-900/40 text-red-500 font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-red-900/20 transition-colors">
                     Reject Payout
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
