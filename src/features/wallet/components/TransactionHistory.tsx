import { Badge } from "@/components/ui/badge";

const TRANSACTIONS = [
  { id: 1, date: "May 12, 2024", desc: "Standard Pack (500 AC)", method: "Credit Card •••• 4242", amount: "450,000 VND", status: "success" },
  { id: 2, date: "May 01, 2024", desc: "Starter Pack (100 AC)", method: "Momo Wallet", amount: "100,000 VND", status: "success" },
  { id: 3, date: "April 24, 2024", desc: "Pro Pack (1,000 AC)", method: "Credit Card •••• 4242", amount: "900,000 VND", status: "failed" },
];

export function TransactionHistory() {
  return (
    <section className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline text-2xl font-bold text-white">Transaction History</h2>
        <button className="text-sm font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
          View All <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800">
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-zinc-500">Date</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-zinc-500">Description</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-zinc-500">Method</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-zinc-500">Amount</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-5 text-sm font-medium text-zinc-300">{tx.date}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#fdc003]/10 flex items-center justify-center text-[#fdc003]">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                      </div>
                      <span className="font-bold text-white">{tx.desc}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-zinc-400">{tx.method}</td>
                  <td className="px-6 py-5">
                    <span className="font-headline font-bold text-[#fdc003]">{tx.amount}</span>
                  </td>
                  <td className="px-6 py-5">
                    {tx.status === 'success' ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold border-0">Successful</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold border-0">Failed</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
