import { StudioWalletFeature } from "@/features/studio-wallet";
import { requireStudioAccess } from "@/shared/auth/server";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio.wallet.metadata" });
  return {
    title: `${t("title")} | Velvet Gallery`,
    description: t("description"),
  };
}

export default async function StudioWalletPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireStudioAccess("/studio/wallet");

  return (
    <div className="min-h-screen bg-background">
      <StudioWalletFeature />
    </div>
  );
}
