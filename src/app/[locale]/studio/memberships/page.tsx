import { StudioMembershipFeature } from "@/features/studio-membership";
import { requireStudioAccess } from "@/shared/auth/server";

export default async function StudioMembershipPage() {
  await requireStudioAccess("/studio/memberships");

  return <StudioMembershipFeature />;
}
