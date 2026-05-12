"use client";

import { useEffect, useState } from "react";
import { ProfileHeader } from "@/features/library/components/ProfileHeader";
import { RecentlyWatched } from "@/features/library/components/RecentlyWatched";
import { PurchasedLibrary } from "@/features/library/components/PurchasedLibrary";
import { Subscriptions } from "@/features/library/components/Subscriptions";
import { AccountActivity } from "@/features/library/components/AccountActivity";
import { useAuth } from "@/features/auth/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LibraryPage() {
  const { user, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refreshLibrary = () => setRefreshKey(value => value + 1);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshLibrary();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshLibrary();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (isLoading) return null;

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-20 md:pl-64">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-border/20 bg-card p-8 text-center">
           <span className="material-symbols-outlined text-zinc-600 text-6xl">video_library</span>
           <div className="space-y-2">
               <h2 className="font-headline text-2xl font-bold text-foreground">Thư viện cá nhân</h2>
               <p className="text-sm text-muted-foreground">Đăng nhập để truy cập video đã mua, gói hội viên và lịch sử xem của bạn.</p>
            </div>
            <Link href="/login" className="block w-full">
              <Button className="w-full bg-primary font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                 Đăng nhập ngay
              </Button>
            </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-20 md:pl-64">
      <div className="mx-auto max-w-7xl space-y-16 px-8 py-12 animate-in fade-in duration-500">
        <ProfileHeader refreshKey={refreshKey} />
        
        <div className="flex items-center gap-6 border-b border-border/20 pb-4">
          <span className="-mb-[18px] border-b-2 border-primary pb-4 font-headline text-sm font-bold uppercase tracking-widest text-primary">
             Tổng quan
           </span>
           <span className="-mb-[18px] pb-4 font-headline text-sm font-bold uppercase tracking-widest text-zinc-500">
             Dữ liệu thật + trạng thái đang phát triển
           </span>
         </div>

        <RecentlyWatched refreshKey={refreshKey} />
        <PurchasedLibrary refreshKey={refreshKey} />
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <Subscriptions refreshKey={refreshKey} />
          <AccountActivity refreshKey={refreshKey} />
        </section>
      </div>
    </main>
  );
}
