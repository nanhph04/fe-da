import { redirect } from "next/navigation";
import { CheckoutFeature } from "@/features/wallet";
import type { DepositPackage } from "@/features/wallet/types/wallet.types";
import { fetchServerApi } from "@/shared/api/server";
import { requireAuthenticatedUser } from "@/shared/auth/server";

interface CheckoutPageProps {
  searchParams: Promise<{ pack?: string | string[] }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  await requireAuthenticatedUser("/wallet/checkout");

  const packParam = (await searchParams).pack;
  const packId = Array.isArray(packParam) ? packParam[0] : packParam;

  if (!packId) {
    redirect("/wallet");
  }

  const packagesResponse = await fetchServerApi<DepositPackage[]>(
    "/api/deposits/packages",
    {
      cache: "no-store",
    }
  );

  const selectedPackage = packagesResponse.data.find(
    pkg => pkg.id === packId || pkg.code === packId
  );

  if (!selectedPackage) {
    redirect("/wallet");
  }

  return <CheckoutFeature initialPackage={selectedPackage} />;
}
