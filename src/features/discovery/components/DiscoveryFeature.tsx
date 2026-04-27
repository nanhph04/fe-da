import { Suspense } from "react";
import { LatestVideosServer } from "./LatestVideosServer";
import { SubscribedVideosClient } from "./SubscribedVideosClient";
import { VideoSkeleton } from "@/components/ui/VideoSkeleton";

export function DiscoveryFeature() {
  return (
    <div className="md:pl-64 pt-24 min-h-screen bg-[#0e0e10]">
        <div className="max-w-7xl mx-auto px-8 pb-16 space-y-16 animate-in fade-in duration-500">
          
        {/* Latest Videos Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#ff8e80]">whatshot</span>
            <h2 className="text-2xl font-bold font-headline text-white tracking-wide">Latest Releases</h2>
          </div>
          <Suspense fallback={<VideoSkeleton />}>
            <LatestVideosServer />
          </Suspense>
        </section>

        {/* Subscribed Channels Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#ff8e80]">subscriptions</span>
            <h2 className="text-2xl font-bold font-headline text-white tracking-wide">From Your Subscriptions</h2>
          </div>
          
          <SubscribedVideosClient />
        </section>

      </div>
    </div>
  );
}
