"use client";

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

  if (isLoading) return null;

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-20 md:pl-64">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-border/20 bg-card p-8 text-center">
           <span className="material-symbols-outlined text-zinc-600 text-6xl">video_library</span>
           <div className="space-y-2">
              <h2 className="font-headline text-2xl font-bold text-foreground">Your Personal Library</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your purchased movies, subscriptions, and viewing history.</p>
            </div>
            <Link href="/login" className="block w-full">
              <Button className="w-full bg-primary font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                Sign In Now
              </Button>
            </Link>
        </div>
      </main>
    );
  }

  // To do a Tab Navigation, we'll keep it simple for now, rendering them directly
  // or we could add local state to switch. The design has them all on dashboard.
  return (
    <main className="min-h-screen bg-background pt-20 md:pl-64">
      <div className="mx-auto max-w-7xl space-y-16 px-8 py-12 animate-in fade-in duration-500">
        <ProfileHeader />
        
        {/* Fake Library Tabs Navigation - Mock */}
        <div className="flex items-center gap-6 border-b border-border/20 pb-4">
          <button className="-mb-[18px] border-b-2 border-primary pb-4 font-headline text-sm font-bold uppercase tracking-widest text-primary">
             Dashboard
           </button>
           <button className="-mb-[18px] pb-4 font-headline text-sm font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-white">
             Purchased
           </button>
           <button className="-mb-[18px] pb-4 font-headline text-sm font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-white">
             History
           </button>
         </div>

        <RecentlyWatched />
        <PurchasedLibrary />
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <Subscriptions />
          <AccountActivity />
        </section>
      </div>
    </main>
  );
}
