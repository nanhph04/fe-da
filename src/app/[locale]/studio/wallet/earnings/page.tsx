import { EarningsOverview } from "@/features/studio-wallet/components/EarningsOverview";
import { requireStudioAccess } from "@/shared/auth/server";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio.wallet.earningsMetadata" });
  return {
    title: `${t("title")} | Studio Wallet | Velvet Gallery`,
    description: t("description"),
  };
}

export default async function StudioEarningsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireStudioAccess("/studio/wallet/earnings");
  const t = await getTranslations({ locale, namespace: "Studio.wallet.analytics" });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <EarningsOverview />
      </div>
    </div>
  );
}
