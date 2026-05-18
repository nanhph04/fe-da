import Link from "next/link";
import { HeroSection } from "./HeroSection";
import { MediaRow } from "./MediaRow";
import type { MediaCardProps } from "./MediaCard";
import { TopNavHome } from "./TopNavHome";
import { formatDuration, formatViewCount } from "../utils/format";
import {
  getReadyPublicThumbnailUrl,
  type CategoryPublic,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

const FALLBACK_HERO = {
  title: "Midnight Cinema",
  subtitle:
    "An exclusive collection of curated films for the discerning viewer. Experience cinema as it was meant to be seen.",
  imageUrl:
    "https://images.unsplash.com/photo-1536440132228-1ce5fe87afda?auto=format&fit=crop&w=1920&q=80",
};

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

interface LandingCategorySection {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videos: PublicDiscoveryVideo[];
}

interface LandingPageProps {
  latestVideos: PublicDiscoveryVideo[];
  categories: CategoryPublic[];
  categorySections: LandingCategorySection[];
}

function toMediaCard(video: PublicDiscoveryVideo): MediaCardProps {
  return {
    title: video.title,
    creator: video.channel?.name ?? "Velvet Gallery",
    views: formatViewCount(video.viewCount),
    imageUrl: getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus, video.id) ?? FALLBACK_THUMBNAIL,
    duration: formatDuration(video.durationSeconds),
    href: `/watch/${video.id}`,
  };
}

export function LandingPage({
  latestVideos,
  categories,
  categorySections,
}: LandingPageProps) {
  const heroVideo = latestVideos[0];
  const releaseItems = latestVideos
    .filter(video => video.id !== heroVideo?.id)
    .slice(0, 6)
    .map(toMediaCard);
  const visibleCategorySections = categorySections
    .map(section => ({
      ...section,
      items: section.videos.slice(0, 6).map(toMediaCard),
    }))
    .filter(section => section.items.length > 0);
  const heroContent = heroVideo
    ? {
      title: heroVideo.title,
      subtitle: heroVideo.description || FALLBACK_HERO.subtitle,
      imageUrl: getReadyPublicThumbnailUrl(heroVideo.thumbnailUrl, heroVideo.thumbnailStatus, heroVideo.id) ?? FALLBACK_THUMBNAIL,
      videoId: heroVideo.id,
    }
    : FALLBACK_HERO;

  return (
    <div className="bg-background min-h-screen">
      <TopNavHome>
        <HeroSection {...heroContent} />

        <div className="max-w-7xl mx-auto -mt-20 relative z-20">
          {releaseItems.length > 0 ? (
            <MediaRow title="Mới phát hành" items={releaseItems} viewAllHref="/category/latest" />
          ) : (
            <section className="py-8 px-8">
              <div className="rounded-sm border border-white/10 bg-card/80 p-8 text-white/60">
                Chưa có nội dung mới từ Media Service. Vui lòng quay lại sau.
              </div>
            </section>
          )}

          {visibleCategorySections.map(section => (
            <MediaRow
              key={section.categoryId}
              title={section.categoryName}
              items={section.items}
              viewAllHref={`/category/${section.categorySlug}`}
            />
          ))}

          {categories.length > 0 && (
            <section className="py-8 px-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold font-headline text-foreground">Khám phá theo thể loại</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="rounded-sm border border-white/10 bg-card px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-[#262626] hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Footer Spacing */}
          <div className="h-24" />
        </div>
      </TopNavHome>
    </div>
  );
}
