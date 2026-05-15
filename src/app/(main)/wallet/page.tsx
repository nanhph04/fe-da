import { WalletDashboard } from "@/features/wallet";
import type { DepositPackage } from "@/features/wallet";
import { fetchServerApi } from "@/shared/api/server";
import { requireAuthenticatedUser } from "@/shared/auth/server";

export default async function WalletPage() {
  await requireAuthenticatedUser("/wallet");

  const packagesResponse = await fetchServerApi<DepositPackage[]>("/api/deposits/packages", {
    cache: "force-cache",
  });

  return <WalletDashboard initialPackages={packagesResponse.data} />;
}
