"use client";

import { useState } from "react";

const policyLevels = [
  {
    level: 1,
    name: "Standard Gallery",
    accessLogic: "Public",
    moderationRule: "Family Friendly",
    monetized: false,
    tone: "muted",
  },
  {
    level: 2,
    name: "Mature Content",
    accessLogic: "Subscribers only",
    moderationRule: "Age-gated 18+",
    monetized: true,
    tone: "warning",
  },
  {
    level: 3,
    name: "Velvet Room",
    accessLogic: "Pay-per-view",
    moderationRule: "Strict ID Verification",
    monetized: true,
    tone: "primary",
  },
] as const;

const accessOptions = ["Public", "Subscribers only", "Pay-per-view"];

type PolicyLevel = (typeof policyLevels)[number];

function PolicyCard({ policy }: { policy: PolicyLevel }) {
  const [name, setName] = useState<string>(policy.name);
  const [accessLogic, setAccessLogic] = useState<string>(policy.accessLogic);
  const [moderationRule, setModerationRule] = useState<string>(policy.moderationRule);
  const [monetized, setMonetized] = useState(policy.monetized);

  const isPrimary = policy.tone === "primary";
  const isWarning = policy.tone === "warning";

  return (
    <article
      className={`relative flex flex-col gap-5 overflow-hidden rounded-lg border bg-card p-6 shadow-xl ${
        isPrimary ? "border-primary/20" : "border-border/30"
      }`}
    >
      {isPrimary ? <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" /> : null}

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`rounded-sm px-2 py-1 font-label text-xs font-bold ${
              isPrimary
                ? "bg-primary/20 text-primary"
                : isWarning
                  ? "bg-secondary/10 text-secondary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            LV {policy.level}
          </span>
          <input
            aria-label={`Level ${policy.level} policy name`}
            className={`w-full min-w-0 border-none bg-transparent p-0 font-display text-lg font-bold outline-none ring-0 focus:ring-0 ${
              isPrimary ? "text-primary" : "text-foreground"
            }`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <span
          className={`material-symbols-outlined text-sm ${isPrimary ? "text-primary" : "text-muted-foreground"}`}
          aria-hidden="true"
        >
          {isPrimary ? "verified_user" : "settings"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-muted-foreground">
            Access Logic
          </label>
          <select
            className="h-10 w-full rounded-md border border-border/30 bg-input px-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            value={accessLogic}
            onChange={(event) => setAccessLogic(event.target.value)}
          >
            {accessOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-muted-foreground">
            Moderation Rules
          </label>
          <input
            className="h-10 w-full rounded-md border border-border/30 bg-input px-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            value={moderationRule}
            onChange={(event) => setModerationRule(event.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/20 pt-2">
        <span className="font-body text-xs text-muted-foreground">AC Unlocking vs Subscription</span>
        <button
          type="button"
          aria-pressed={monetized}
          aria-label={`Toggle AC unlocking for level ${policy.level}`}
          onClick={() => setMonetized((current) => !current)}
          className={`relative h-5 w-10 rounded-full transition-colors ${
            monetized ? "bg-primary" : "bg-primary/20"
          }`}
        >
          <span
            className={`absolute top-1 h-3 w-3 rounded-full transition-all ${
              monetized ? "right-1 bg-foreground" : "left-1 bg-primary"
            }`}
          />
        </button>
      </div>
    </article>
  );
}

export function AdminContentPolicyEditorFeature() {
  const [exchangeRate, setExchangeRate] = useState("100");
  const [platformFee, setPlatformFee] = useState("10.5");

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/20 bg-background/80 px-8 pb-12 pt-16 backdrop-blur-2xl md:px-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              System Settings
            </h1>
            <p className="font-body text-lg text-muted-foreground">
              Global configuration for the Velvet Gallery ecosystem.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 font-headline text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              save
            </span>
            Save Policy Draft
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 py-12 md:px-16 xl:grid-cols-2">
        <section className="flex flex-col gap-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">
              currency_exchange
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Global Economy</h2>
          </div>

          <div className="relative flex flex-col gap-6 overflow-hidden rounded-lg bg-card p-6 shadow-[0_10px_30px_rgba(245,158,11,0.05)] ring-1 ring-secondary/10">
            <div>
              <label className="mb-2 block font-label text-sm uppercase tracking-wider text-muted-foreground">
                Base Exchange Rate (USD to Aura)
              </label>
              <div className="flex items-center gap-4 rounded-md bg-background p-3">
                <span className="font-display text-muted-foreground">$1.00 USD =</span>
                <input
                  aria-label="Base exchange rate"
                  className="w-24 border-none bg-transparent p-0 text-right font-display text-xl font-bold text-secondary outline-none focus:ring-0"
                  type="number"
                  value={exchangeRate}
                  onChange={(event) => setExchangeRate(event.target.value)}
                />
                <span className="font-display font-bold text-secondary">AURA</span>
              </div>
            </div>

            <div className="h-px w-full bg-border/20" />

            <div>
              <label className="mb-2 block font-label text-sm uppercase tracking-wider text-muted-foreground">
                Platform Transaction Fee
              </label>
              <div className="flex items-center gap-4 rounded-md bg-background p-3">
                <input
                  aria-label="Platform transaction fee percentage"
                  className="w-24 border-none bg-transparent p-0 text-right font-display text-xl font-bold text-foreground outline-none focus:ring-0"
                  type="number"
                  step="0.1"
                  value={platformFee}
                  onChange={(event) => setPlatformFee(event.target.value)}
                />
                <span className="font-display text-xl text-muted-foreground">%</span>
              </div>
              <p className="mt-2 font-body text-xs text-muted-foreground">
                Applied to all content unlocks and premium subscriptions.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              security
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Content Policy Editor
            </h2>
          </div>

          <div className="flex flex-col gap-4 rounded-lg p-1">
            {policyLevels.map((policy) => (
              <PolicyCard key={policy.level} policy={policy} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
