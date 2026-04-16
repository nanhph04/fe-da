import { StudioSidebar } from "./StudioSidebar";
import { StudioHeader } from "./StudioHeader";

export function StudioLayoutFeature({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StudioSidebar />
      <main className="md:ml-64 min-h-screen bg-[#0e0e10] flex flex-col">
        <StudioHeader />
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </>
  );
}
