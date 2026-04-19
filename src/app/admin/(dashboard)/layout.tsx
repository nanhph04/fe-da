import { AdminLayoutFeature } from "@/features/admin-layout";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutFeature>{children}</AdminLayoutFeature>;
}
