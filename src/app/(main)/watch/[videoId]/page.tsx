import { WatchVideoFeature } from "@/features/watch/components/WatchVideoFeature";

interface WatchPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  return <WatchVideoFeature videoId={videoId} />;
}
