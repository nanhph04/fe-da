"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function ContentModerationDetailFeature() {
  const params = useParams();
  const id = params.id as string;

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/review" className="flex h-10 w-10 items-center justify-center rounded border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Back to moderation queue">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </Link>
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Moderation Detail</p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">{id}</h1>
          </div>
        </div>
        <span className="w-fit rounded-sm border border-primary/30 bg-primary/10 px-3 py-1 font-label text-xs font-bold uppercase tracking-widest text-primary">Flagged</span>
      </header>

      <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 font-body text-sm text-secondary">
        Media service contract hien co moderation queue summary/list; detail moderation/action endpoint chua co trong tai lieu nen man nay van dung mock theo video id.
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-sm border border-border/30 bg-background p-4 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(229,9,20,0.25),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.9),rgba(14,14,16,1))]" />
            <span className="material-symbols-outlined relative z-10 text-6xl text-primary opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            <div className="absolute bottom-4 left-4 right-4 rounded-sm border border-primary/30 bg-background/80 p-3 backdrop-blur-md">
              <div className="flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest text-primary">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Auto-Mod Timestamp Flag: 02:45 - 03:10
              </div>
            </div>
          </div>

          <article className="rounded-lg border border-border/30 bg-card p-6">
            <h2 className="mb-2 font-headline text-lg font-bold text-foreground">Dangerous Act</h2>
            <p className="mb-4 font-mono text-sm leading-relaxed text-muted-foreground">Metadata desc: Visual demonstration of extreme stunts without safety gear.</p>
            <div className="grid grid-cols-1 gap-4 border-t border-border/30 pt-4 md:grid-cols-3">
              {[
                ["Uploader", "@stunt_guy99"],
                ["Upload Date", "2026-04-16"],
                ["Current Status", "FLAGGED"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className={`mt-1 font-mono text-sm ${value === "FLAGGED" ? "text-primary" : "text-foreground"}`}>{value}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="sticky top-28 rounded-lg border border-primary/30 bg-primary/10 p-6">
            <h2 className="mb-6 font-headline text-xl font-bold uppercase tracking-widest text-primary">Review Judgement</h2>
            <div className="space-y-6">
              <p className="border-l-2 border-primary pl-3 font-mono text-xs text-primary">Auto-Mod Confidence: 94%<br />Reason: Harmful or dangerous acts.</p>
              <div>
                <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mod Notes</label>
                <textarea className="min-h-[120px] w-full rounded-sm border border-primary/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary" placeholder="Record reason for intervention..." />
              </div>
              <div className="space-y-3 pt-2">
                <button className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
                  <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                  Takedown Media
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-sm border border-primary/40 bg-transparent py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10">
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  Issue Strike
                </button>
                <button className="w-full rounded-sm border border-border/40 bg-transparent py-3 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-border hover:text-foreground">
                  Dismiss Report
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
