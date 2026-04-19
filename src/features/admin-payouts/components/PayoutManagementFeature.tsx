"use client";

import Link from "next/link";
import { useState } from "react";

export function PayoutManagementFeature() {
  const [requests] = useState([
    { id: "PAY-9042", creator: "@kaelen_studio", amount: "12,500 AC", realWorld: "1,250,000 VND", date: "2026-04-16", method: "Bank Transfer", status: "Pending" },
    { id: "PAY-9043", creator: "@neon_chronicles", amount: "35,000 AC", realWorld: "3,500,000 VND", date: "2026-04-16", method: "PayPal", status: "Approved" },
    { id: "PAY-9044", creator: "@dailyslate", amount: "1,200 AC", realWorld: "120,000 VND", date: "2026-04-15", method: "Crypto Wallet", status: "Rejected" },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10 border-b border-[#262528] pb-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white uppercase">Payout Management</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2">Manage Aura Coin to real-world currency transitions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111] p-6 border-l-4 border-[#fdc003] border-y border-r border-[#262528] rounded-sm">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">Pending Requests</p>
          <h4 className="font-headline text-3xl font-black text-white">45</h4>
          <p className="text-[#fdc003] text-xs font-mono mt-1">~ 18.5M VND Equiv.</p>
        </div>
        <div className="bg-[#111] p-6 border-l-4 border-emerald-500 border-y border-r border-[#262528] rounded-sm">
           <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">Processed (30 Days)</p>
           <h4 className="font-headline text-3xl font-black text-white">1,204</h4>
           <p className="text-emerald-500 text-xs font-mono mt-1">~ 1.2B VND Equiv.</p>
        </div>
        <div className="bg-[#111] p-6 border-l-4 border-red-500 border-y border-r border-[#262528] rounded-sm">
           <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">Fraud Flags</p>
           <h4 className="font-headline text-3xl font-black text-white">12</h4>
           <p className="text-red-500 text-xs font-mono mt-1">Requires audit</p>
        </div>
      </div>

      <div className="bg-[#111] border border-[#262528] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#262528] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262528]">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-[#19191c] transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-300">{req.id}<br/><span className="text-[10px] text-zinc-600">{req.date}</span></td>
                  <td className="px-6 py-4 font-bold text-white">{req.creator}</td>
                  <td className="px-6 py-4">
                    <p className="font-headline font-bold text-[#fdc003]">{req.amount}</p>
                    <p className="font-mono text-[10px] text-zinc-500">{req.realWorld}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{req.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest rounded-sm ${
                      req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                      req.status === 'Pending' ? 'bg-[#fdc003]/10 text-[#fdc003] border-[#fdc003]/30' :
                      'bg-red-500/10 text-red-500 border-red-500/30'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/payouts/${req.id}`}>
                      <button className="bg-[#1f1f22] border border-zinc-700 hover:border-[#fdc003] hover:text-[#fdc003] px-4 py-2 rounded-sm text-xs font-bold transition-all uppercase tracking-widest text-zinc-300">
                        {req.status === 'Pending' ? 'Review' : 'Receipt'}
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
