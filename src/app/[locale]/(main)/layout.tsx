import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/main/TopNav";
import { SideNav } from "@/components/layout/main/SideNav";
import { MobileNav } from "@/components/layout/main/MobileNav";
import { ProfileGuard } from "@/components/guards/ProfileGuard";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
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
