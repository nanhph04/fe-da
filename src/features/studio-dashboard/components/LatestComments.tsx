export function LatestComments() {
  return (
    <div className="bg-[#131315] rounded-sm p-8 border border-[#262528] h-full flex flex-col">
      <h2 className="text-xl font-headline font-bold text-[#f9f5f8] mb-6">Latest Comments</h2>
      
      <div className="space-y-8 flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-[#262528]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD3FasPe2UBMX8apNRM-cwr5vrus_RpHtH0ARytfSB8LsZNzLez77WU_2371lyhm-Zci8Fkj_cCIkytAcGQsm3uzwijZwMbaix9XkoNSV_c-2RFQxApZHIf0A1phggPtefAQvmBXlcbhNx9iSOm12cYhiTDTCBr9xr07ibUyEmnn_X0nYQi3o77kNQiSGLN9-916J-K8WmJQcxgOow2GWTATyykeDnwUiuRiPdpkkavhP5oFJpoYnZ-sfYFIYnPuWkGUarin-nqs3_" alt="Avatar" />
            </div>
            <span className="text-xs font-bold text-[#f9f5f8]">Marcus_Vfx</span>
            <span className="text-[10px] text-zinc-600 font-bold">5m ago</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The color grading on this is absolutely insane. What LUT are you using for the shadows? <span className="text-[#ff8e80] font-medium hover:underline cursor-pointer">Reply</span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-[#262528]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6KlwblwOpgQnVQ85HvvHxJvIx76hEu0WS4R_En9FmhLwUV-k-0vW_WWCZa-tDXGVPESjPKtcNRHwibipFw0nEgRm9sk15Gd31FPnf2TZ5aw43g_Xg1e9nR-yqq3AjtWnOS4PZbi69nJ6qPghClmDIgA75Jmof2er-4hPnwxSr330HYKz9OVNi4n1nb8dmg8RlKFWbpHsbuxhA2C1243k5oEl5-fb6XgyEzehk-GGhPzpNPD1WveGZODOqNxLViG5fTR2tHmPUAa1t" alt="Avatar" />
            </div>
            <span className="text-xs font-bold text-[#f9f5f8]">Sintra_Studio</span>
            <span className="text-[10px] text-zinc-600 font-bold">1h ago</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Just dropped some Aura Coins for this masterpiece. Keep it coming! 🔥 <span className="text-[#ff8e80] font-medium hover:underline cursor-pointer">Reply</span>
          </p>
        </div>
      </div>
      
      <button className="w-full mt-10 bg-[#262528] text-white hover:bg-[#48474a] transition-colors py-3 rounded-sm text-xs font-headline font-bold uppercase tracking-widest">
        Manage All Comments
      </button>
    </div>
  );
}
