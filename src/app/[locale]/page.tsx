import { HomePage } from "@/features/home/components/HomePage";
import {
  getCategoriesCached,
  getLatestVideosCached,
  getVideosByCategoryCached,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

import { setRequestLocale } from "next-intl/server";

const HOME_CATEGORY_SECTION_LIMIT = 3;
const HOME_CATEGORY_VIDEO_LIMIT = 6;

interface HomeCategorySection {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videos: PublicDiscoveryVideo[];
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [latestRes, categoriesRes] = await Promise.all([
    getLatestVideosCached(13).catch(() => null),
    getCategoriesCached().catch(() => null),
  ]);

  const latestVideos = latestRes?.success ? latestRes.data ?? [] : [];
  const categories = categoriesRes?.success ? categoriesRes.data ?? [] : [];
  const selectedCategories = categories.slice(0, HOME_CATEGORY_SECTION_LIMIT);

  const categorySections = await Promise.all(
    selectedCategories.map(async (category) => {
      const categoryRes = await getVideosByCategoryCached(
        category.slug,
        HOME_CATEGORY_VIDEO_LIMIT,
      ).catch(() => null);

      return {
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
        videos: categoryRes?.success ? categoryRes.data ?? [] : [],
      } satisfies HomeCategorySection;
    }),
  );

  return (
    <HomePage
      latestVideos={latestVideos}
      categories={categories}
      categorySections={categorySections}
    />
  );
}
