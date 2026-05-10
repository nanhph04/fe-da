"use client";

import Link from "next/link";
import { useState } from "react";

const contentData = [
  { id: "VID-001", title: "The Ethereal Horizon", uploader: "@stellar_cinema", privacy: "Public", views: "1.2M", status: "Active", date: "Oct 12, 2023", level: "LV3" },
  { id: "VID-002", title: "Neon Nights in Neo-Tokyo", uploader: "@neon_chronicles", privacy: "Subscribers", views: "450K", status: "Active", date: "Oct 11, 2023", level: "LV2" },
  { id: "VID-003", title: "Unboxing the Future", uploader: "@dailyslate", privacy: "Public", views: "12K", status: "Restricted", date: "Oct 10, 2023", level: "LV1" },
];

export function ContentLibraryFeature() {
  const [content] = useState(contentData);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Global Registry</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Content Library</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Audit public, premium, and restricted media across the platform.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/70">
          <span className="material-symbols-outlined text-base">filter_list</span>
          Filters
        </button>
      </header>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Video Asset</th>
                <th className="px-6 py-4">Uploader</th>
                <th className="px-6 py-4">Privacy</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {content.map((video) => (
                <tr key={video.id} className="group transition-colors hover:bg-muted/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-24 rounded-sm border border-border/30 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]" />
                      <div>
                        <p className="max-w-[240px] truncate font-headline text-sm font-bold text-foreground">{video.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{video.id} • {video.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-foreground/80">{video.uploader}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-sm border border-secondary/30 px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">{video.privacy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-sm border border-border/30 bg-muted px-2 py-0.5 font-label text-[10px] font-bold text-foreground">{video.level}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest ${video.status === "Active" ? "text-emerald-400" : "text-primary"}`}>
                      <span className="material-symbols-outlined text-[14px]">{video.status === "Active" ? "check_circle" : "gavel"}</span>
                      {video.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/content/${video.id}`} className="inline-flex rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`View ${video.title}`}>
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
