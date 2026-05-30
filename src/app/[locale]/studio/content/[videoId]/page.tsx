import { StudioVideoPreviewFeature } from "@/features/studio-content";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface StudioContentVideoPageProps {
  params: Promise<{
    locale: string;
    videoId: string;
  }>;
}

export async function generateMetadata({ params }: StudioContentVideoPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio.content.preview" });
  return {
    title: `${t("title")} | Aura Studio`,
  };
}

export default async function StudioContentVideoPage({ params }: StudioContentVideoPageProps) {
  const { locale, videoId } = await params;
  setRequestLocale(locale);

  return <StudioVideoPreviewFeature videoId={videoId} />;
}
