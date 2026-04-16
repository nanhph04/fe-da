import { HeroProfile } from "./HeroProfile";
import { AccountInfo } from "./AccountInfo";
import { WalletHistoryMini } from "./WalletHistoryMini";
import { ActiveMemberships } from "./ActiveMemberships";

export function ProfileFeature() {
  return (
    <main className="md:pl-64 pt-24 pb-12 px-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        <HeroProfile />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <AccountInfo />
            <WalletHistoryMini />
          </div>
          
          <div className="lg:col-span-5">
            <ActiveMemberships />
          </div>
        </div>
      </div>
    </main>
  );
}
