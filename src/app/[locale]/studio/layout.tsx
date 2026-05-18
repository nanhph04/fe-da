import { requireStudioAccess } from "@/shared/auth/server";
import { StudioLayoutFeature } from "@/features/studio-layout";

export default async function RootStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStudioAccess("/studio");
  return <StudioLayoutFeature>{children}</StudioLayoutFeature>;
}
