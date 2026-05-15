import { ProfileFeature } from "@/features/profile";
import { requireAuthenticatedUser } from "@/shared/auth/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ | Velvet Gallery",
  description: "Quản lý thông tin hồ sơ của bạn.",
};

export default async function ProfilePage() {
  const user = await requireAuthenticatedUser("/profile");

  return <ProfileFeature initialUser={user} />;
}
