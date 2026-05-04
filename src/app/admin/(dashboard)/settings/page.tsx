import { AdminSettingsFeature } from "@/features/admin-settings";

export const metadata = {
  title: "Settings - Admin Console",
  description: "System settings for Velvet Gallery",
};

export default function SettingsPage() {
  return <AdminSettingsFeature />;
}
