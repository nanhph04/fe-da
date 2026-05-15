import { AdminLoginFeature } from "@/features/admin-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Velvet Gallery",
  description: "Authenticate to access the Velvet Gallery admin console.",
};

export default function AdminLoginPage() {
  return <AdminLoginFeature />;
}
