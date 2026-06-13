import { Suspense } from "react";
import { StudioContentFeature } from "@/features/studio-content";
import { requireStudioAccess } from "@/shared/auth/server";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio.content" });
  return {
    title: `${t("title")} | Aura Studio`,
  };
}

export default async function StudioContentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStudioAccess("/studio/content");

  const t = await getTranslations({ locale, namespace: "Studio.content" });

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">{t("empty.loading")}</div>}>
      <StudioContentFeature />
    </Suspense>
  );
}
