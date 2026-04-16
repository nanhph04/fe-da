import { StudioLayoutFeature } from "@/features/studio-layout";

export default function RootStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioLayoutFeature>{children}</StudioLayoutFeature>;
}
