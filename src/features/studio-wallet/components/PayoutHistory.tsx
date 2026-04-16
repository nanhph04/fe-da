const PAYOUTS = [
  { id: "TRX-8921", date: "Oct 12, 2024", amount: "150,000 AC", status: "Completed", method: "Techcombank **** 8829" },
  { id: "TRX-7842", date: "Sep 28, 2024", amount: "220,000 AC", status: "Completed", method: "Techcombank **** 8829" },
  { id: "TRX-6102", date: "Sep 15, 2024", amount: "50,000 AC", status: "Failed", method: "PayPal alex.design@..." },
  { id: "TRX-5531", date: "Aug 30, 2024", amount: "400,000 AC", status: "Completed", method: "Techcombank **** 8829" },
];

export function PayoutHistory() {
  return (
    <div className="bg-[#131315] rounded-xl border border-[#262528] p-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-headline text-white">Payout History</h3>
        <button className="text-sm font-bold text-[#ff8e80] hover:underline">Download CSV</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#262528]">
              <th className="py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest w-1/4">Transaction ID</th>
              <th className="py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest w-1/4">Date</th>
              <th className="py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest w-1/4">Method</th>
              <th className="py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest w-1/6">Amount</th>
              <th className="py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest w-1/6 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {PAYOUTS.map((item) => (
              <tr key={item.id} className="border-b border-[#262528]/50 hover:bg-[#19191c] transition-colors">
                <td className="py-4 text-sm font-bold text-[#ff8e80]">{item.id}</td>
                <td className="py-4 text-sm text-zinc-300">{item.date}</td>
                <td className="py-4 text-sm text-zinc-400">{item.method}</td>
                <td className="py-4 text-sm font-bold text-[#fdc003]">{item.amount}</td>
                <td className="py-4 text-right">
                  <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                    item.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
