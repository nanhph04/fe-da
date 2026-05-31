import { CategoryManagementFeature } from "@/features/admin-content/components/CategoryManagementFeature";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.content.taxonomy.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CategoryManagementFeature />;
}
