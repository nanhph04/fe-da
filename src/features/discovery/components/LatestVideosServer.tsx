import Link from "next/link";
import {
  getLatestVideosCached,
  getReadyPublicThumbnailUrl,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

function getPrimaryResolution(resolutions: string[]) {
  return (
    [...resolutions].sort(
      (left, right) => parseInt(right, 10) - parseInt(left, 10)
    )[0] || "HD"
  );
}

export async function LatestVideosServer() {
  let latestVideos: PublicDiscoveryVideo[] = [];

  try {
    const latestRes = await getLatestVideosCached(10);
    if (latestRes.success && latestRes.data) {
      latestVideos = latestRes.data;
    }
  } catch (err) {
    console.error("Failed to load latest videos via SSR", err);
  }

  if (latestVideos.length === 0) {
    return <p className="text-muted-foreground">No recent videos found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {latestVideos.map((video) => (
        <Link
          href={`/watch/${video.id}`}
          key={video.id}
          className="group flex cursor-pointer flex-col gap-3"
        >
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 ease-in-out group-hover:border-primary/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus) || "/images/thumbnail.png"}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-transparent" />
            <div className="absolute bottom-2 right-2 rounded-sm bg-black/80 px-2 py-1 text-[10px] font-bold text-foreground">
              {getPrimaryResolution(video.resolutions)}
            </div>
          </div>
          <div>
            <h3 className="line-clamp-2 leading-snug text-foreground transition-colors duration-300 group-hover:text-primary font-headline font-bold">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {video.category || "Uncategorized"}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
              <span>{video.viewCount.toLocaleString()} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
