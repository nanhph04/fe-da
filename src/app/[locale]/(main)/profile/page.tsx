import { ProfileFeature } from "@/features/profile";
import { requireMainAccess } from "@/shared/auth/server";
import { getTranslations, setRequestLocale } from "next-intl/server";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProfilePage.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireMainAccess("/profile");

  return <ProfileFeature initialUser={user} />;
}
