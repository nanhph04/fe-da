import { StudioVideoPreviewFeature } from "@/features/studio-content";

interface StudioContentVideoPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export const metadata = {
  title: "Preview Video | Aura Studio",
};

export default async function StudioContentVideoPage({ params }: StudioContentVideoPageProps) {
  const { videoId } = await params;

  return <StudioVideoPreviewFeature videoId={videoId} />;
}
