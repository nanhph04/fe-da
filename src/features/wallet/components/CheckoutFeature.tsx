"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export function CheckoutFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // In a real app, we'd fetch package details by ID. Mocking here.
  const packId = searchParams?.get('pack') || "1";
  
  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API Call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Simulate Success Delay and redirect back to wallet
      setTimeout(() => {
        router.push("/wallet");
      }, 2000);
    }, 2000);
  };

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
              <span className="text-[#fdc003] text-xs font-bold uppercase tracking-widest">Selected Package ID: {packId}</span>
              <h3 className="text-4xl font-black text-[#f9f5f8] font-headline">5,000 AC</h3>
            </div>
            <div className="flex items-center gap-3 bg-[#785900]/20 py-2 px-4 rounded-lg w-fit">
              <span className="material-symbols-outlined text-[#fdc003] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="text-[#fdc003] font-bold text-sm tracking-wide">+ 300 Bonus Coins</span>
            </div>
            <div className="pt-6 border-t border-[#48474a]/30 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-zinc-400 text-sm font-medium">Total Payable</p>
                <p className="text-2xl font-bold text-[#f9f5f8] font-headline">5.000.000 VND</p>
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
        
        {/* Processing / Success Overlay */}
        {(isProcessing || isSuccess) && (
          <div className="absolute inset-0 z-50 bg-[#131315]/80 backdrop-blur-sm rounded-xl flex items-center justify-center min-h-[500px]">
             <div className="text-center space-y-4 animate-in zoom-in duration-300">
               {isProcessing ? (
                 <>
                   <div className="w-16 h-16 border-4 border-[#ff8e80] border-t-transparent rounded-full animate-spin mx-auto"></div>
                   <h3 className="font-headline font-bold text-xl text-white">Processing Payment...</h3>
                 </>
               ) : (
                 <>
                   <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                     <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                   </div>
                   <h3 className="font-headline font-bold text-xl text-white pt-2">Payment Successful!</h3>
                   <p className="text-zinc-400 text-sm">Updating your wallet...</p>
                 </>
               )}
             </div>
          </div>
        )}

        {/* QR Code Section */}
        <div className={`bg-[#19191c] rounded-xl overflow-hidden shadow-2xl transition-all ${isProcessing || isSuccess ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
          <div className="bg-[#2c2c2f] px-8 py-4 flex justify-between items-center">
            <h3 className="font-bold text-[#f9f5f8] tracking-tight">Scan to Pay</h3>
            <div className="flex gap-2">
              <div className="h-6 w-12 bg-white/10 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-400">VNPAY</span>
              </div>
              <div className="h-6 w-12 bg-white/10 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-400">MOMO</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="bg-white p-6 rounded-xl shadow-inner relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-48 h-48 md:w-60 md:h-60" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQoRry4xDfdwjeuMJgrunCAs2kXN_RtSMXTG_ykX7fd4_0_5NqQKjGUlJvpEzWjyXMLNTyU-Kozj0NULShMePzB9Nd3YzBQZ6dVvAxP5K0fZRC6XnS955Aico9RjOg3KlVA7-FNbHsvCNLUlZD7r0n9roodquQ3tFvQbt9LoRofYNFvljVv0_r-yOvV3m92Qdwf-i0gSHebxpNUtccgVK4cihx7n35i_7M97PxvzshsE7xYDcoIcl6AitLv5TNd_2uxGFa2L-1TMSI" 
                alt="Payment QR Code" 
              />
              <div className="absolute inset-0 border-2 border-[#ff7668]/20 rounded-xl pointer-events-none group-hover:border-[#ff7668]/50 transition-colors"></div>
            </div>
            
            <div className="space-y-6 flex-1 text-center md:text-left">
              <h4 className="text-2xl font-bold text-[#f9f5f8] font-headline">Mobile Payment</h4>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Open your banking or e-wallet app (MoMo, VNPAY, or ZaloPay) and scan the QR code to complete the payment automatically.
              </p>
              
              <div className="flex flex-col xl:flex-row gap-4 pt-2">
                <div className="flex items-center justify-center md:justify-start gap-3 bg-[#1f1f22] p-3 rounded-lg">
                  <span className="material-symbols-outlined text-[#ff7668]">qr_code_scanner</span>
                  <span className="text-xs font-medium">Automatic Amount Detection</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 bg-[#1f1f22] p-3 rounded-lg">
                  <span className="material-symbols-outlined text-[#ff7668]">bolt</span>
                  <span className="text-xs font-medium">Fast Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Transfer Details */}
        <div className={`bg-[#131315] rounded-xl p-8 space-y-8 transition-all ${isProcessing || isSuccess ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between border-b border-[#48474a]/20 pb-4">
            <h3 className="font-bold text-xl text-[#f9f5f8]">Manual Bank Transfer</h3>
            <span className="text-xs bg-[#262528] px-3 py-1 rounded text-zinc-400 font-bold tracking-wider">SECURE LINK</span>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bank Name</label>
              <div className="flex items-center justify-between group cursor-pointer">
                <p className="text-lg font-bold text-[#f9f5f8]">Global Merchant Bank (GMB)</p>
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors text-sm">content_copy</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account Holder</label>
              <div className="flex items-center justify-between group cursor-pointer">
                <p className="text-lg font-bold text-[#f9f5f8]">THE VELVET GALLERY CO.</p>
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors text-sm">content_copy</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account Number</label>
              <div className="flex items-center justify-between group cursor-pointer">
                <p className="text-2xl font-black text-[#f9f5f8] tracking-wider font-headline">9900 8877 6655</p>
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors text-sm">content_copy</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</label>
              <div className="flex items-center justify-between group cursor-pointer">
                <p className="text-2xl font-black text-[#ff7668] font-headline">5.000.000 VND</p>
                <span className="material-symbols-outlined text-zinc-400 group-hover:text-[#ff8e80] transition-colors text-sm">content_copy</span>
              </div>
            </div>
          </div>
          
          {/* Memo Code */}
          <div className="bg-[#262528] p-6 rounded-lg border-2 border-dashed border-[#48474a]/50 relative mt-8">
            <div className="absolute -top-3 left-6 bg-[#131315] px-2">
              <span className="text-[10px] font-black text-[#fdc003] tracking-tighter uppercase">Required Transfer Memo</span>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#f9f5f8] tracking-widest font-headline">VELVET77892</p>
                <p className="text-xs text-[#ff6e84] font-medium">Must be included exactly in the transfer content</p>
              </div>
              <Button variant="secondary" className="bg-[#2c2c2f] hover:bg-[#262528] text-white">
                <span className="material-symbols-outlined text-sm mr-2">content_copy</span>
                Copy Memo
              </Button>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-br from-[#ff8e80] to-[#ff7668] hover:from-[#ff7668] hover:to-[#ff5b4c] py-8 text-[#650003] font-black text-lg tracking-widest uppercase transition-all shadow-[0px_10px_30px_rgba(255,142,128,0.3)]"
            >
              <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              I have paid
            </Button>
            <p className="text-center text-zinc-400 text-xs">
              By clicking "I have paid", our system will begin the automated verification of your transfer.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}
