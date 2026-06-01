import { StudioChannelFeature } from "@/features/studio-channel";
import { requireStudioAccess } from "@/shared/auth/server";

export const metadata = {
  title: "Kênh của tôi | Creator Studio",
  description: "Xem và quản lý thông tin kênh, video công khai, membership, và trạng thái kênh.",
};

export default async function StudioChannelPage() {
  await requireStudioAccess("/studio/channel");

  return (
    <div className="mx-auto w-full max-w-7xl p-8 animate-in fade-in duration-500">
      <StudioChannelFeature />
    </div>
  );
}
