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
    <section className="p-8 space-y-12 max-w-7xl mx-auto w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-[#f9f5f8]">Dashboard Overview</h1>
          <p className="text-zinc-500 font-medium mt-1">Here is what happening with your channel today.</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex bg-[#19191c] rounded-md p-1 border border-[#48474a]/20 w-fit">
          <button 
            onClick={() => setDateRange("7D")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${dateRange === "7D" ? 'bg-[#ff8e80] text-[#650003]' : 'text-zinc-500 hover:text-white'}`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setDateRange("30D")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${dateRange === "30D" ? 'bg-[#ff8e80] text-[#650003]' : 'text-zinc-500 hover:text-white'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <StatCards dateRange={dateRange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col">
          <EarningsGraph />
        </div>
        <div>
          <RecentActivities />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2">
          <TopVideos />
        </div>
        <div>
          <LatestComments />
        </div>
      </div>
    </section>
  );
}
