import { VideoEarning } from "../types/studio-wallet.types";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";

interface VideoEarningsListProps {
  videos: VideoEarning[];
}

export function VideoEarningsList({ videos }: VideoEarningsListProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        No video earnings found
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold font-headline text-white mb-4">
        Top Performing Videos
      </h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <VideoEarningRow key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

interface VideoEarningRowProps {
  video: VideoEarning;
}

function VideoEarningRow({ video }: VideoEarningRowProps) {
  const getStatusColor = (status: VideoEarning["payoutStatus"]) => {
    switch (status) {
      case "PENDING":
        return "text-[var(--color-secondary-700)]"; // amber
      case "PAID":
        return "text-[#22c55e]"; // green
      case "FAILED":
        return "text-[#ef4444]"; // red
      default:
        return "text-zinc-400";
    }
  };

  const getStatusText = (status: VideoEarning["payoutStatus"]) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "PAID":
        return "Paid";
      case "FAILED":
        return "Failed";
      default:
        return status;
    }
  };

  return (
    <div className="bg-[var(--color-border-700)] rounded-lg p-4 hover:bg-[#2e2d30] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">
            {video.videoTitle}
          </h4>
          <div className="flex items-center space-x-4 mt-1 text-xs text-zinc-400">
            <span>{video.views.toLocaleString()} views</span>
            <span>{video.likes} likes</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-[var(--color-secondary-600)] font-headline">
            {formatCurrency(video.revenue)}
          </span>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${getStatusColor(video.payoutStatus)}`}>
              {getStatusText(video.payoutStatus)}
            </span>
            {video.payoutStatus === "PENDING" && (
              <div className="w-2 h-2 bg-[var(--color-secondary-700)] rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}