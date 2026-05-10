"use client";

import Link from "next/link";
import { useState } from "react";

const reportsData = [
  { id: "REP-001", targetId: "VID-099", title: "Dangerous Act", reporter: "Auto-Mod System", reason: "NSFW / violent content", confidence: "94%", date: "2 mins ago", tone: "danger" },
  { id: "REP-002", targetId: "VID-102", title: "Copycat Movie", reporter: "3 Users", reason: "Copyright claim", confidence: "N/A", date: "1 hour ago", tone: "warning" },
];

export function ContentReviewQueueFeature() {
  const [reports] = useState(reportsData);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Moderation Queue</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Content Review</h1>
          <p className="mt-2 flex items-center gap-2 font-body text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">warning</span>
            {reports.length} pending flags require administrator review.
          </p>
        </div>
        <div className="rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-primary">
          Action Required
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Flagged Media</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {reports.map((report) => (
                <tr key={report.id} className="group transition-colors hover:bg-muted/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-24 overflow-hidden rounded-sm border border-border/30 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]" />
                      <div>
                        <p className="font-headline text-sm font-bold text-foreground">{report.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{report.targetId} • {report.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-foreground/80">{report.reporter}</td>
                  <td className="px-6 py-4">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">{report.reason}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <span className={`rounded-sm border px-2 py-0.5 ${report.confidence !== "N/A" ? "border-primary/30 bg-primary/10 text-primary" : "border-border/40 bg-muted text-muted-foreground"}`}>
                      {report.confidence}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/content/${report.targetId}`} className="inline-flex rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
                      Review
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
