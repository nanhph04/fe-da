import { AdminLayoutFeature } from "@/features/admin-layout";
import { requireAdminAccess } from "@/shared/auth/server";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAccess();

  return <AdminLayoutFeature>{children}</AdminLayoutFeature>;
}
