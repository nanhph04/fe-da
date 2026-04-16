import { StatCards } from "./StatCards";
import { EarningsGraph } from "./EarningsGraph";
import { RecentActivities } from "./RecentActivities";
import { TopVideos } from "./TopVideos";
import { LatestComments } from "./LatestComments";

export function StudioDashboardFeature() {
  return (
    <section className="p-8 space-y-12 max-w-7xl mx-auto w-full">
      <StatCards />
      
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
