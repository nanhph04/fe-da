import { WithdrawFundsPageFeature } from "@/features/studio-wallet";
import type { StudioWallet } from "@/features/studio-wallet/types/studio-wallet.types";
import { fetchServerApi } from "@/shared/api/server";
import { requireStudioAccess } from "@/shared/auth/server";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio.wallet.withdrawMetadata" });
  return {
    title: `${t("title")} | Studio Wallet | Velvet Gallery`,
    description: t("description"),
  };
}

export default async function StudioWalletWithdrawPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireStudioAccess("/studio/wallet/withdraw");

  const walletResponse = await fetchServerApi<StudioWallet>("/api/studio/wallet/me", {
    requireAuth: true,
    cache: "no-store",
  });

  return (
    <div className="min-h-screen bg-background">
      <WithdrawFundsPageFeature initialWallet={walletResponse.data} />
    </div>
  );
}
