import { WalletDashboard } from "@/features/wallet";
import type { Transaction, Wallet, DepositPackage } from "@/features/wallet";
import { fetchServerApi } from "@/shared/api/server";
import { requireAuthenticatedUser } from "@/shared/auth/server";

export default async function WalletPage() {
  await requireAuthenticatedUser("/wallet");

  const [walletResponse, transactionsResponse, packagesResponse] = await Promise.all([
    fetchServerApi<Wallet>("/api/wallets/me", {
      requireAuth: true,
      cache: "no-store",
    }),
    fetchServerApi<Transaction[]>("/api/transactions/me", {
      requireAuth: true,
      cache: "no-store",
    }),
    fetchServerApi<DepositPackage[]>("/api/deposits/packages", {
      cache: "force-cache",
    }),
  ]);

  return (
    <WalletDashboard
      initialWallet={walletResponse.data}
      initialTransactions={transactionsResponse.data}
      initialPackages={packagesResponse.data}
    />
  );
}
