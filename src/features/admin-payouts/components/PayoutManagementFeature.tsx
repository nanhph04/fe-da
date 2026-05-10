"use client";

import Link from "next/link";
import { useState } from "react";

const payoutSummary = [
  {
    label: "Pending Requests",
    value: "45",
    detail: "~ 18.5M VND equivalent",
    icon: "pending_actions",
    accent: "secondary",
  },
  {
    label: "Processed (30 Days)",
    value: "1,204",
    detail: "~ 1.2B VND equivalent",
    icon: "task_alt",
    accent: "success",
  },
  {
    label: "Fraud Flags",
    value: "12",
    detail: "Requires audit",
    icon: "report",
    accent: "danger",
  },
] as const;

function getStatusClass(status: string) {
  if (status === "Approved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "Pending") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  return "border-primary/30 bg-primary/10 text-primary";
}

function getSummaryAccent(accent: (typeof payoutSummary)[number]["accent"]) {
  if (accent === "secondary") {
    return "border-l-secondary text-secondary";
  }

  if (accent === "success") {
    return "border-l-emerald-500 text-emerald-400";
  }

  return "border-l-primary text-primary";
}

export function PayoutManagementFeature() {
  const [requests] = useState([
    { id: "PAY-9042", creator: "@kaelen_studio", amount: "12,500 AC", realWorld: "1,250,000 VND", date: "2026-04-16", method: "Bank Transfer", status: "Pending" },
    { id: "PAY-9043", creator: "@neon_chronicles", amount: "35,000 AC", realWorld: "3,500,000 VND", date: "2026-04-16", method: "PayPal", status: "Approved" },
    { id: "PAY-9044", creator: "@dailyslate", amount: "1,200 AC", realWorld: "120,000 VND", date: "2026-04-15", method: "Crypto Wallet", status: "Rejected" },
  ]);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-secondary">
            Finance Control
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            Payout Management
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Review Aura Coin withdrawals before funds leave the platform treasury.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/70"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            tune
          </span>
          Filters
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {payoutSummary.map((item) => (
          <article
            key={item.label}
            className={`relative overflow-hidden rounded-lg border border-border/30 border-l-4 bg-card p-6 ${getSummaryAccent(item.accent)}`}
          >
            <span className="material-symbols-outlined absolute right-4 top-4 text-6xl opacity-10" aria-hidden="true">
              {item.icon}
            </span>
            <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
            <h2 className="font-headline text-4xl font-black tabular-nums text-foreground">{item.value}</h2>
            <p className="mt-1 font-mono text-xs">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="flex items-center justify-between border-b border-border/30 bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              account_balance_wallet
            </span>
            <h2 className="font-headline text-lg font-bold text-foreground">Withdrawal Queue</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">3 visible requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {requests.map((request) => (
                <tr key={request.id} className="group transition-colors hover:bg-muted/40">
                  <td className="px-6 py-4 font-mono text-xs text-foreground">
                    {request.id}
                    <br />
                    <span className="text-[10px] text-muted-foreground">{request.date}</span>
                  </td>
                  <td className="px-6 py-4 font-headline text-sm font-bold text-foreground">{request.creator}</td>
                  <td className="px-6 py-4">
                    <p className="font-headline font-bold text-secondary">{request.amount}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{request.realWorld}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{request.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-sm border px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/payouts/${request.id}`}
                      className="inline-flex items-center justify-center rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:border-secondary hover:text-secondary"
                    >
                      {request.status === "Pending" ? "Review" : "Receipt"}
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
