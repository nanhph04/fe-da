import { StudioDashboardFeature } from "@/features/studio-dashboard";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Studio Dashboard | Velvet Gallery",
  description: "Track creator channel health, revenue, and content performance.",
};

export default async function StudioDashboardPage() {
  await requireStudioAccess("/studio");

  return <StudioDashboardFeature />;
}
