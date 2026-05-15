import { EarningsOverview } from "@/features/studio-wallet/components/EarningsOverview";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Earnings Analytics | Studio Wallet | Velvet Gallery",
  description: "Track earnings, payout readiness, and monthly creator revenue trends.",
};

export default async function StudioEarningsPage() {
  await requireStudioAccess("/studio/wallet/earnings");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            Earnings Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review payout readiness, current monthly performance, and how revenue is moving across the studio.
          </p>
        </div>

        <EarningsOverview />
      </div>
    </div>
  );
}
