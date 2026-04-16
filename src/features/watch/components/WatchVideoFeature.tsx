import { VideoPlayer } from "./VideoPlayer";
import { VideoInfo } from "./VideoInfo";
import { CreatorSection } from "./CreatorSection";
import { CommentsSection } from "./CommentsSection";
import { RelatedVideosSidebar } from "./RelatedVideosSidebar";

export function WatchVideoFeature() {
  return (
    <div className="xl:pl-64 pt-24 pb-12 px-4 md:px-8 max-w-[1700px] mx-auto flex flex-col xl:flex-row gap-10 min-h-screen">
      {/* Main Content (Left) */}
      <div className="flex-grow xl:w-2/3">
        <VideoPlayer />
        <VideoInfo />
        <CreatorSection />
        <CommentsSection />
      </div>

      {/* Related Videos Sidebar (Right) */}
      <RelatedVideosSidebar />
    </div>
  );
}
