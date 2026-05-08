"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { getErrorMessage } from "@/shared/api/client";

export function AdminLoginFeature() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { setAuthData } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data?.accessToken) {
        const profile = await setAuthData(res.data.accessToken);
        if (!profile) {
          setServerError("Failed to load your profile after login.");
          return;
        }
        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/library");
        }
      } else {
        setServerError(res.mess || "Login failed");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Authentication failed"));
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-black text-white font-headline tracking-tighter uppercase">Velvet Gallery</h1>
          <p className="text-[10px] text-red-500/70 font-bold tracking-[0.3em] uppercase mt-1">Classified Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Administrator Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3.5 text-zinc-600 text-sm">alternate_email</span>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@console.com"
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

          {serverError && (
            <div className="p-3 bg-[#ff0000]/10 border border-[#ff0000]/30 rounded-none w-full">
              <p className="text-xs text-[#ff0000] text-center font-mono">{serverError}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="flex justify-center items-center w-full bg-red-600 hover:bg-red-500 text-white font-black font-headline uppercase tracking-widest text-xs py-4 transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {isLoading ? "Authenticating..." : "Authenticate"}
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
        VELVET GALLERY CORE
      </div>
    </div>
  );
}
