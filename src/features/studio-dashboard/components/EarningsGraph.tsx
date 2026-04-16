export function EarningsGraph() {
  return (
    <div className="bg-[#131315] rounded-sm p-8 flex flex-col relative overflow-hidden flex-1 border border-[#262528]">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-xl font-headline font-bold text-[#f9f5f8]">Earnings Growth</h2>
          <p className="text-sm text-zinc-400 mt-1">Growth of Aura Coins over the last 30 days</p>
        </div>
        <select className="bg-[#19191c] border-none text-xs rounded-sm font-headline py-2 px-4 text-[#f9f5f8] outline-none appearance-none cursor-pointer">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Year to Date</option>
        </select>
      </div>

      <div className="w-full h-64 relative mt-auto">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
          <defs>
            <linearGradient id="gradient-chart" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ff8e80" stopOpacity="0.3"></stop>
              <stop offset="100%" stopColor="#ff8e80" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path d="M0,280 L50,260 L100,270 L150,230 L200,240 L250,190 L300,210 L350,150 L400,165 L450,110 L500,130 L550,80 L600,100 L650,50 L700,70 L750,40 L800,60 L850,20 L900,45 L1000,10" fill="none" stroke="#ff8e80" strokeLinecap="round" strokeWidth="4"></path>
          <path d="M0,280 L50,260 L100,270 L150,230 L200,240 L250,190 L300,210 L350,150 L400,165 L450,110 L500,130 L550,80 L600,100 L650,50 L700,70 L750,40 L800,60 L850,20 L900,45 L1000,10 V300 H0 Z" fill="url(#gradient-chart)"></path>
        </svg>
        <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-zinc-500 font-bold px-1 mt-2">
          <span>AUG 01</span>
          <span>AUG 07</span>
          <span>AUG 14</span>
          <span>AUG 21</span>
          <span>AUG 30</span>
        </div>
      </div>
    </div>
  );
}
