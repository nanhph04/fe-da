"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TransactionService } from "../services/transactionService";
import type { Transaction } from "../types/wallet.types";

interface TransactionHistoryProps {
  initialTransactions?: Transaction[];
}

const sortTransactions = (transactions: Transaction[]) =>
  [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

export function TransactionHistory({
  initialTransactions,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions ? sortTransactions(initialTransactions) : []
  );
  const [loading, setLoading] = useState(!initialTransactions);

  useEffect(() => {
    if (initialTransactions) {
      return;
    }

    const fetchTransactions = async () => {
      try {
        const data = await TransactionService.getMyTransactions();
        setTransactions(sortTransactions(data));
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchTransactions();
  }, [initialTransactions]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  };

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
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-zinc-500">Amount</th>
                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-zinc-300">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#fdc003]/10 flex items-center justify-center text-[#fdc003]">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {tx.type === 'DEPOSIT' ? 'add_circle' : (tx.type === 'WITHDRAWAL' ? 'account_balance' : 'receipt_long')}
                          </span>
                        </div>
                        <span className="font-bold text-white">{tx.description || tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`font-headline font-bold ${['DEPOSIT', 'CHANNEL_REVENUE', 'SYSTEM_REVENUE'].includes(tx.type) ? 'text-[#fdc003]' : 'text-zinc-300'}`}>
                        {['DEPOSIT', 'CHANNEL_REVENUE', 'SYSTEM_REVENUE'].includes(tx.type) ? '+' : '-'}{tx.amount.toLocaleString()} {tx.assetType}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {tx.status === 'COMPLETED' ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold border-0">Successful</Badge>
                      ) : tx.status === 'PENDING' ? (
                        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold border-0">Pending</Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold border-0">Failed</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
