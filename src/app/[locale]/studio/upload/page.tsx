import { StudioUploadFeature } from "@/features/studio-upload";
import { requireStudioAccess } from "@/shared/auth/server";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio.navigation" });
  return {
    title: `${t("upload")} | Aura Studio`,
  };
}

export default async function StudioUploadPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStudioAccess("/studio/upload");

  return <StudioUploadFeature />;
}
