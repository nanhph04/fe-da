const ACTIVITIES = [
  {
    id: 1,
    title: "Unlocked Neon Dreams",
    time: "2 hours ago",
    amount: "- 50 AC",
    type: "spend",
    icon: "lock_open",
    iconColor: "text-[#ff8e80]",
    iconBg: "bg-[#ff8e80]/10"
  },
  {
    id: 2,
    title: "Topped up 100 AC",
    time: "Yesterday, 4:30 PM",
    amount: "+ 100 AC",
    type: "deposit",
    icon: "add_card",
    iconColor: "text-[#fdc003]",
    iconBg: "bg-[#fdc003]/10"
  },
  {
    id: 3,
    title: "Unlocked The Architect's Silence",
    time: "2 days ago",
    amount: "- 30 AC",
    type: "spend",
    icon: "lock_open",
    iconColor: "text-[#ff8e80]",
    iconBg: "bg-[#ff8e80]/10"
  },
  {
    id: 4,
    title: "Renewed CinemaLabs Sub",
    time: "Oct 24, 2023",
    amount: "Monthly",
    type: "subscription",
    icon: "autorenew",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10"
  }
];

export function AccountActivity() {
  return (
    <div className="lg:col-span-2 space-y-6">
      <h2 className="text-2xl font-headline font-bold text-[#f9f5f8]">Account Activity</h2>
      <div className="bg-[#131315] rounded-xl border border-[#48474a]/10 divide-y divide-[#48474a]/10 overflow-hidden">
        {ACTIVITIES.map((activity) => (
          <div key={activity.id} className="p-5 flex items-center justify-between hover:bg-[#19191c] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${activity.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${activity.iconColor}`}>{activity.icon}</span>
              </div>
              <div>
                <p className="font-headline font-bold text-[#f9f5f8]">{activity.title}</p>
                <p className="text-xs text-zinc-500">{activity.time}</p>
              </div>
            </div>
            <span className={`font-black ${activity.type === 'deposit' ? 'text-[#fdc003]' : activity.type === 'spend' ? 'text-[#ff8e80]' : 'text-zinc-400'}`}>
              {activity.amount}
            </span>
          </div>
        ))}
      </div>
      <button className="w-full py-4 text-sm font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
        View All Transactions
      </button>
    </div>
  );
}
