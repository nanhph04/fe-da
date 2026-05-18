import { ChannelPage } from "@/features/channel";

interface ChannelRouteProps {
  params: Promise<{
    channelId: string;
  }>;
}

export default async function ChannelRoute({ params }: ChannelRouteProps) {
  const { channelId } = await params;
  return <ChannelPage channelId={channelId} />;
}
