"use client";

interface FinanceStat {
  label: string;
  value: string;
  change?: string;
  icon: string;
}

interface Transaction {
  id: string;
  type: string;
  user: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
}

interface PayoutRequest {
  id: string;
  creator: string;
  amount: string;
  description: string;
}

const stats: FinanceStat[] = [
  { label: "Total Platform Revenue", value: "$1.2M", change: "+8%", icon: "account_balance_wallet" },
  { label: "Total Payouts Processed", value: "$850K", icon: "paid" },
  { label: "Active Subscriptions", value: "45,200", icon: "subscriptions" },
  { label: "Pending Payout Requests", value: "$12,400", icon: "pending_actions" },
];

const transactions: Transaction[] = [
  { id: "#TRX-882190", type: "Subscription", user: "Alex Rivera", amount: "$24.99", status: "completed", date: "Oct 28, 2023" },
  { id: "#TRX-882191", type: "Video Purchase", user: "Sarah Jenkins", amount: "$149.00", status: "pending", date: "Oct 28, 2023" },
  { id: "#TRX-882192", type: "Payout", user: "Marco Polo Studio", amount: "-$2,450.00", status: "completed", date: "Oct 27, 2023" },
  { id: "#TRX-882193", type: "Payout", user: "Creative Pixels", amount: "-$4,100.00", status: "failed", date: "Oct 27, 2023" },
];

const pendingPayouts: PayoutRequest[] = [
  { id: "1", creator: "Mega Creator Inc.", amount: "$5,400.00", description: "High-value payout request flagged for manual verification." },
  { id: "2", creator: "Urban Motion Ltd.", amount: "$1,850.00", description: "Standard creator payout cycle (Bi-weekly)." },
  { id: "3", creator: "The Tech Lab", amount: "$2,100.00", description: "Recurring creator partnership payout." },
];

const revenueData = [40, 55, 45, 70, 85, 100, 80, 65, 50, 75, 90, 60];
const months = ["JAN", "MAR", "MAY", "JUL", "SEP", "DEC"];

export function AdminFinanceFeature() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-white tracking-tight">Finance Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time platform revenue and payout oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-zinc-400">calendar_today</span>
            <span className="text-xs font-semibold text-zinc-300">Oct 1 - Oct 31, 2023</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-red-500/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-600/10 text-red-500 flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {stat.icon}
                </span>
              </div>
              {stat.change && (
                <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
                <p className="text-zinc-500 text-xs">Platform earnings over the last 12 months</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded uppercase">Daily</button>
                <button className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase">Monthly</button>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                <div className="border-t border-zinc-800 w-full"></div>
                <div className="border-t border-zinc-800 w-full"></div>
                <div className="border-t border-zinc-800 w-full"></div>
                <div className="border-t border-zinc-800 w-full"></div>
                <div className="border-t border-zinc-800 w-full"></div>
              </div>
              {revenueData.map((height, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm relative group transition-colors ${
                    i === revenueData.length - 1
                      ? "bg-red-600 border-t-2 border-red-500"
                      : "bg-red-600/20 hover:bg-red-600/40"
                  }`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${height}k
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2">
              {months.map((month) => (
                <span key={month} className="text-[10px] text-zinc-500 font-bold">{month}</span>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
              <div className="flex gap-2">
                <button className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-400">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                </button>
                <button className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-400">
                  <span className="material-symbols-outlined text-sm">download</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-950/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">User/Creator</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-900 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-zinc-400">{tx.id}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-zinc-200">{tx.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex-shrink-0"></div>
                          <span className="text-xs font-semibold text-white">{tx.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-xs font-bold ${tx.amount.startsWith("-") ? "text-red-500" : "text-white"}`}>
                          {tx.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : tx.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">Showing 10 of 1,245 transactions</span>
              <div className="flex gap-1">
                <button className="p-1 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-400">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-1 border border-zinc-800 rounded bg-zinc-800 text-white text-xs px-3 font-bold">1</button>
                <button className="p-1 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-400 text-xs px-3 font-bold">2</button>
                <button className="p-1 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-400">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Pending Approvals</h3>
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">3</span>
            </div>
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg hover:border-red-600/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <span className="material-symbols-outlined text-sm">account_balance</span>
                      </div>
                      <p className="text-xs font-bold text-white">{payout.creator}</p>
                    </div>
                    <span className="text-xs font-black text-red-500">{payout.amount}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mb-4 italic">{payout.description}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded transition-colors uppercase">
                      Approve
                    </button>
                    <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-[10px] font-bold rounded transition-colors uppercase">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-zinc-500 text-[10px] font-bold hover:text-white transition-colors border-t border-zinc-800 pt-4 uppercase">
              See All Approvals
            </button>
          </section>

          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Payment Gateway Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Stripe API</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-emerald-500">ACTIVE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">PayPal Connect</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-emerald-500">ACTIVE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Local Bank Swift</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] font-bold text-amber-500">LATENCY</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}