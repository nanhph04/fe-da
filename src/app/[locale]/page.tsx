import { HomePage } from "@/features/home/components/HomePage";
import { getServerUserProfile } from "@/shared/auth/server";
import { PublicSiteFooter } from "@/shared/components/PublicSiteFooter";
import { buildLocalizedHref } from "@/shared/utils/locale-path";
import {
  getCategoriesFresh,
  getLatestVideosFresh,
  getVideosRankingFresh,
} from "@/features/watch/services/publicMediaService";

import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const profile = await getServerUserProfile().catch(() => null);

  if (profile?.role === "admin") {
    redirect(buildLocalizedHref("/admin", `/${locale}`));
  }

  const [latestRes, categoriesRes, topViewsRes, topPurchasesRes] = await Promise.all([
    getLatestVideosFresh(13).catch(() => null),
    getCategoriesFresh().catch(() => null),
    getVideosRankingFresh("views", "week", 6).catch(() => null),
    getVideosRankingFresh("purchases", "week", 6).catch(() => null),
  ]);

  const latestVideos = latestRes?.success ? latestRes.data ?? [] : [];
  const categories = categoriesRes?.success ? categoriesRes.data ?? [] : [];
  const topViewsVideos = topViewsRes?.success ? topViewsRes.data ?? [] : [];
  const topPurchasesVideos = topPurchasesRes?.success ? topPurchasesRes.data ?? [] : [];

  return (
    <>
      <HomePage
        latestVideos={latestVideos}
        categories={categories}
        topViewsVideos={topViewsVideos}
        topPurchasesVideos={topPurchasesVideos}
        isAuthenticated={Boolean(profile)}
      />
      <PublicSiteFooter />
    </>
  );
}
