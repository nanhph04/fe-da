import Image from "next/image";
import { Link } from "@/i18n/routing";

export interface MediaCardProps {
  title: string;
  creator: string;
  views: string;
  imageUrl: string;
  duration?: string;
  href?: string;
}

export function MediaCard({ title, creator, views, imageUrl, duration, href }: MediaCardProps) {
  const card = (
    <div className="group relative w-64 flex-shrink-0 cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-card">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
      
      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-foreground transition-colors">
          {title}
        </h3>
        <p className="text-xs text-white/50">{creator}</p>
        <p className="text-xs text-white/30">{views} views</p>
      </div>
    </div>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} aria-label={`Watch ${title}`} className="flex-shrink-0">
      {card}
    </Link>
  );
}
