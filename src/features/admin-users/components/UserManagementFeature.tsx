"use client";

import { useState } from "react";

export function UserManagementFeature() {
  const [users] = useState([
    { id: "USR-001", name: "Julian Vane", email: "julian.v@velvet.art", role: "Creator", membership: "Gold", status: "Active", joinDate: "Oct 12, 2023", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" },
    { id: "USR-002", name: "Elena Rossi", email: "elena@gallery.com", role: "Viewer", membership: "Silver", status: "Flagged", joinDate: "Nov 03, 2023", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
    { id: "USR-003", name: "Markus Wright", email: "m.wright@staff.velvet", role: "Staff", membership: "Standard", status: "Active", joinDate: "Jan 15, 2024", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10 border-b border-[#262528] pb-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white uppercase">User Management</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2">Oversee audience growth and community health.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#1f1f22] text-white px-4 py-2 rounded-sm font-mono text-xs hover:bg-[#2c2c2f] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">filter_list</span> Filters
          </button>
          <button className="bg-red-600 text-white px-6 py-2 rounded-sm font-headline font-bold hover:bg-red-500 transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Invite
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-[#262528] rounded-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#0a0a0a] border-b border-[#262528] flex justify-between items-center">
          <h2 className="font-headline font-bold text-lg">User Directory</h2>
          <div className="flex gap-4">
             <select className="bg-black border border-zinc-800 text-zinc-300 rounded-sm text-xs py-1.5 px-3 focus:border-red-600 outline-none">
                <option>All Roles</option>
                <option>Creator</option>
                <option>Viewer</option>
             </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-[#262528] bg-[#000]">
                <th className="px-6 py-4 font-semibold">User Profile</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Membership</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Join Date</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262528]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[#19191c] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm overflow-hidden border border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white font-headline">{user.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-sm uppercase tracking-widest font-bold ${
                      user.role === 'Creator' ? 'bg-red-500/10 text-red-500' :
                      user.role === 'Staff' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${
                       user.membership === 'Gold' ? 'text-[#fdc003]' :
                       user.membership === 'Silver' ? 'text-zinc-400' : 'text-zinc-600'
                     }`}>
                       {user.membership}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 ${
                      user.status === 'Active' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {user.status === 'Flagged' && <span className="material-symbols-outlined text-[14px]">flag</span>}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[10px] text-zinc-500">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-[#2c2c2f] rounded text-zinc-400 hover:text-white" title="View Profile">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button className="p-1 hover:bg-red-500/20 rounded text-red-500" title="Ban User">
                        <span className="material-symbols-outlined text-[18px]">block</span>
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
