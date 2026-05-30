import { useTranslations } from "next-intl";
import type { DashboardStatCard } from "../types/studio-dashboard.types";

interface StatCardsProps {
  cards: DashboardStatCard[];
  isLoading?: boolean;
}

export function StatCards({ cards, isLoading = false }: StatCardsProps) {
  const t = useTranslations("Studio");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-sm border border-border/30 bg-card p-6">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-32 rounded bg-muted" />
            <div className="mt-5 h-3 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const isSecondary = card.tone === "secondary";
        const isMuted = card.tone === "muted";
        const isDanger = card.tone === "danger";

        return (
          <article
            key={card.label}
            className={`group relative overflow-hidden rounded-sm bg-card p-6 ${isSecondary ? "border-l-2 border-secondary/30" : ""}`}
          >
            <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className={`material-symbols-outlined text-6xl ${isSecondary ? "text-secondary" : "text-foreground"}`}>
                {card.icon}
              </span>
            </div>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.label}</p>
            <h3 className={`mt-2 font-headline text-3xl font-extrabold ${isSecondary ? "text-secondary" : "text-foreground"}`}>
              {card.value}
            </h3>
            <div
              className={`mt-4 flex items-center gap-1 font-label text-xs font-bold ${
                isSecondary ? "text-secondary" : isDanger ? "text-destructive" : isMuted ? "text-muted-foreground" : "text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{card.trendIcon}</span>
              {card.trend}
              {!isSecondary && !isMuted ? <span className="ml-1 font-normal text-muted-foreground">{t("dashboard.stats.currentPeriod")}</span> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
