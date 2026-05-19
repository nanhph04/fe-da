import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/main/TopNav";
import { SideNav } from "@/components/layout/main/SideNav";
import { MobileNav } from "@/components/layout/main/MobileNav";
import { ProfileGuard } from "@/components/guards/ProfileGuard";
import { getCategoriesCached } from "@/features/watch/services/publicMediaService";

type MainLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

async function getNavigationCategories() {
  const response = await getCategoriesCached().catch(() => null);

  return response?.success ? response.data ?? [] : [];
}

export default async function MainLayout({ children, params }: MainLayoutProps) {
  const [{ locale }, categories] = await Promise.all([
    params,
    getNavigationCategories(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <TopNav categories={categories} searchAction={`/${locale}/search`} />
      <SideNav />
      
      {/* Content Canvas */}
      <ProfileGuard>
        {children}
      </ProfileGuard>
      
      <MobileNav />
    </div>
  );
}
