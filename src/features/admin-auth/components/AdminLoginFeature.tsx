"use client";

import { useState } from "react";
import Link from "next/link";

export function AdminLoginFeature() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login logic, then route to Admin dashboard
    console.log("Admin login attempted");
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Security Grid Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#ff0000 1px, transparent 1px), linear-gradient(90deg, #ff0000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* Glitch/Glow decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-xl border border-red-900/30 p-8 z-10 relative shadow-[0_0_50px_rgba(255,0,0,0.1)] before:content-[''] before:absolute before:inset-0 before:border-t-2 before:border-red-600 before:w-1/3 before:left-1/3 before:opacity-50">
        
        {/* System Header */}
        <div className="text-center mb-10">
          <span className="material-symbols-outlined text-4xl text-red-600 mb-2">admin_panel_settings</span>
          <h1 className="text-3xl font-black text-white font-headline tracking-tighter uppercase">V-Console</h1>
          <p className="text-[10px] text-red-500/70 font-bold tracking-[0.3em] uppercase mt-1">Classified Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Administrator UID</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3.5 text-zinc-600 text-sm">badge</span>
              <input 
                type="text" 
                required
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                placeholder="ADM-XXXX"
                className="w-full bg-[#111] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-black rounded-none py-3 pl-10 pr-4 text-white font-mono text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Access Key</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3.5 text-zinc-600 text-sm">vpn_key</span>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-black rounded-none py-3 pl-10 pr-4 text-white font-mono text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest block flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">security</span> 2FA Protocol
            </label>
            <input 
              type="text" 
              required
              maxLength={6}
              value={passcode}
              onChange={e => setPasscode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full bg-[#111] border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-black rounded-none py-3 px-4 text-white font-mono text-center tracking-[1em] transition-all outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black font-headline uppercase tracking-widest text-xs py-4 transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-[0.98]"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-900 pt-6">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Unauthorized access is strictly prohibited and logged.
          </p>
          <Link href="/" className="text-[10px] text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest mt-4 block underline">
            Return to Public Portal
          </Link>
        </div>
      </div>
      
      {/* System info / Footer */}
      <div className="absolute bottom-4 left-6 text-[10px] text-zinc-700 font-mono flex gap-6">
        <span>SYS.STAT: <span className="text-green-500">ONLINE</span></span>
        <span>VER: 4.2.1-BETA</span>
      </div>
      <div className="absolute top-4 right-6 text-[10px] text-zinc-700 font-mono">
        AURA CINEMATIC CORE
      </div>
    </div>
  );
}
