export function StatCards({ dateRange = "30D" }: { dateRange?: "7D" | "30D" }) {
  const isWeekly = dateRange === "7D";
  const cards = [
    {
      label: "Total Views",
      value: isWeekly ? "304,115" : "1,284,502",
      icon: "visibility",
      trend: isWeekly ? "+5.6%" : "+12.4%",
      trendIcon: "trending_up",
      tone: "primary",
    },
    {
      label: "New Subscribers",
      value: isWeekly ? "10,240" : "42,910",
      icon: "person_add",
      trend: isWeekly ? "+2.1%" : "+8.2%",
      trendIcon: "trending_up",
      tone: "primary",
    },
    {
      label: "Earnings (Aura Coins)",
      value: isWeekly ? "210,500" : "850,200",
      icon: "monetization_on",
      trend: isWeekly ? "≈ 21,050,000 VND" : "≈ 85,020,000 VND",
      trendIcon: "payments",
      tone: "secondary",
    },
    {
      label: "Avg. Watch Time",
      value: isWeekly ? "15m 10s" : "14m 22s",
      icon: "schedule",
      trend: isWeekly ? "+1.5%" : "-2.1%",
      trendIcon: isWeekly ? "trending_up" : "trending_down",
      tone: isWeekly ? "primary" : "danger",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const isSecondary = card.tone === "secondary";
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
                isSecondary ? "text-secondary" : isDanger ? "text-primary" : "text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{card.trendIcon}</span>
              {card.trend}
              {!isSecondary ? <span className="ml-1 font-normal text-muted-foreground">vs prev. period</span> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
