"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminSettingsFeature() {
  const [platformFee, setPlatformFee] = useState("15");
  const [minWithdrawal, setMinWithdrawal] = useState("5000");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="flex-1 space-y-8 p-8 md:p-12 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#f9f5f8] tracking-tight font-headline">System Settings</h1>
          <p className="text-[#adaaaa] mt-1 text-lg">Manage platform-wide configurations and operational parameters.</p>
        </div>
        <Button className="bg-[#e11d48] hover:bg-[#be123c] text-white px-8 py-2 h-auto text-md font-bold rounded-md shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all">
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Settings Categories */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Financial Settings */}
          <section className="bg-[#131313] p-8 rounded-xl border border-[#262626]">
            <h2 className="text-xl font-bold text-[#f9f5f8] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e11d48]">payments</span>
              Financial Parameters
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#adaaaa] mb-2 uppercase tracking-wider">Platform Fee (%)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    className="w-full bg-[#1a1a1a] border-[#262626] rounded-md py-6 px-4 text-[#f9f5f8] focus-visible:ring-[#e11d48] text-lg font-bold" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adaaaa] font-bold">%</span>
                </div>
                <p className="text-xs text-[#565555] mt-2">Percentage deducted from creator earnings per transaction.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#adaaaa] mb-2 uppercase tracking-wider">Minimum Withdrawal (AC)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={minWithdrawal}
                    onChange={(e) => setMinWithdrawal(e.target.value)}
                    className="w-full bg-[#1a1a1a] border-[#262626] rounded-md py-6 px-4 text-[#f9f5f8] focus-visible:ring-[#e11d48] text-lg font-bold" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f59e0b] font-bold">AC</span>
                </div>
                <p className="text-xs text-[#565555] mt-2">Minimum Aura Coins required before a creator can request payout.</p>
              </div>
            </div>
          </section>

          {/* Operational Settings */}
          <section className="bg-[#131313] p-8 rounded-xl border border-[#262626]">
            <h2 className="text-xl font-bold text-[#f9f5f8] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e11d48]">settings_applications</span>
              Operational Mode
            </h2>
            
            <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div>
                <h3 className="font-bold text-[#f9f5f8]">Maintenance Mode</h3>
                <p className="text-sm text-[#adaaaa]">Disable access to the platform for all non-admin users.</p>
              </div>
              
              <button 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${maintenanceMode ? 'bg-[#e11d48]' : 'bg-[#262626]'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${maintenanceMode ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Status/Info */}
        <div className="space-y-6">
          <div className="bg-[#131313] p-6 rounded-xl border border-[#262626]">
            <h3 className="font-bold text-[#f9f5f8] mb-4 uppercase tracking-wider text-sm">System Status</h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="text-[#adaaaa]">Identity Service</span>
                <span className="text-green-500 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">ONLINE</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-[#adaaaa]">Media Service</span>
                <span className="text-green-500 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">ONLINE</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-[#adaaaa]">Payment Gateway</span>
                <span className="text-green-500 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">ONLINE</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#484847]/30 text-center">
            <span className="material-symbols-outlined text-4xl text-[#f59e0b] mb-2">security</span>
            <h4 className="font-bold text-[#f9f5f8]">Security Audit</h4>
            <p className="text-sm text-[#adaaaa] mt-2 mb-4">Last audit performed 2 days ago. No critical vulnerabilities found.</p>
            <Button variant="outline" className="w-full bg-transparent border-[#262626] text-[#adaaaa] hover:text-white">
              View Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
