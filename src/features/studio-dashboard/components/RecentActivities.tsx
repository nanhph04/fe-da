import { useTranslations } from "next-intl";
import type { DashboardActivity } from "../types/studio-dashboard.types";

interface RecentActivitiesProps {
  activities: DashboardActivity[];
  isLoading?: boolean;
}

function getDotClass(tone: DashboardActivity["tone"]) {
  if (tone === "secondary") {
    return "bg-secondary shadow-[0_0_10px_rgba(245,158,11,0.45)]";
  }

  if (tone === "primary") {
    return "bg-primary shadow-[0_0_10px_rgba(229,9,20,0.45)]";
  }

  if (tone === "danger") {
    return "bg-destructive shadow-[0_0_10px_rgba(167,1,56,0.45)]";
  }

  return "bg-muted-foreground";
}

export function RecentActivities({ activities, isLoading = false }: RecentActivitiesProps) {
  const t = useTranslations("Studio");

  return (
    <div className="flex h-full flex-col rounded-sm border border-border/30 bg-card p-8">
      <h2 className="mb-6 font-headline text-xl font-bold text-foreground">{t("dashboard.recentActivities.title")}</h2>

      <div className="flex-1 space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="mt-2 h-2 w-2 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="mt-2 h-3 w-56 rounded bg-muted" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${getDotClass(activity.tone)}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{activity.description}</p>
                <span className="mt-2 block font-label text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {activity.timeLabel}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-sm border border-dashed border-border/40 bg-background/50 p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-muted-foreground">history</span>
            <p className="mt-2 font-headline text-sm font-bold text-foreground">{t("dashboard.recentActivities.emptyTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.recentActivities.emptyDescription")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
