import { ProfileFeature } from "@/features/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ | Velvet Gallery",
  description: "Quản lý thông tin hồ sơ của bạn.",
};

export default function ProfilePage() {
  return <ProfileFeature />;
}
