import { WithdrawFundsPageFeature } from "@/features/studio-wallet";
import type { StudioWallet } from "@/features/studio-wallet/types/studio-wallet.types";
import { fetchServerApi } from "@/shared/api/server";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Withdraw Funds | Studio Wallet | Velvet Gallery",
  description: "Create a creator payout request from your Studio Wallet balance.",
};

export default async function StudioWalletWithdrawPage() {
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
