"use client";

import Link from "next/link";
import { useState } from "react";

export function ContentReviewQueueFeature() {
  const [reports] = useState([
    { id: "REP-001", targetId: "VID-099", title: "Dangerous Act", reporter: "Auto-Mod System", reason: "NSFW/Violent Content Detected", confidence: "94%", date: "2 mins ago", thumb: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=300" },
    { id: "REP-002", targetId: "VID-102", title: "Copycat Movie", reporter: "3 Users", reason: "Copyright Infringement", confidence: "N/A", date: "1 hour ago", thumb: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=300" },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10 border-b border-[#262528] pb-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-white uppercase">Content Review</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-[16px]">warning</span> Action Required: 2 Pending
          </p>
        </div>
      </div>

      <div className="bg-[#111] border border-red-900/30 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a0000] border-b border-red-900/40 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                <th className="px-6 py-4">Flagged Media</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Auto-Mod Confidence</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262528]">
              {reports.map(rep => (
                <tr key={rep.id} className="hover:bg-[#19191c] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rep.thumb} alt="Thumb" className="w-24 h-14 object-cover rounded-sm border border-zinc-800" />
                      <div>
                        <p className="text-sm font-bold text-white font-headline">{rep.title}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{rep.targetId} • {rep.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-300">{rep.reporter}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                      {rep.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded-sm border ${
                      rep.confidence !== 'N/A' ? 'bg-red-600/20 text-red-500 border-red-600/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {rep.confidence}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/content/${rep.targetId}`}>
                      <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-sm text-xs font-bold transition-all uppercase tracking-widest">
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
