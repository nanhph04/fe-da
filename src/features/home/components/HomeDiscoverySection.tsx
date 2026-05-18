import Link from "next/link";
import { MediaRow } from "./MediaRow";
import type { MediaCardProps } from "./MediaCard";
import { formatDuration, formatViewCount } from "../utils/format";
import {
  getReadyPublicThumbnailUrl,
  type CategoryPublic,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

const FALLBACK_THUMBNAIL = "/images/thumbnail.png";

export interface HomeCategorySection {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videos: PublicDiscoveryVideo[];
}

interface HomeDiscoverySectionProps {
  latestVideos: PublicDiscoveryVideo[];
  categories: CategoryPublic[];
  categorySections: HomeCategorySection[];
}

function toMediaCard(video: PublicDiscoveryVideo): MediaCardProps {
  return {
    title: video.title,
    creator: video.channel?.name ?? "Velvet Gallery",
    views: formatViewCount(video.viewCount),
    imageUrl:
      getReadyPublicThumbnailUrl(video.thumbnailUrl, video.thumbnailStatus, video.id) ??
      FALLBACK_THUMBNAIL,
    duration: formatDuration(video.durationSeconds),
    href: `/watch/${video.id}`,
  };
}

export function HomeDiscoverySection({
  latestVideos,
  categories,
  categorySections,
}: HomeDiscoverySectionProps) {
  const releaseItems = latestVideos.slice(0, 6).map(toMediaCard);
  const visibleCategorySections = categorySections
    .map((section) => ({
      ...section,
      items: section.videos.slice(0, 6).map(toMediaCard),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <section id="discover" className="relative bg-background py-20">
      <div className="mx-auto max-w-7xl px-8 md:px-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
              Kho phim đang mở
            </p>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Khám phá nội dung mới nhất
            </h2>
          </div>
          <Link
            href="/search"
            className="w-fit rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Tìm kiếm toàn thư viện
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {releaseItems.length > 0 ? (
          <MediaRow title="Mới phát hành" items={releaseItems} viewAllHref="/category/latest" />
        ) : (
          <section className="px-8 py-8 md:px-12">
            <div className="rounded-sm border border-border bg-card p-8 text-muted-foreground">
              Chưa có nội dung mới từ Media Service. Vui lòng quay lại sau.
            </div>
          </section>
        )}

        {visibleCategorySections.map((section) => (
          <MediaRow
            key={section.categoryId}
            title={section.categoryName}
            items={section.items}
            viewAllHref={`/category/${section.categorySlug}`}
          />
        ))}

        {categories.length > 0 ? (
          <section className="px-8 py-8 md:px-12">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline text-xl font-bold text-foreground">
                Khám phá theo thể loại
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
