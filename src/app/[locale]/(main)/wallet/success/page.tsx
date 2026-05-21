import { TopUpSuccessFeature } from "@/features/wallet/components/TopUpSuccessFeature";
import { getTranslations, setRequestLocale } from "next-intl/server";

type TopUpSuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: TopUpSuccessPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Wallet.TopUpSuccess" });

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

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

export default async function TopUpSuccessPage({ params, searchParams }: TopUpSuccessPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve(undefined),
  ]);
  setRequestLocale(locale);

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
