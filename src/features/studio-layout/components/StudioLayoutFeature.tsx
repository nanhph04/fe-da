import type { ReactNode } from "react";
import { StudioSidebar } from "./StudioSidebar";
import { StudioHeader } from "./StudioHeader";
import { StudioVideoStatusEventsProvider } from "./StudioVideoStatusEventsProvider";
import { StudioChannelStatusGuard } from "./StudioChannelStatusGuard";

export function StudioLayoutFeature({ children }: { children: ReactNode }) {
  return (
    <StudioVideoStatusEventsProvider>
      <StudioChannelStatusGuard />
      <StudioSidebar />
      <main className="md:ml-64 min-h-screen bg-background flex flex-col">
        <StudioHeader />
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </StudioVideoStatusEventsProvider>
  );
}
