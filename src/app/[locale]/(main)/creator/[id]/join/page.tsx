import { notFound } from "next/navigation";
import { JoinMembershipFeature } from "@/features/membership";
import type { PublicApiError, PublicChannelDetail } from "@/features/watch/services/publicMediaService";
import { fetchServerApi } from "@/shared/api/server";
import { requireAuthenticatedUser } from "@/shared/auth/server";

interface JoinMembershipPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JoinMembershipPage({ params, searchParams }: JoinMembershipPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTierId = getSingleParam(resolvedSearchParams?.tier) ?? null;
  const user = await requireAuthenticatedUser(`/creator/${id}/join`);

  let channel: PublicChannelDetail;

  try {
    const channelResponse = await fetchServerApi<PublicChannelDetail>(
      `/api/media/channels/${id}`,
      { cache: "no-store" },
    );
    channel = channelResponse.data;
  } catch (err) {
    const apiError = err as PublicApiError;
    if ((apiError.statusCode ?? apiError.status ?? apiError.code) === 404) {
      notFound();
    }

    throw err;
  }

  return (
    <JoinMembershipFeature
      channel={channel}
      initialTierId={initialTierId}
      userId={user.userId}
    />
  );
}
