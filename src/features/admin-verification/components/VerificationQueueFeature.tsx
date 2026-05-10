"use client";

import Link from "next/link";
import { useState } from "react";

const requestData = [
  { id: "REQ-001", name: "Kaelen Thorne", type: "Cinematic Storytelling", date: "Oct 12, 2023", followers: "1.2M", status: "Pending" },
  { id: "REQ-002", name: "Aria Vane", type: "Elite Candidate", date: "Oct 12, 2023", followers: "845K", status: "Pending" },
  { id: "REQ-003", name: "Elias Thorne", type: "Adventure Philanthropy", date: "Oct 11, 2023", followers: "2.4M", status: "Pending" },
];

export function VerificationQueueFeature() {
  const [requests] = useState(requestData);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Creator Verification</p><h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Pending Requests</h1><p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">Evaluate creator authenticity and tier access requests.</p></div>
        <div className="flex items-center rounded-sm border border-border/30 bg-card p-1"><button className="rounded-sm bg-muted px-4 py-2 font-headline text-xs font-bold text-foreground">Active Queue</button><button className="px-4 py-2 font-headline text-xs font-bold text-muted-foreground transition-colors hover:text-foreground">Resolved</button></div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4"><Stat label="In Queue" value="128" tone="primary" /><Stat label="Avg. Review Time" value="4.2h" tone="secondary" /><article className="rounded-lg border border-primary/30 bg-primary/10 p-6 md:col-span-2"><p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-primary">Priority Applications</p><h2 className="font-headline text-4xl font-black text-foreground">14</h2><p className="mt-1 font-mono text-xs text-muted-foreground">Requires Level 5 moderator approval</p></article></div>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card"><div className="flex items-center justify-between border-b border-border/30 bg-background px-6 py-4"><div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">filter_list</span><span className="font-mono text-xs font-bold text-foreground/80">Sort by: Application Date (Newest)</span></div></div><div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><th className="px-6 py-4">Creator Name</th><th className="px-6 py-4">Application Date</th><th className="px-6 py-4 text-right">Followers</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-border/30">{requests.map((request) => <tr key={request.id} className="group transition-colors hover:bg-muted/40"><td className="px-6 py-4"><div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 bg-muted font-headline text-xs font-bold text-primary">{request.name.split(" ").map((p) => p[0]).join("")}</div><div><p className="font-headline font-bold text-foreground">{request.name}</p><p className="font-mono text-xs text-muted-foreground">{request.type}</p></div></div></td><td className="px-6 py-4 font-mono text-xs text-muted-foreground">{request.date}</td><td className="px-6 py-4 text-right font-headline font-bold text-foreground">{request.followers}</td><td className="px-6 py-4 text-center"><span className="rounded-sm border border-primary/20 bg-primary/10 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-primary">{request.status}</span></td><td className="px-6 py-4 text-right"><Link href={`/admin/verifications/${request.id}`} className="inline-flex rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary">Review</Link></td></tr>)}</tbody></table></div></div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "secondary" }) {
  return <article className={`rounded-lg border border-border/30 border-l-4 bg-card p-6 ${tone === "primary" ? "border-l-primary" : "border-l-secondary"}`}><p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p><h2 className="font-headline text-4xl font-black text-foreground">{value}</h2></article>;
}
