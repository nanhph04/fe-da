"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { DepositService } from "../services/depositService";
import { DepositPackage } from "../types/wallet.types";

export function CheckoutFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [pkg, setPkg] = useState<DepositPackage | null>(null);
  const [loading, setLoading] = useState(true);

  const packId = searchParams?.get('pack');

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packId) {
        router.push("/wallet");
        return;
      }
      try {
        const packages = await DepositService.getDepositPackages();
        const found = packages.find(p => p.id === packId || p.code === packId);
        if (found) {
          setPkg(found);
        } else {
          router.push("/wallet");
        }
      } catch (error) {
        console.error("Failed to fetch package:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packId, router]);
  
  const handlePayment = async () => {
    if (!pkg) return;
    setIsProcessing(true);
    try {
      const deposit = await DepositService.createDeposit(pkg.id);
      if (deposit.checkoutUrl) {
        window.location.href = deposit.checkoutUrl;
      } else {
        router.push("/wallet/success"); // Fallback if no URL
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setIsProcessing(false);
      alert("Failed to create payment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-[#fdc003] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <main className="md:pl-64 max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row gap-12 min-h-screen">
      {/* Left Column: Package Summary */}
      <aside className="w-full md:w-1/3 flex flex-col gap-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#f9f5f8] font-headline">Order Summary</h2>
          <p className="text-zinc-400 leading-relaxed text-sm">
            Confirm your selection before proceeding to secure checkout. Bonus coins are applied instantly upon verification.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-[#19191c] rounded-xl p-8 border-l-4 border-[#fdc003] shadow-[0px_10px_30px_rgba(253,192,3,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <span className="text-[#fdc003] text-xs font-bold uppercase tracking-widest">Selected Package: {pkg.name}</span>
              <h3 className="text-4xl font-black text-[#f9f5f8] font-headline">{pkg.totalCoinAmount.toLocaleString()} AC</h3>
            </div>
            {pkg.bonusCoinAmount > 0 && (
              <div className="flex items-center gap-3 bg-[#785900]/20 py-2 px-4 rounded-lg w-fit">
                <span className="material-symbols-outlined text-[#fdc003] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <span className="text-[#fdc003] font-bold text-sm tracking-wide">+ {pkg.bonusCoinAmount.toLocaleString()} Bonus Coins</span>
              </div>
            )}
            <div className="pt-6 border-t border-[#48474a]/30 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-zinc-400 text-sm font-medium">Total Payable</p>
                <p className="text-2xl font-bold text-[#f9f5f8] font-headline">{pkg.moneyAmount.toLocaleString()} VND</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#131315] rounded-lg p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <span className="material-symbols-outlined text-[#ff7668] mt-1">verified_user</span>
            <div>
              <p className="font-bold text-[#f9f5f8] text-sm">Secure Transaction</p>
              <p className="text-zinc-400 text-xs">Encryption ensures your data remains private and protected.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="material-symbols-outlined text-[#ff7668] mt-1">schedule</span>
            <div>
              <p className="font-bold text-[#f9f5f8] text-sm">Instant Top-up</p>
              <p className="text-zinc-400 text-xs">Balance is updated as soon as the transfer is confirmed.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Checkout Area */}
      <section className="flex-1 space-y-8 relative">
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-[#131315]/80 backdrop-blur-sm rounded-xl flex items-center justify-center min-h-[500px]">
             <div className="text-center space-y-4 animate-in zoom-in duration-300">
               <div className="w-16 h-16 border-4 border-[#ff8e80] border-t-transparent rounded-full animate-spin mx-auto"></div>
               <h3 className="font-headline font-bold text-xl text-white">Redirecting to Payment Gateway...</h3>
               <p className="text-zinc-400 text-sm">Please do not close the window.</p>
             </div>
          </div>
        )}

        <div className={`bg-[#19191c] rounded-xl overflow-hidden shadow-2xl transition-all ${isProcessing ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
          <div className="bg-[#2c2c2f] px-8 py-4 flex justify-between items-center">
            <h3 className="font-bold text-[#f9f5f8] tracking-tight">Payment Method</h3>
            <div className="flex gap-2">
              <div className="h-6 px-3 bg-white/10 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-400">PayOS</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12 flex flex-col items-center justify-center gap-8 text-center min-h-[300px]">
            <div className="space-y-4 max-w-md">
              <span className="material-symbols-outlined text-6xl text-[#fdc003]">qr_code_scanner</span>
              <h4 className="text-2xl font-bold text-[#f9f5f8] font-headline">Pay with PayOS</h4>
              <p className="text-zinc-400 leading-relaxed text-sm">
                You will be redirected to the secure PayOS gateway to complete your payment using QR Code or bank transfer.
              </p>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full max-w-sm bg-gradient-to-br from-[#fdc003] to-[#e0a800] hover:from-[#e0a800] hover:to-[#cda000] py-8 text-[#553e00] font-black text-lg tracking-widest uppercase transition-all shadow-[0px_10px_30px_rgba(253,192,3,0.3)]"
            >
              <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>open_in_new</span>
              Proceed to Payment
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
