import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/main/TopNav";
import { SideNav } from "@/components/layout/main/SideNav";
import { MobileNav } from "@/components/layout/main/MobileNav";
import { ProfileGuard } from "@/components/guards/ProfileGuard";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#0e0e10] text-[#f9f5f8] selection:bg-[#ff8e80] selection:text-[#650003] min-h-screen">
      <TopNav />
      <SideNav />
      
      {/* Content Canvas */}
      <ProfileGuard>
        {children}
      </ProfileGuard>
      
      <MobileNav />
    </div>
  );
}
