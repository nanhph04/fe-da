import { TopUpSuccessFeature } from "@/features/wallet/components/TopUpSuccessFeature";

export const metadata = {
  title: "Top-up Successful - Velvet Gallery",
  description: "Your Aura Coins have been successfully added to your wallet.",
};

type TopUpSuccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumberParam(value: string | string[] | undefined) {
  const rawValue = getSingleQueryParam(value);

  if (!rawValue) {
    return undefined;
  }

  const parsed = Number(rawValue);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function TopUpSuccessPage({ searchParams }: TopUpSuccessPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <TopUpSuccessFeature
      amount={parseNumberParam(resolvedSearchParams?.amount)}
      bonusAmount={parseNumberParam(resolvedSearchParams?.bonus)}
      paidAmount={parseNumberParam(resolvedSearchParams?.paid)}
      packageName={getSingleQueryParam(resolvedSearchParams?.packageName)}
      referenceId={getSingleQueryParam(resolvedSearchParams?.referenceId)}
    />
  );
}
