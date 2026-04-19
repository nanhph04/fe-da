"use client";

import Link from "next/link";
import { useState } from "react";

export function ContentLibraryFeature() {
  const [content] = useState([
    { id: "VID-001", title: "The Ethereal Horizon", uploader: "@stellar_cinema", privacy: "Public", views: "1.2M", status: "Active", date: "Oct 12, 2023", thumb: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=300" },
    { id: "VID-002", title: "Neon Nights in Neo-Tokyo", uploader: "@neon_chronicles", privacy: "Subscribers", views: "450K", status: "Active", date: "Oct 11, 2023", thumb: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300" },
    { id: "VID-003", title: "Unboxing the Future", uploader: "@dailyslate", privacy: "Public", views: "12K", status: "Restricted", date: "Oct 10, 2023", thumb: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300" },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10 border-b border-[#262528] pb-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white uppercase">Content Library</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2">Global Media Registry Overview</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#1f1f22] text-white px-4 py-2 rounded-sm font-mono text-xs hover:bg-[#2c2c2f] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">filter_list</span> Filters
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-[#262528] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#262528] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="px-6 py-4">Video Asset</th>
                <th className="px-6 py-4">Uploader</th>
                <th className="px-6 py-4">Privacy</th>
                <th className="px-6 py-4">Metrics</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262528]">
              {content.map(vid => (
                <tr key={vid.id} className="hover:bg-[#19191c] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={vid.thumb} alt="Thumb" className="w-24 h-14 object-cover rounded-sm border border-zinc-800" />
                      <div>
                        <p className="text-sm font-bold text-white font-headline truncate max-w-[200px]">{vid.title}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{vid.id} • {vid.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-300">{vid.uploader}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#fdc003] border border-[#fdc003]/30 px-2 py-0.5 rounded-sm">
                      {vid.privacy}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-white">
                    <span className="material-symbols-outlined text-[14px] text-zinc-500 mr-1">visibility</span>{vid.views}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                      vid.status === 'Active' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {vid.status === 'Active' ? 'check_circle' : 'gavel'}
                      </span>
                      {vid.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/content/${vid.id}`}>
                      <button className="p-2 hover:bg-[#2c2c2f] rounded text-zinc-400 hover:text-white" title="View Detail">
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
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
