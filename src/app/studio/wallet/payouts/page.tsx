import { PayoutHistory } from "@/features/studio-wallet/components/PayoutHistory";
import type {
  PaymentMethod,
  Payout,
  PayoutSummary,
} from "@/features/studio-wallet/types/payout.types";
import { fetchServerApi } from "@/shared/api/server";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Payout Management | Studio Wallet | Velvet Gallery",
  description: "Manage payment methods and monitor studio payout history.",
};

export default async function StudioPayoutsPage() {
  await requireStudioAccess("/studio/wallet/payouts");

  const [historyResponse, methodsResponse, summaryResponse] = await Promise.all([
    fetchServerApi<{
      payouts: Payout[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>("/api/studio/payouts?page=1&limit=10", {
      requireAuth: true,
      cache: "no-store",
    }),
    fetchServerApi<PaymentMethod[]>("/api/studio/payout-methods", {
      requireAuth: true,
      cache: "no-store",
    }),
    fetchServerApi<PayoutSummary>("/api/studio/payouts/summary", {
      requireAuth: true,
      cache: "no-store",
    }),
  ]);

  const defaultMethod = methodsResponse.data.find(method => method.isDefault) ?? null;

  return (
    <div className="min-h-screen bg-[#0e0e10]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-[#f9f5f8]">
            Payout Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Review payout processing, verify the default withdrawal method, and monitor payout totals.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard label="Pending" value={summaryResponse.data.totalPending.toLocaleString()} />
          <SummaryCard label="Completed" value={summaryResponse.data.totalCompleted.toLocaleString()} />
          <SummaryCard
            label="Default Method"
            value={defaultMethod?.type || "Not configured"}
          />
        </div>

        <PayoutHistory
          initialItems={historyResponse.data.payouts}
          initialPagination={historyResponse.data.pagination}
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/80 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
