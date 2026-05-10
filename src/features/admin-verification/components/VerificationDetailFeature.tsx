"use client";

import Link from "next/link";

export function VerificationDetailFeature() {
  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-border/30 pb-8">
        <Link href="/admin/verifications" className="flex h-10 w-10 items-center justify-center rounded border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Back to verification queue"><span className="material-symbols-outlined">arrow_back</span></Link>
        <div><p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Application Review</p><h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">Kaelen Thorne</h1><p className="mt-1 font-mono text-sm text-muted-foreground">@kaelen_studio • Applied 2 days ago</p></div>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="space-y-8 md:col-span-8">
          <article className="rounded-lg border border-border/30 bg-card p-6"><h2 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold text-foreground"><span className="material-symbols-outlined text-primary">badge</span> Verification Documents</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><DocumentCard label="ID Card - Front" /><DocumentCard label="Facial Match Selfie" /></div></article>
          <article className="rounded-lg border border-border/30 bg-card p-6"><h2 className="mb-4 font-headline text-lg font-bold text-foreground">Application Statement</h2><p className="font-mono text-sm leading-relaxed text-muted-foreground">“I am applying for Velvet verification to unlock Premier tier benefits. My work focuses on high-fidelity visual storytelling and exclusive behind-the-scenes content.”</p></article>
        </div>
        <aside className="space-y-6 md:col-span-4"><div className="sticky top-28 rounded-lg border border-border/30 bg-card p-6"><h2 className="mb-6 font-headline text-xl font-bold uppercase tracking-widest text-foreground">Decision</h2><div className="space-y-6"><div><label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Starting Level</label><div className="grid grid-cols-3 gap-2"><button className="rounded-sm border border-border/30 py-3 font-headline text-sm font-bold text-foreground transition-colors hover:border-primary">Lv1</button><button className="rounded-sm border border-primary bg-primary/10 py-3 font-headline text-sm font-bold text-primary">Lv2</button><button className="rounded-sm border border-border/30 py-3 font-headline text-sm font-bold text-foreground transition-colors hover:border-primary">Lv3</button></div></div><div><label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Internal Review Notes</label><textarea className="min-h-[120px] w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary" placeholder="Reason for approval or rejection..." /></div><div className="space-y-3 pt-2"><button className="w-full rounded-sm bg-primary py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">Approve Creator</button><button className="w-full rounded-sm border border-border/40 bg-transparent py-3 font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary">Reject Application</button></div></div></div></aside>
      </div>
    </section>
  );
}

function DocumentCard({ label }: { label: string }) {
  return <button className="group flex aspect-video flex-col items-center justify-center rounded-sm border border-border/30 bg-background p-4 text-center transition-colors hover:border-primary"><span className="material-symbols-outlined mb-2 text-3xl text-muted-foreground group-hover:text-primary">visibility_off</span><p className="font-mono text-xs text-muted-foreground">{label}</p><span className="mt-2 font-label text-[10px] font-bold uppercase text-primary">Reveal encrypted content</span></button>;
}
