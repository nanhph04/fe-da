import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.12),transparent_48%)]" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
