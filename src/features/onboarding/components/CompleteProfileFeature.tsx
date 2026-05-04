"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PublicHeader } from "@/components/layout/public/PublicHeader";


export function CompleteProfileFeature() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = "/"; // Redirect to home
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] p-6 pt-28 font-body">
      <PublicHeader currentPath="/onboarding" subtitle="Auth / Onboarding" showAuthActions={false} />
      <div className="max-w-2xl w-full bg-[#131313] rounded-2xl border border-[#262626] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 fade-in duration-700">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#e11d48] to-[#1a1a1a] relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-4 border-[#131313] flex items-center justify-center relative cursor-pointer group overflow-hidden">
              <span className="material-symbols-outlined text-4xl text-[#adaaaa] group-hover:hidden">person</span>
              <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center transition-all">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-16 space-y-8">
          <div>
            <h1 className="text-3xl font-black font-headline text-[#f9f5f8] tracking-tighter">Complete Your Profile</h1>
            <p className="text-[#adaaaa] mt-2">Personalize your identity in the Velvet Gallery community.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#adaaaa] mb-2 uppercase tracking-wider">Display Name</label>
              <Input 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                required
                className="w-full bg-[#1a1a1a] border-[#262626] rounded-md py-6 px-4 text-[#f9f5f8] focus-visible:ring-[#e11d48]" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#adaaaa] mb-2 uppercase tracking-wider">Bio</label>
              <Textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a bit about yourself..."
                rows={4}
                className="w-full bg-[#1a1a1a] border-[#262626] rounded-md p-4 text-[#f9f5f8] focus-visible:ring-[#e11d48] resize-none" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#262626] flex justify-end gap-4">
            <Button type="button" variant="outline" className="border-[#262626] text-[#adaaaa] hover:text-white bg-transparent hover:bg-[#1a1a1a]">
              Skip for now
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#be123c] hover:to-[#9f1239] text-white px-8 rounded-md font-bold"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
