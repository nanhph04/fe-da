"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";

import { getAdminDashboardData } from "../services/adminDashboardService";
import type { AdminDashboardData, AdminPriorityAction, AdminStatCard } from "../types/admin-dashboard.types";
import { buildAdminPriorityActions, buildAdminStatCards } from "../utils/admin-dashboard.utils";

const statToneClasses: Record<AdminStatCard["tone"], string> = {
  default: "border-border/30 bg-card text-foreground",
  primary: "border-border/30 bg-card text-primary",
  secondary: "border-border/30 bg-card text-secondary",
  warning: "border-primary/40 bg-primary/10 text-primary",
};

const actionToneClasses: Record<AdminPriorityAction["tone"], string> = {
  primary: "text-primary group-hover:border-primary/60",
  secondary: "text-secondary group-hover:border-secondary/60",
  muted: "text-muted-foreground group-hover:border-border",
};

export function AdminOverviewFeature() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminDashboardData();
      setDashboardData(data);
    } catch (err) {
      setDashboardData(null);
      setError(getErrorMessage(err, "Không thể tải dashboard admin."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statCards = useMemo(
    () => (dashboardData ? buildAdminStatCards(dashboardData) : []),
    [dashboardData]
  );
  const priorityActions = useMemo(
    () => (dashboardData ? buildAdminPriorityActions(dashboardData) : []),
    [dashboardData]
  );

  return (
    <section className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">System Admin</p>
          <h1 className="font-headline text-4xl font-extrabold uppercase tracking-tight text-foreground">Command Center</h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            GLOBAL NETWORK OVERSIGHT - REAL DATA WHERE API CONTRACTS EXIST
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">sync</span>
          {isLoading ? "Syncing" : "Refresh Data"}
        </button>
      </header>

      {error ? <AdminErrorState message={error} onRetry={loadDashboard} /> : null}
      {isLoading ? <AdminDashboardSkeleton /> : null}
      {!isLoading && dashboardData ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map(card => <StatCard key={card.id} card={card} />)}
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <DataSourcesPanel data={dashboardData} />
            <PriorityActions actions={priorityActions} />
          </div>
        </>
      ) : null}
    </section>
  );
}

function AdminErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-foreground">Không thể tải dữ liệu admin</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">{message}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Loading admin dashboard">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-40 rounded-lg border border-border/30 bg-card p-6">
          <div className="h-3 w-2/3 rounded-sm bg-muted" />
          <div className="mt-6 h-10 w-1/2 rounded-sm bg-muted" />
          <div className="mt-5 h-3 w-3/4 rounded-sm bg-muted" />
        </div>
      ))}
    </div>
  );
}

function StatCard({ card }: { card: AdminStatCard }) {
  const content = (
    <article className={`group relative min-h-40 overflow-hidden rounded-lg border p-6 transition-colors ${statToneClasses[card.tone]}`}>
      <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
        <span className="material-symbols-outlined text-6xl" aria-hidden="true">{card.icon}</span>
      </div>
      <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{card.label}</p>
      <h3 className={`font-headline text-3xl font-black ${card.unavailable ? "text-muted-foreground" : "text-current"}`}>
        {card.value}
      </h3>
      <p className="mt-4 max-w-[15rem] font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{card.detail}</p>
      {card.unavailable ? (
        <span className="mt-4 inline-flex rounded-sm border border-border/30 bg-background px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          API Needed
        </span>
      ) : null}
    </article>
  );

  if (!card.href) {
    return content;
  }

  return (
    <Link href={card.href} className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
      {content}
    </Link>
  );
}

function DataSourcesPanel({ data }: { data: AdminDashboardData }) {
  const readyCount = data.dataSources.filter(source => source.status === "ready").length;

  return (
    <section className="overflow-hidden rounded-lg border border-border/30 bg-card">
      <div className="flex flex-col gap-2 border-b border-border/30 bg-background px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-foreground">Data Contract Status</h2>
          <p className="font-body text-sm text-muted-foreground">{readyCount} of {data.dataSources.length} sources are backed by confirmed APIs.</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Loaded {new Date(data.loadedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="divide-y divide-border/30">
        {data.dataSources.map((source, index) => (
          <div key={`${source.key}-${index}`} className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-headline text-sm font-bold text-foreground">{source.label}</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">{source.message}</p>
            </div>
            <span className={`shrink-0 rounded-sm border px-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${source.status === "ready" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-border/30 bg-muted text-muted-foreground"}`}>
              {source.status === "ready" ? "Ready" : "API Needed"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PriorityActions({ actions }: { actions: AdminPriorityAction[] }) {
  return (
    <section className="rounded-lg border border-border/30 bg-card p-6">
      <h2 className="mb-4 font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map(action => (
          <Link
            key={action.id}
            href={action.href}
            className={`group rounded-lg border border-border/30 bg-background p-4 transition-colors hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${actionToneClasses[action.tone]}`}
          >
            <span className="material-symbols-outlined mb-3 text-2xl" aria-hidden="true">{action.icon}</span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-headline text-sm font-bold uppercase tracking-widest text-foreground">{action.label}</p>
                <p className="mt-1 font-body text-xs text-muted-foreground">{action.description}</p>
              </div>
              <span className={`shrink-0 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${action.unavailable ? "border-border/30 bg-muted text-muted-foreground" : "border-secondary/30 bg-secondary/10 text-secondary"}`}>
                {action.countLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
