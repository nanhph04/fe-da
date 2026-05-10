"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminSettingsFeature() {
  const [platformFee, setPlatformFee] = useState("15");
  const [minWithdrawal, setMinWithdrawal] = useState("5000");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Global Configuration</p><h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">System Settings</h1><p className="mt-2 font-body text-sm text-muted-foreground">Manage platform-wide configuration and operational parameters.</p></div>
        <Button className="rounded-sm bg-primary px-8 py-3 font-headline font-bold text-primary-foreground transition-opacity hover:opacity-90">Save Changes</Button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-lg border border-border/30 bg-card p-8"><h2 className="mb-6 flex items-center gap-2 font-headline text-xl font-bold text-foreground"><span className="material-symbols-outlined text-secondary">payments</span> Financial Parameters</h2><div className="space-y-6"><Field label="Platform Fee (%)" value={platformFee} onChange={setPlatformFee} suffix="%" /><Field label="Minimum Withdrawal (AC)" value={minWithdrawal} onChange={setMinWithdrawal} suffix="AC" tone="secondary" /></div></section>
          <section className="rounded-lg border border-border/30 bg-card p-8"><h2 className="mb-6 flex items-center gap-2 font-headline text-xl font-bold text-foreground"><span className="material-symbols-outlined text-primary">settings_applications</span> Operational Mode</h2><div className="flex items-center justify-between rounded-lg border border-border/30 bg-background p-4"><div><h3 className="font-headline font-bold text-foreground">Maintenance Mode</h3><p className="font-body text-sm text-muted-foreground">Disable access for all non-admin users.</p></div><button type="button" aria-pressed={maintenanceMode} onClick={() => setMaintenanceMode(!maintenanceMode)} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${maintenanceMode ? "bg-primary" : "bg-muted"}`}><span className={`inline-block h-5 w-5 transform rounded-full bg-foreground transition-transform ${maintenanceMode ? "translate-x-8" : "translate-x-1"}`} /></button></div></section>
        </div>
        <aside className="space-y-6"><div className="rounded-lg border border-border/30 bg-card p-6"><h2 className="mb-4 font-label text-sm font-bold uppercase tracking-wider text-foreground">System Status</h2><ul className="space-y-4">{["Identity Service", "Media Service", "Payment Gateway"].map((service) => <li key={service} className="flex items-center justify-between"><span className="font-body text-muted-foreground">{service}</span><span className="rounded bg-emerald-500/10 px-2 py-1 font-label text-xs font-bold text-emerald-400">ONLINE</span></li>)}</ul></div><div className="rounded-lg border border-border/30 bg-muted p-6 text-center"><span className="material-symbols-outlined mb-2 text-4xl text-secondary">security</span><h3 className="font-headline font-bold text-foreground">Security Audit</h3><p className="mb-4 mt-2 font-body text-sm text-muted-foreground">Last audit performed 2 days ago. No critical vulnerabilities found.</p><Button variant="outline" className="w-full border-border/40 bg-transparent text-muted-foreground hover:text-foreground">View Report</Button></div></aside>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, suffix, tone = "default" }: { label: string; value: string; onChange: (value: string) => void; suffix: string; tone?: "default" | "secondary" }) {
  return <div><label className="mb-2 block font-label text-sm font-bold uppercase tracking-wider text-muted-foreground">{label}</label><div className="relative"><Input type="number" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border-border/30 bg-input px-4 py-6 text-lg font-bold text-foreground focus-visible:ring-primary" /><span className={`absolute right-4 top-1/2 -translate-y-1/2 font-bold ${tone === "secondary" ? "text-secondary" : "text-muted-foreground"}`}>{suffix}</span></div></div>;
}
