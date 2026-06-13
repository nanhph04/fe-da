import { redirect } from "next/navigation";
import { requireStudioAccess } from "@/shared/auth/server";

export default async function StudioMembershipTierEditorPage() {
  await requireStudioAccess("/studio/memberships/edit");
  redirect("/studio/memberships");
}
