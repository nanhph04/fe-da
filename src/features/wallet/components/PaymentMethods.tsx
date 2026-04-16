export function PaymentMethods() {
  return (
    <aside className="space-y-8">
      <div>
        <h2 className="font-headline text-xl font-bold mb-6 text-[#f9f5f8]">Payment Methods</h2>
        <div className="space-y-3">
          
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#19191c] border border-[#fdc003]/30 group cursor-pointer transition-colors">
            <div className="w-12 h-12 rounded bg-[#fdc003]/10 flex items-center justify-center text-[#fdc003]">
              <span className="material-symbols-outlined text-3xl">credit_card</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Credit Card</p>
              <p className="text-xs text-zinc-400">Visa, Mastercard, JCB</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-[#fdc003] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#fdc003] rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900 hover:bg-[#19191c] border border-transparent group cursor-pointer transition-colors">
            <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white">
              <span className="material-symbols-outlined text-3xl">qr_code_2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">QR Pay</p>
              <p className="text-xs text-zinc-400">VNPAY, VietQR</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900 hover:bg-[#19191c] border border-transparent group cursor-pointer transition-colors">
            <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">E-wallet</p>
              <p className="text-xs text-zinc-400">Momo, ZaloPay, ShopeePay</p>
            </div>
          </div>

        </div>
      </div>

      <div className="p-6 rounded-lg bg-gradient-to-br from-zinc-900/50 to-black/50 border border-zinc-800">
        <div className="flex items-center gap-2 text-[#fdc003] mb-4">
          <span className="material-symbols-outlined text-sm">security</span>
          <span className="text-xs font-bold uppercase tracking-widest">Secure Transaction</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Your payment information is encrypted and processed through our secure banking partners. We do not store your credit card details.
        </p>
      </div>
    </aside>
  );
}
