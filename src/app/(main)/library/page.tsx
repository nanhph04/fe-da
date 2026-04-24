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
      <main className="md:pl-64 pt-20 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-[#111] rounded-xl border border-[#222]">
           <span className="material-symbols-outlined text-zinc-600 text-6xl">video_library</span>
           <div className="space-y-2">
             <h2 className="text-2xl font-bold font-headline text-white">Your Personal Library</h2>
             <p className="text-zinc-400 text-sm">Sign in to access your purchased movies, subscriptions, and viewing history.</p>
           </div>
           <Link href="/login" className="block w-full">
             <Button className="w-full bg-[#ff8e80] text-black font-bold uppercase tracking-widest hover:bg-[#ff7668]">
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
    <main className="md:pl-64 pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-16 animate-in fade-in duration-500">
        <ProfileHeader />
        
        {/* Fake Library Tabs Navigation - Mock */}
        <div className="flex items-center gap-6 border-b border-[#222] pb-4">
          <button className="text-[#ff8e80] border-b-2 border-[#ff8e80] font-headline font-bold text-sm uppercase tracking-widest pb-4 -mb-[18px]">
             Dashboard
          </button>
          <button className="text-zinc-500 hover:text-white font-headline font-bold text-sm uppercase tracking-widest pb-4 -mb-[18px] transition-colors">
             Purchased
          </button>
          <button className="text-zinc-500 hover:text-white font-headline font-bold text-sm uppercase tracking-widest pb-4 -mb-[18px] transition-colors">
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
