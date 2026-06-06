import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/features/legal";

const sectionKeys = ["accounts", "contentAccess", "responsibilities"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal.termsOfService" });

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Legal.termsOfService" });
  const tShared = await getTranslations({ locale, namespace: "Legal.shared" });

  return (
    <LegalPage
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      updatedLabel={tShared("updatedLabel")}
      updatedAt={tShared("updatedAt")}
      backHomeLabel={tShared("backHome")}
      sections={sectionKeys.map((key) => ({
        title: t(`sections.${key}.title`),
        body: t(`sections.${key}.body`),
      }))}
    />
  );
}
