import { ProfileHeader } from "@/features/library/components/ProfileHeader";
import { RecentlyWatched } from "@/features/library/components/RecentlyWatched";
import { PurchasedLibrary } from "@/features/library/components/PurchasedLibrary";
import { Subscriptions } from "@/features/library/components/Subscriptions";
import { AccountActivity } from "@/features/library/components/AccountActivity";

export default function LibraryPage() {
  return (
    <main className="md:pl-64 pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-16">
        <ProfileHeader />
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
