import { StudioWalletFeature } from "@/features/studio-wallet";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Studio Wallet | Velvet Gallery",
  description: "Manage studio earnings, track balance, and request creator payouts.",
};

export default async function StudioWalletPage() {
  await requireStudioAccess("/studio/wallet");

  return (
    <div className="min-h-screen bg-background">
      <StudioWalletFeature />
    </div>
  );
}
