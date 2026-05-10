"use client";

import { useState } from "react";
import { StatCards } from "./StatCards";
import { EarningsGraph } from "./EarningsGraph";
import { RecentActivities } from "./RecentActivities";
import { TopVideos } from "./TopVideos";
import { LatestComments } from "./LatestComments";

type DateRange = "7D" | "30D";

export function StudioDashboardFeature() {
  const [dateRange, setDateRange] = useState<DateRange>("30D");

  return (
    <section className="mx-auto w-full max-w-7xl space-y-12 p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Creator Studio</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Channel health, revenue, and audience signals for the current period.</p>
        </div>

        <div className="flex w-fit rounded-md border border-border/30 bg-card p-1">
          {(["7D", "30D"] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`rounded px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest transition-all ${
                dateRange === range ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last {range === "7D" ? "7" : "30"} Days
            </button>
          ))}
        </div>
      </header>

      <StatCards dateRange={dateRange} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col lg:col-span-2">
          <EarningsGraph />
        </div>
        <RecentActivities />
      </div>

      <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopVideos />
        </div>
        <LatestComments />
      </div>
    </section>
  );
}
