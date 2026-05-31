"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/shared/api/client";

import { adminModerationService, type AdminReportItem } from "../services/adminModerationService";

const initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
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
  const t = useTranslations("Admin.content.reviewQueue");
  const locale = useLocale();
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
          setError(getErrorMessage(err, t("errors.loadFailed")));
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
  }, [t]);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("header.eyebrow")}</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">{t("header.title")}</h1>
          <p className="mt-2 flex items-center gap-2 font-body text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">warning</span>
            {isLoading ? t("header.loading") : t("header.summary", { count: pagination.total })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 rounded-sm border border-border/40 bg-muted/30 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/60"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
            {t("actions.backToContent")}
          </Link>
          <div className="rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-primary">
            {t("header.liveApi")}
          </div>
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
                <th className="px-6 py-4">{t("table.flaggedMedia")}</th>
                <th className="px-6 py-4">{t("table.reporter")}</th>
                <th className="px-6 py-4">{t("table.reason")}</th>
                <th className="px-6 py-4">{t("table.priority")}</th>
                <th className="px-6 py-4">{t("table.confidence")}</th>
                <th className="px-6 py-4 text-right">{t("table.actions")}</th>
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
                    {t("empty")}
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
                          <p className="font-mono text-[10px] text-muted-foreground">{report.targetVideoId} - {formatDate(report.createdAt, locale)}</p>
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
                      <Link href={`/admin/content/${report.targetVideoId}?mode=review`} className="inline-flex rounded-sm bg-primary px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90">
                        {t("actions.review")}
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
