import { StudioPayoutsFeature } from "@/features/studio-wallet";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Withdrawal Management | Studio Wallet | Velvet Gallery",
  description: "Monitor studio withdrawal history.",
};

export default async function StudioPayoutsPage() {
  await requireStudioAccess("/studio/wallet/payouts");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
            Withdrawal Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review withdrawal processing and monitor completed creator payouts.
          </p>
        </div>

        <StudioPayoutsFeature />
      </div>
    </div>
  );
}
