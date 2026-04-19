"use client";

import Link from "next/link";
import { useState } from "react";

export function VerificationQueueFeature() {
  const [requests] = useState([
    { id: "REQ-001", name: "Kaelen Thorne", type: "Cinematic Storytelling", date: "Oct 12, 2023", followers: "1.2M", status: "Pending", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" },
    { id: "REQ-002", name: "Aria Vane", type: "Elite Candidate", date: "Oct 12, 2023", followers: "845K", status: "Pending", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" },
    { id: "REQ-003", name: "Elias Thorne", type: "Adventure Philanthropy", date: "Oct 11, 2023", followers: "2.4M", status: "Pending", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-[#262528] pb-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white uppercase">Pending Requests</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2 max-w-2xl">Ensuring the integrity of the ecosystem. Evaluate creator authenticity.</p>
        </div>
        <div className="flex items-center bg-[#111] p-1 border border-zinc-800 rounded-sm">
          <button className="px-4 py-2 bg-[#2c2c2f] text-xs font-bold text-white rounded-sm">Active Queue</button>
          <button className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors">Resolved</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111] p-6 border-l-4 border-red-600 border-r border-[#262528] border-y rounded-sm">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">In Queue</p>
          <h4 className="font-headline text-4xl font-black text-white">128</h4>
        </div>
        <div className="bg-[#111] p-6 border-l-4 border-[#fdc003] border-r border-[#262528] border-y rounded-sm">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">Avg. Review Time</p>
          <h4 className="font-headline text-4xl font-black text-white">4.2h</h4>
        </div>
        <div className="col-span-2 bg-gradient-to-br from-[#1a0000] to-[#111] border border-red-900/30 p-6 rounded-sm flex justify-between items-center">
           <div>
             <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold mb-2">Priority Applications</p>
             <h4 className="font-headline text-4xl font-black text-white">14</h4>
             <p className="text-zinc-500 text-xs mt-1 font-mono">Requires Level 5 moderator approval</p>
           </div>
           <span className="material-symbols-outlined text-red-500/20 text-6xl">admin_panel_settings</span>
        </div>
      </div>

      <div className="bg-[#111] border border-[#262528] rounded-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-[#0a0a0a] border-b border-[#262528]">
          <div className="flex items-center space-x-4">
            <span className="material-symbols-outlined text-red-500">filter_list</span>
            <span className="font-mono font-bold text-xs text-zinc-300">Sort by: Application Date (Newest)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#000] text-[10px] uppercase tracking-widest font-bold text-zinc-500 border-b border-[#262528]">
                <th className="px-6 py-4">Creator Name</th>
                <th className="px-6 py-4">Application Date</th>
                <th className="px-6 py-4 text-right">Followers</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262528]">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-[#19191c] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-sm overflow-hidden border border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={req.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-headline font-bold text-white">{req.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{req.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">{req.date}</td>
                  <td className="px-6 py-4 text-right font-headline font-bold text-white">{req.followers}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-red-600/10 text-red-500 border border-red-600/20 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/verifications/${req.id}`}>
                      <button className="bg-[#1f1f22] border border-zinc-700 hover:border-red-500 hover:text-red-500 px-4 py-2 rounded-sm text-xs font-bold transition-all uppercase tracking-widest text-zinc-300">
                        Review
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
