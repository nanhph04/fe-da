import { WatchVideoFeature } from "@/features/watch/components/WatchVideoFeature";

interface WatchPageProps {
  params: {
    videoId: string;
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  return <WatchVideoFeature videoId={params.videoId} />;
}
