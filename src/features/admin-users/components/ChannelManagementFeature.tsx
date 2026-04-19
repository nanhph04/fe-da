"use client";

import { useState } from "react";

export function ChannelManagementFeature() {
  const [channels] = useState([
    { id: "CHN-001", name: "Neon Chronicles", handle: "@neon_chronicles", level: 3, subs: "1.2M", rev: "124,500 AC", status: "Verified", avatar: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=150" },
    { id: "CHN-002", name: "Velvet Vlogs", handle: "@velvet_vlogs", level: 2, subs: "450K", rev: "42,800 AC", status: "Pending", avatar: "https://images.unsplash.com/photo-1518020311130-9b6348398ff0?auto=format&fit=crop&q=80&w=150" },
    { id: "CHN-003", name: "The Daily Slate", handle: "@dailyslate", level: 1, subs: "12K", rev: "1,200 AC", status: "Suspended", avatar: "https://images.unsplash.com/photo-1457449940276-e8e6f51fa731?auto=format&fit=crop&q=80&w=150" },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10 border-b border-[#262528] pb-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white uppercase">Channel Management</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2">Oversee creator ecosystems and verification tiers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="bg-[#111] p-6 border border-[#262528] rounded-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">tv</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Channels</p>
          <h3 className="text-3xl font-headline font-black text-white">1,482</h3>
        </div>
        <div className="bg-[#111] p-6 border border-[#262528] rounded-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span className="material-symbols-outlined text-6xl">verified</span>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Verified Creators</p>
           <h3 className="text-3xl font-headline font-black text-white">840</h3>
        </div>
      </div>

      <div className="bg-[#111] border border-[#262528] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#262528] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Subscribers</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262528]">
              {channels.map(channel => (
                <tr key={channel.id} className="hover:bg-[#19191c] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={channel.avatar} alt="Avatar" className="w-10 h-10 rounded-sm object-cover border border-zinc-800" />
                      <div>
                        <p className="text-sm font-bold text-white font-headline">{channel.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{channel.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-extrabold rounded-sm uppercase tracking-wider border ${
                       channel.level === 3 ? 'bg-[#fdc003]/10 text-[#fdc003] border-[#fdc003]/20' :
                       channel.level === 2 ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      LV {channel.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-300">{channel.subs}</td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-white">
                    {channel.rev.split(" ")[0]} <span className="text-[10px] text-[#fdc003]">AC</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                       channel.status === 'Verified' ? 'text-emerald-500' :
                       channel.status === 'Pending' ? 'text-[#fdc003]' : 'text-red-500'
                     }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {channel.status === 'Verified' ? 'verified' : channel.status === 'Pending' ? 'pending' : 'block'}
                        </span>
                        {channel.status}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-[#2c2c2f] rounded text-zinc-400 hover:text-white" title="Manage Tiers">
                           <span className="material-symbols-outlined text-[18px]">layers</span>
                        </button>
                        <button className="p-1 hover:bg-[#2c2c2f] rounded text-zinc-400 hover:text-white" title="Actions">
                           <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                     </div>
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
