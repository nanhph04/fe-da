import { AdminContentPolicyEditorFeature } from "@/features/admin-settings";

export const metadata = {
  title: "Content Policies - Admin Console",
  description: "Configure content policy levels for Velvet Gallery",
};

export default function AdminContentPoliciesPage() {
  return <AdminContentPolicyEditorFeature />;
}
