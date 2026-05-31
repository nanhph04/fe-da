import { VideoThumbnail } from "@/shared/components/VideoThumbnail";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export interface MediaCardProps {
  title: string;
  creator: string;
  channelId?: string;
  views: string;
  imageUrl: string;
  duration?: string;
  href?: string;
}

export function MediaCard({ title, creator, channelId, views, imageUrl, duration, href }: MediaCardProps) {
  const t = useTranslations("Home");

  return (
    <div className="group relative w-64 flex-shrink-0">
      {/* Image Container wrapped in watch link if href exists */}
      {href ? (
        <Link href={href} aria-label={`Watch ${title}`}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-card cursor-pointer">
            <VideoThumbnail
              src={imageUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Duration Badge */}
            {duration && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-foreground text-xs rounded">
                {duration}
              </div>
            )}
            
            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="material-symbols-outlined text-foreground text-2xl">play_arrow</span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-card">
          <VideoThumbnail
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-foreground text-xs rounded">
              {duration}
            </div>
          )}
        </div>
      )}
      
      {/* Info */}
      <div className="mt-3 space-y-1">
        {href ? (
          <Link href={href} className="block group-hover:text-primary transition-colors">
            <h3 className="text-sm font-medium text-foreground line-clamp-1">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-sm font-medium text-foreground line-clamp-1">
            {title}
          </h3>
        )}

        {/* Creator / Channel Link */}
        {channelId ? (
          <Link
            href={`/channel/${channelId}`}
            className="block text-xs text-white/50 hover:text-primary transition-colors w-fit"
          >
            {creator}
          </Link>
        ) : (
          <p className="text-xs text-white/50">{creator}</p>
        )}

        <p className="text-xs text-white/30">{t("viewsCount", { count: views })}</p>
      </div>
    </div>
  );
}
