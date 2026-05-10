"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const riskChecks = [
  { label: "Suspicious Activity Check", value: "Passed", status: "passed" },
  { label: "Velocity Check (Last 7 days)", value: "Normal (0 payouts)", status: "passed" },
  { label: "KYC Status", value: "Verified & Active", status: "passed" },
];

export function PayoutDetailFeature() {
  const params = useParams();
  const id = params.id as string;

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/payouts"
            className="flex h-10 w-10 items-center justify-center rounded border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to payout queue"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
          </Link>
          <div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
              Payout Request
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
              {id}
            </h1>
          </div>
        </div>
        <span className="w-fit rounded-sm border border-secondary/30 bg-secondary/10 px-3 py-1 font-label text-xs font-bold uppercase tracking-widest text-secondary">
          Pending Review
        </span>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <article className="rounded-lg border border-border/30 bg-card p-6">
            <h2 className="mb-6 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
              Transaction Details
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Creator</p>
                <p className="mt-1 font-headline text-sm font-bold text-foreground">Kaelen Studio (@kaelen_studio)</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">Level 3 • Verified</p>
              </div>

              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Amount Requested
                </p>
                <p className="mt-1 font-headline text-3xl font-black text-secondary">12,500 AC</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">Exchange Rate: 100 VND/AC</p>
              </div>

              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Bank Details
                </p>
                <div className="mt-3 space-y-1 rounded-sm border border-border/30 bg-background p-4 font-mono text-xs">
                  <p className="text-foreground">Bank: VPBank</p>
                  <p className="text-muted-foreground">Account: **** **** 1245</p>
                  <p className="text-muted-foreground">Name: NGUYEN VAN A</p>
                  <p className="mt-3 flex items-center gap-1 text-emerald-400">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      verified
                    </span>
                    Account Verified
                  </p>
                </div>
              </div>

              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Final Payout Amount
                </p>
                <p className="mt-1 font-headline text-3xl font-black text-emerald-400">1,250,000 VND</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">Before external transfer fees</p>
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-border/30 bg-card p-6">
            <h2 className="mb-4 border-b border-border/30 pb-4 font-headline text-lg font-bold uppercase tracking-widest text-foreground">
              Risk & Fraud Analysis
            </h2>
            <ul className="space-y-3 font-mono text-xs">
              {riskChecks.map((check) => (
                <li key={check.label} className="flex items-center justify-between gap-4 rounded-sm bg-background px-4 py-3">
                  <span className="text-muted-foreground">{check.label}</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      check_circle
                    </span>
                    {check.value}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="sticky top-24 rounded-lg border border-border/30 bg-card p-6">
            <h2 className="mb-6 font-headline text-xl font-bold uppercase tracking-widest text-foreground">Action</h2>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Transaction Notes
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-sm border border-border/30 bg-background p-3 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary"
                  placeholder="Reference ID or admin notes..."
                />
              </div>

              <div className="space-y-3 pt-2">
                <button className="flex w-full items-center justify-center gap-2 rounded-sm bg-secondary py-3 font-headline text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-secondary/20 transition-opacity hover:opacity-90">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    account_balance
                  </span>
                  Execute Transfer
                </button>
                <button className="w-full rounded-sm border border-primary/40 bg-transparent py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10">
                  Reject Payout
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
