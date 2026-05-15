"use client";

import { useState } from "react";

const channelData = [
  { id: "CHN-001", name: "Neon Chronicles", handle: "@neon_chronicles", level: 3, subs: "1.2M", rev: "124,500 AC", status: "Verified" },
  { id: "CHN-002", name: "Velvet Vlogs", handle: "@velvet_vlogs", level: 2, subs: "450K", rev: "42,800 AC", status: "Pending" },
  { id: "CHN-003", name: "The Daily Slate", handle: "@dailyslate", level: 1, subs: "12K", rev: "1,200 AC", status: "Suspended" },
];

export function ChannelManagementFeature() {
  const [channels] = useState(channelData);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-border/30 pb-8">
        <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Creator Control</p>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Channel Management</h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">Oversee creator ecosystems and verification tiers.</p>
      </header>

      <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 font-body text-sm text-secondary">
        Media service đã có API summary cho admin dashboard; channel directory vẫn giữ dữ liệu mẫu cho đến khi có contract list/manage channels thật.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard label="Total Channels" value="1,482" icon="tv" />
        <SummaryCard label="Verified Creators" value="840" icon="verified" tone="secondary" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><th className="px-6 py-4">Channel</th><th className="px-6 py-4">Level</th><th className="px-6 py-4">Subscribers</th><th className="px-6 py-4">Total Revenue</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-border/30">
              {channels.map((channel) => (
                <tr key={channel.id} className="group transition-colors hover:bg-muted/40">
                  <td className="px-6 py-4"><div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 bg-muted font-headline text-xs font-bold text-primary">{channel.name.slice(0, 2).toUpperCase()}</div><div><p className="font-headline text-sm font-bold text-foreground">{channel.name}</p><p className="font-mono text-[10px] text-muted-foreground">{channel.handle}</p></div></div></td>
                  <td className="px-6 py-4"><span className={`rounded-sm border px-2 py-1 font-label text-[10px] font-extrabold uppercase tracking-wider ${channel.level === 3 ? "border-secondary/20 bg-secondary/10 text-secondary" : channel.level === 2 ? "border-border/30 bg-muted text-foreground" : "border-primary/20 bg-primary/10 text-primary"}`}>LV {channel.level}</span></td>
                  <td className="px-6 py-4 font-mono text-sm text-foreground/80">{channel.subs}</td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-foreground">{channel.rev}</td>
                  <td className="px-6 py-4"><span className={`flex items-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-widest ${channel.status === "Verified" ? "text-emerald-400" : channel.status === "Pending" ? "text-secondary" : "text-primary"}`}><span className="material-symbols-outlined text-[14px]">{channel.status === "Verified" ? "verified" : channel.status === "Pending" ? "pending" : "block"}</span>{channel.status}</span></td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100"><button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><span className="material-symbols-outlined text-[18px]">layers</span></button><button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><span className="material-symbols-outlined text-[18px]">more_vert</span></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, icon, tone = "default" }: { label: string; value: string; icon: string; tone?: "default" | "secondary" }) {
  return <article className="group relative overflow-hidden rounded-lg border border-border/30 bg-card p-6"><span className="material-symbols-outlined absolute right-4 top-4 text-6xl opacity-10 transition-opacity group-hover:opacity-20">{icon}</span><p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p><h2 className={`font-headline text-4xl font-black ${tone === "secondary" ? "text-secondary" : "text-foreground"}`}>{value}</h2></article>;
}
