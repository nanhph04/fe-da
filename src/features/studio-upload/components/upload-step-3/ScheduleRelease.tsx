"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ScheduleRelease() {
  const t = useTranslations("Studio.upload");
  const [enabled, setEnabled] = useState(false);
  const [date, setDate] = useState("2026-05-20");
  const [time, setTime] = useState("18:00");

  return (
    <section className="flex flex-col gap-6 rounded-lg bg-surface-container-low p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-base font-semibold text-on-surface">{t("step3.schedule.title")}</h3>
            <span className="rounded bg-surface-container-high px-2 py-0.5 font-body text-xs text-on-surface-variant">
              {t("step3.schedule.badge")}
            </span>
          </div>
          <p className="font-body text-sm text-on-surface-variant">
            {t("step3.schedule.description")}
          </p>
        </div>

        <button
          type="button"
          aria-pressed={enabled}
          onClick={() => setEnabled((current) => !current)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-primary shadow-[0_0_10px_rgba(255,142,128,0.3)]" : "bg-outline-variant"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-on-surface shadow-sm transition-all ${
              enabled ? "right-0.5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {enabled ? (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <label className="ml-1 font-label text-xs text-on-surface-variant" htmlFor="release-date">
              {t("step3.schedule.date")}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
                calendar_today
              </span>
              <input
                id="release-date"
                className="w-full rounded border border-outline-variant/20 bg-surface-container-lowest py-3 pl-10 pr-4 font-body text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="ml-1 font-label text-xs text-on-surface-variant" htmlFor="release-time">
              {t("step3.schedule.time")}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
                schedule
              </span>
              <input
                id="release-time"
                className="w-full rounded border border-outline-variant/20 bg-surface-container-lowest py-3 pl-10 pr-4 font-body text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
