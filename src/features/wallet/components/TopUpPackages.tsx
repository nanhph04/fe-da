"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DepositService } from "../services/depositService";
import type { DepositPackage } from "../types/wallet.types";

interface TopUpPackagesProps {
  initialPackages?: DepositPackage[];
}

const sortPackages = (packages: DepositPackage[]) =>
  [...packages].sort((a, b) => a.sortOrder - b.sortOrder);

export function TopUpPackages({ initialPackages }: TopUpPackagesProps) {
  const router = useRouter();
  const [packages, setPackages] = useState<DepositPackage[]>(
    initialPackages ? sortPackages(initialPackages) : []
  );
  const [loading, setLoading] = useState(!initialPackages);

  useEffect(() => {
    if (initialPackages) {
      return;
    }

    const fetchPackages = async () => {
      try {
        const data = await DepositService.getDepositPackages();
        setPackages(sortPackages(data));
      } catch (error) {
        console.error("Failed to fetch deposit packages:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchPackages();
  }, [initialPackages]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between mt-8">
          <div className="h-8 bg-zinc-800/50 w-48 rounded mb-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-zinc-800/50 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mt-8">
        <h2 className="font-headline text-xl font-bold text-[#f9f5f8]">Top-up Packages</h2>
        <Badge className="bg-[#785900] text-[#fff6ec] rounded-full text-xs font-bold uppercase tracking-tight hover:bg-[#785900]/80">
          Best Value
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, index) => {
          const isPopular = pkg.code.includes('PRO') || index === 2; // Temporary logic for popular highlighting
          return (
            <Card key={pkg.id} className={`group bg-zinc-950/40 border-[#48474a]/20 hover:bg-[#19191c] transition-all duration-300 relative overflow-hidden ${isPopular ? 'border-[#fdc003]/30 ring-1 ring-[#fdc003]/20 shadow-[0px_10px_30px_rgba(253,192,3,0.1)]' : ''}`}>
              {isPopular && (
                <div className="absolute top-0 right-0 bg-[#fdc003] text-[#553e00] px-3 py-1 rounded-bl-lg text-[10px] font-black uppercase z-10">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <h3 className="font-headline font-bold text-lg mb-1 text-white">{pkg.name}</h3>
                <p className="text-[#fdc003] font-bold text-2xl mb-4">
                  {pkg.totalCoinAmount.toLocaleString()} AC
                  {pkg.bonusCoinAmount > 0 && <span className="text-xs text-[#adaaad] font-medium ml-1">+ {pkg.bonusCoinAmount} bonus</span>}
                </p>
                
                <div className="mb-6 h-32 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fdc003]/20 to-transparent border border-[#fdc003]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-4xl text-[#fdc003]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  </div>
                </div>

                <div className="mt-auto w-full pt-4 border-t border-white/5 flex flex-col gap-4">
                  <span className="font-headline font-bold text-lg text-white">{pkg.moneyAmount.toLocaleString()} VND</span>
                  <Button 
                    onClick={() => router.push(`/wallet/checkout?pack=${pkg.id}`)}
                    className={`w-full font-bold transition-colors active:scale-95 ${isPopular ? 'bg-[#fdc003] hover:bg-[#ecb200] text-[#553e00]' : 'bg-[#ff8e80] hover:bg-[#e80f16] text-[#650003]'}`}
                  >
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
