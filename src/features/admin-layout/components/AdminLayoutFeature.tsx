import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminLayoutFeature({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000] text-[#f9f5f8] font-body selection:bg-red-600/30">
      <AdminSidebar />
      <AdminHeader />
      <main className="ml-64 pt-24 pb-12 px-8 min-h-screen animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
