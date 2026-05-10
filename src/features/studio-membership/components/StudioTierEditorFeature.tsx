"use client";

import Link from "next/link";
import { useState } from "react";

const defaultPerks = ["Early access screenings", "Members-only comment badge", "Monthly creator note"];

export function StudioTierEditorFeature() {
  const [name, setName] = useState("Velvet Room");
  const [price, setPrice] = useState(5000);
  const [accessLogic, setAccessLogic] = useState("Pay-per-view + subscribers");
  const [perks, setPerks] = useState(defaultPerks);

  return (
    <main className="mx-auto w-full max-w-6xl p-8 pb-20 animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Membership Tier</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Tier Editor</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Configure price, access language, and premium perks before publishing your membership tier.
          </p>
        </div>
        <Link
          href="/studio/memberships"
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/70"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
          Back to Memberships
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-lg border border-secondary/20 bg-secondary/10 p-8">
          <p className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">Live Preview</p>
          <div className="mt-6 rounded-lg border border-border/30 bg-card p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-sm bg-primary/15 px-3 py-1 font-label text-xs font-bold uppercase tracking-widest text-primary">
                LV 3
              </span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-foreground">{name}</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">{accessLogic}</p>
            <div className="mt-8 border-t border-border/30 pt-6">
              <p className="font-headline text-4xl font-black text-secondary">{price.toLocaleString()} AC</p>
              <p className="font-body text-xs text-muted-foreground">per month</p>
            </div>
            <ul className="mt-6 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 font-body text-sm text-foreground">
                  <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="rounded-lg border border-border/30 bg-card p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Tier Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-border/40 bg-input px-4 py-3 font-headline font-bold text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly Price</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">monetization_on</span>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(event) => setPrice(Number(event.target.value))}
                  className="w-full rounded-md border border-border/40 bg-input py-3 pl-12 pr-4 font-headline font-bold text-foreground outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Access Logic</label>
            <select
              value={accessLogic}
              onChange={(event) => setAccessLogic(event.target.value)}
              className="w-full rounded-md border border-border/40 bg-input px-4 py-3 font-body text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option>Subscribers only</option>
              <option>Pay-per-view</option>
              <option>Pay-per-view + subscribers</option>
            </select>
          </div>

          <div className="mt-8 space-y-3">
            <label className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Included Perks</label>
            {perks.map((perk, index) => (
              <div key={`${perk}-${index}`} className="flex items-center gap-3 rounded-md border border-border/30 bg-muted/40 p-3">
                <input
                  value={perk}
                  onChange={(event) => setPerks((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                  className="min-w-0 flex-1 bg-transparent font-body text-sm text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPerks((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label={`Remove ${perk}`}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPerks((current) => [...current, "New member perk"])}
              className="rounded-sm border border-border/40 bg-muted px-4 py-2 font-headline text-xs font-bold text-primary transition-colors hover:border-primary"
            >
              Add Perk
            </button>
          </div>

          <footer className="mt-8 flex justify-end gap-3 border-t border-border/30 pt-6">
            <Link href="/studio/memberships" className="rounded-sm px-5 py-3 font-headline text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              Cancel
            </Link>
            <button className="rounded-sm bg-primary px-6 py-3 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
              Save Tier Draft
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}
