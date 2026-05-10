import { StudioWalletDashboard } from "@/features/studio-wallet/components/StudioWalletDashboard";
import type { StudioWallet, WalletStats } from "@/features/studio-wallet/types/studio-wallet.types";
import { fetchServerApi } from "@/shared/api/server";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Studio Wallet | Velvet Gallery",
  description: "Manage studio earnings, track balance, and request creator payouts.",
};

export default async function StudioWalletPage() {
  await requireStudioAccess("/studio/wallet");

  const [walletResponse, statsResponse] = await Promise.all([
    fetchServerApi<StudioWallet>("/api/studio/wallet/me", {
      requireAuth: true,
      cache: "no-store",
    }),
    fetchServerApi<WalletStats>("/api/studio/wallet/stats", {
      requireAuth: true,
      cache: "no-store",
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <StudioWalletDashboard
          initialWallet={walletResponse.data}
          initialStats={statsResponse.data}
        />
      </div>
    </div>
  );
}
