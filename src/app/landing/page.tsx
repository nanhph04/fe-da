import { LandingPage } from "@/features/home/components/LandingPage";
import {
  getCategoriesCached,
  getLatestVideosCached,
  getVideosByCategoryCached,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

const LANDING_CATEGORY_SECTION_LIMIT = 3;
const LANDING_CATEGORY_VIDEO_LIMIT = 6;

interface LandingCategorySection {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videos: PublicDiscoveryVideo[];
}

export default async function LandingRoute() {
  const [latestRes, categoriesRes] = await Promise.all([
    getLatestVideosCached(13).catch(() => null),
    getCategoriesCached().catch(() => null),
  ]);

  const latestVideos = latestRes?.success ? latestRes.data ?? [] : [];
  const categories = categoriesRes?.success ? categoriesRes.data ?? [] : [];
  const selectedCategories = categories.slice(0, LANDING_CATEGORY_SECTION_LIMIT);

  const categorySections = await Promise.all(
    selectedCategories.map(async category => {
      const categoryRes = await getVideosByCategoryCached(
        category.slug,
        LANDING_CATEGORY_VIDEO_LIMIT
      ).catch(() => null);

      return {
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
        videos: categoryRes?.success ? categoryRes.data ?? [] : [],
      } satisfies LandingCategorySection;
    })
  );

  return (
    <LandingPage
      latestVideos={latestVideos}
      categories={categories}
      categorySections={categorySections}
    />
  );
}
