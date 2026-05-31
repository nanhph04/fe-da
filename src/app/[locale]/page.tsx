import { HomePage } from "@/features/home/components/HomePage";
import {
  getCategoriesCached,
  getLatestVideosCached,
  getVideosByCategoryCached,
  getVideosRankingCached,
  type CategoryPublic,
  type PublicDiscoveryVideo,
} from "@/features/watch/services/publicMediaService";

import { setRequestLocale } from "next-intl/server";

const HOME_CATEGORY_SECTION_LIMIT = 2;
const HOME_CATEGORY_CANDIDATE_LIMIT = 8;
const HOME_CATEGORY_VIDEO_LIMIT = 6;

interface HomeCategorySection {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videos: PublicDiscoveryVideo[];
}

function isVisibleHomeCategory(category: CategoryPublic) {
  const target = `${category.slug} ${category.name}`;
  return !/(^|\s|-)khac($|\s|-)|khác|other/i.test(target);
}

function getSeededCategoryScore(category: CategoryPublic, seed: string) {
  const input = `${seed}:${category.slug}:${category.id}`;
  let score = 0;

  for (let index = 0; index < input.length; index += 1) {
    score = (score * 31 + input.charCodeAt(index)) % 1_000_000_007;
  }

  return score;
}

function getRandomHomeCategories(
  categories: CategoryPublic[],
  limit: number,
  seed: string,
) {
  const visibleCategories = categories.filter(isVisibleHomeCategory);
  const normalizedSeed = seed.trim() || "home";

  return [...visibleCategories]
    .sort(
      (firstCategory, secondCategory) =>
        getSeededCategoryScore(firstCategory, normalizedSeed) -
        getSeededCategoryScore(secondCategory, normalizedSeed),
    )
    .slice(0, limit);
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [latestRes, categoriesRes, topViewsRes, topPurchasesRes] = await Promise.all([
    getLatestVideosCached(13).catch(() => null),
    getCategoriesCached().catch(() => null),
    getVideosRankingCached("views", "week", 6).catch(() => null),
    getVideosRankingCached("purchases", "week", 6).catch(() => null),
  ]);

  const latestVideos = latestRes?.success ? latestRes.data ?? [] : [];
  const categories = categoriesRes?.success ? categoriesRes.data ?? [] : [];
  const topViewsVideos = topViewsRes?.success ? topViewsRes.data ?? [] : [];
  const topPurchasesVideos = topPurchasesRes?.success ? topPurchasesRes.data ?? [] : [];

  const selectedCategories = getRandomHomeCategories(
    categories,
    HOME_CATEGORY_CANDIDATE_LIMIT,
    `${locale}:${latestVideos[0]?.id ?? "latest"}:${categories.length}`,
  );

  const categorySectionCandidates = await Promise.all(
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
  const categorySections = categorySectionCandidates
    .filter((section) => section.videos.length > 0)
    .slice(0, HOME_CATEGORY_SECTION_LIMIT);

  return (
    <HomePage
      latestVideos={latestVideos}
      categories={categories}
      categorySections={categorySections}
      topViewsVideos={topViewsVideos}
      topPurchasesVideos={topPurchasesVideos}
    />
  );
}
