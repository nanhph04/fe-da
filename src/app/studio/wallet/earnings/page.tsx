import { EarningsOverview } from "@/features/studio-wallet/components/EarningsOverview";
import type { EarningsSummary, MonthlyEarnings } from "@/features/studio-wallet/types/earnings.types";
import { fetchServerApi } from "@/shared/api/server";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Earnings Analytics | Studio Wallet | Velvet Gallery",
  description: "Track earnings, payout readiness, and monthly creator revenue trends.",
};

export default async function StudioEarningsPage() {
  await requireStudioAccess("/studio/wallet/earnings");

  const now = new Date();
  const [summaryResponse, monthlyResponse] = await Promise.all([
    fetchServerApi<EarningsSummary>("/api/studio/earnings/summary", {
      requireAuth: true,
      cache: "no-store",
    }),
    fetchServerApi<MonthlyEarnings>(
      `/api/studio/earnings/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
      {
        requireAuth: true,
        cache: "no-store",
      }
    ),
  ]);

  return (
    <div className="min-h-screen bg-[#0e0e10]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-[#f9f5f8]">
            Earnings Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Review payout readiness, current monthly performance, and how revenue is moving across the studio.
          </p>
        </div>

        <EarningsOverview
          initialSummary={summaryResponse.data}
          initialMonthly={monthlyResponse.data}
        />
      </div>
    </div>
  );
}
