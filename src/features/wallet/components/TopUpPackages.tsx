"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DepositService } from "../services/depositService";
import type { DepositPackage } from "../types/wallet.types";

const walletNumberFormatter = new Intl.NumberFormat("vi-VN");

function formatWalletNumber(value: number) {
  return walletNumberFormatter.format(value);
}

interface TopUpPackagesProps {
  initialPackages?: DepositPackage[];
  onSelectPackage?: (depositPackage: DepositPackage) => void;
}

const sortPackages = (packages: DepositPackage[]) =>
  [...packages].sort((a, b) => a.sortOrder - b.sortOrder);

export function TopUpPackages({ initialPackages, onSelectPackage }: TopUpPackagesProps) {
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
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-headline text-xl font-bold text-foreground">Top-up Packages</h2>
        <Badge className="rounded-full bg-secondary/20 text-secondary-foreground text-xs font-bold uppercase tracking-tight hover:bg-secondary/30">
          Best Value
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, index) => {
          const isPopular = pkg.code.includes('PRO') || index === 2; // Temporary logic for popular highlighting
          return (
            <Card key={pkg.id} className={`group relative overflow-hidden border-border/20 bg-card/60 transition-all duration-300 hover:bg-card ${isPopular ? 'border-secondary/30 ring-1 ring-secondary/20 shadow-[0px_10px_30px_rgba(251,191,36,0.1)]' : ''}`}>
              {isPopular && (
                <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-secondary px-3 py-1 text-[10px] font-black uppercase text-secondary-foreground">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <h3 className="mb-1 font-headline text-lg font-bold text-foreground">{pkg.name}</h3>
                <p className="mb-4 text-2xl font-bold text-secondary">
                  {formatWalletNumber(pkg.totalCoinAmount)} AC
                  {pkg.bonusCoinAmount > 0 && <span className="ml-1 text-xs font-medium text-muted-foreground">+ {formatWalletNumber(pkg.bonusCoinAmount)} bonus</span>}
                </p>
                
                <div className="mb-6 h-32 flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-secondary/30 bg-gradient-to-br from-secondary/20 to-transparent transition-transform duration-500 group-hover:scale-110">
                    <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  </div>
                </div>

                <div className="mt-auto flex w-full flex-col gap-4 border-t border-white/5 pt-4">
                  <span className="font-headline text-lg font-bold text-foreground">{formatWalletNumber(pkg.moneyAmount)} VND</span>
                  <Button 
                    onClick={() => onSelectPackage?.(pkg)}
                    className={`w-full font-bold transition-colors active:scale-95 ${isPopular ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
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
