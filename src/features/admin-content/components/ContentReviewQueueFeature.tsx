"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";

import { adminModerationService, type AdminReportItem } from "../services/adminModerationService";

const initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getConfidenceLabel(value: number | null) {
  return value === null ? "N/A" : `${value}%`;
}

function getPriorityClass(priority: AdminReportItem["priority"]) {
  if (priority === "critical" || priority === "high") {
    return "border-primary/30 bg-primary/10 text-primary";
  }

  if (priority === "medium") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  return "border-border/40 bg-muted text-muted-foreground";
}

export function ContentReviewQueueFeature() {
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await adminModerationService.getReports({ status: "pending", page: 1, limit: 10 });

        if (!cancelled) {
          setReports(data.items);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Khong the tai hang doi kiem duyet."));
          setReports([]);
          setPagination(initialPagination);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Moderation Queue</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Content Review</h1>
          <p className="mt-2 flex items-center gap-2 font-body text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">warning</span>
            {isLoading ? "Loading moderation reports..." : `${pagination.total} pending flags require administrator review.`}
          </p>
        </div>
        <div className="rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-primary">
          Live API
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 font-body text-sm text-primary">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Flagged Media</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4" colSpan={6}>
                      <div className="h-12 rounded-sm bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                    Chua co report nao can duyet tu media service.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-24 overflow-hidden rounded-sm border border-border/30 bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(135deg,rgba(31,31,34,0.95),rgba(14,14,16,1))]" />
                        <div>
                          <p className="font-headline text-sm font-bold text-foreground">{report.title}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{report.targetVideoId} - {formatDate(report.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-foreground/80">{report.reporterLabel}</td>
                    <td className="px-6 py-4">
                      <span className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">{report.reason}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className={`rounded-sm border px-2 py-0.5 uppercase ${getPriorityClass(report.priority)}`}>{report.priority}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className={`rounded-sm border px-2 py-0.5 ${report.confidencePercent !== null ? "border-primary/30 bg-primary/10 text-primary" : "border-border/40 bg-muted text-muted-foreground"}`}>
                        {getConfidenceLabel(report.confidencePercent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/content/${report.targetVideoId}`} className="inline-flex rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
